// End-to-end smoke test against the static export (out/).
//
//   npm run build && node scripts/smoke.mjs [--reduced] [--only /,/about/] [--shots]
//
// For each route at desktop + mobile size it:
//   - fails on console errors, page errors and failed same-origin requests
//   - scrolls through every [data-sequence] film and checks that the painted frame advances
//   - checks there is no horizontal overflow
//   - (--shots) saves screenshots to scripts/.tmp/shots/
// With --reduced it emulates prefers-reduced-motion and checks the static fallbacks render.

import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const reduced = args.includes("--reduced");
const shots = args.includes("--shots");
const onlyIdx = args.indexOf("--only");
const routes = (onlyIdx >= 0 ? args[onlyIdx + 1].split(",") : ["/", "/products/gaming/", "/products/business/", "/products/infrastructure/", "/products/peripherals/", "/services/", "/about/", "/contact/", "/no-such-page/"]);
const shotDir = path.join(root, "scripts/.tmp/shots");
if (shots) fs.mkdirSync(shotDir, { recursive: true });

const port = 4173;
const free = await new Promise((res) => {
  const s = net.createServer().once("error", () => res(false)).once("listening", () => s.close(() => res(true))).listen(port, "127.0.0.1");
});
let server = null;
if (free) {
  server = spawn(process.execPath, [path.join(root, "node_modules/serve/build/main.js"), path.join(root, "out"), "-l", String(port), "--no-clipboard"], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 1500));
}
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({ channel: "chrome", args: ["--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"] });
const problems = [];
const log = (...a) => console.log(...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const vp of [
  { name: "desktop", viewport: { width: 1440, height: 900 }, isMobile: false },
  { name: "mobile", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
]) {
  const ctx = await browser.newContext({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor ?? 1, reducedMotion: reduced ? "reduce" : "no-preference" });
  for (const route of routes) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("console", (m) => m.type() === "error" && !/favicon|404 \(Not Found\)/.test(m.text() + m.location().url) && errs.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`));
    page.on("requestfailed", (r) => r.url().startsWith(base) && !r.failure()?.errorText.includes("ABORTED") && errs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
    page.on("request", (r) => { const u = new URL(r.url()); if (!["127.0.0.1", "localhost"].includes(u.hostname) && u.protocol.startsWith("http")) errs.push(`external request (breaks offline demo): ${r.url()}`); });
    page.on("response", (r) => r.url().startsWith(base) && r.status() >= 400 && route !== "/no-such-page/" && errs.push(`http ${r.status()}: ${r.url()}`));

    const t0 = Date.now();
    const res = await page.goto(base + route, { waitUntil: "load" });
    const expected = route === "/no-such-page/" ? 404 : 200;
    if (res?.status() !== expected) errs.push(`status ${res?.status()} (expected ${expected})`);
    await page.waitForFunction(() => window.__sqxReady === true, null, { timeout: 8000 }).catch(() => errs.push("preloader never finished"));
    await sleep(700);

    const title = await page.title();
    const h1 = await page.locator("h1").first().innerText().catch(() => "");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) errs.push(`horizontal overflow: ${overflow}px`);
    const badLinks = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => !h || h === "#" || h.includes("yoursite")));
    if (badLinks.length) errs.push(`placeholder links: ${badLinks.join(",")}`);

    if (shots) await page.screenshot({ path: path.join(shotDir, `${vp.name}${route.replace(/\//g, "_")}top.png`) });

    // scrub every film
    const seqs = await page.$$eval("[data-sequence]", (els) => els.map((e) => e.getAttribute("data-sequence")));
    const results = [];
    for (let s = 0; s < seqs.length; s++) {
      const info = await page.evaluate((i) => {
        const el = document.querySelectorAll("[data-sequence]")[i];
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, h: el.offsetHeight, vh: innerHeight };
      }, s);
      const frames = [];
      for (const p of [0.02, 0.25, 0.5, 0.75, 0.98]) {
        await page.evaluate((y) => window.scrollTo(0, y), info.top + p * (info.h - info.vh));
        await sleep(reduced ? 150 : 1100);
        const f = await page.evaluate((i) => {
          const el = document.querySelectorAll("[data-sequence]")[i];
          return { frame: Number(el.dataset.frame ?? -1), loaded: Number(el.dataset.loaded ?? 0), total: Number(el.dataset.frames ?? 0) };
        }, s);
        frames.push(f.frame);
        if (shots && [0.25, 0.75].includes(p)) await page.screenshot({ path: path.join(shotDir, `${vp.name}${route.replace(/\//g, "_")}seq${s}-${Math.round(p * 100)}.png`) });
        if (p === 0.98) results.push({ seq: seqs[s], frames, loaded: f.loaded, total: f.total });
      }
      if (!reduced) {
        const increasing = frames.every((v, i) => i === 0 || v > frames[i - 1]);
        if (!increasing) errs.push(`sequence "${seqs[s]}" frames did not advance monotonically: ${frames.join(",")}`);
      }
    }
    if (reduced && seqs.length) errs.push("reduced motion: pinned film should be replaced by the static layout");

    // full-page sweep so lazy things fire; then bottom screenshot
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await sleep(500);
    if (shots) await page.screenshot({ path: path.join(shotDir, `${vp.name}${route.replace(/\//g, "_")}bottom.png`) });

    log(`${errs.length ? "FAIL" : "ok  "} ${vp.name.padEnd(7)} ${route.padEnd(28)} ${String(res?.status())} "${h1.slice(0, 38)}" ${results.map((r) => `${r.seq}[${r.frames.join(">")} of ${r.total}, loaded ${r.loaded}]`).join(" ")} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    errs.forEach((e) => {
      log("     -", e);
      problems.push(`${vp.name} ${route}: ${e}`);
    });
    void title;
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server?.kill();
console.log(problems.length ? `\n${problems.length} problem(s)` : "\nall routes clean");
process.exit(problems.length ? 1 : 0);
