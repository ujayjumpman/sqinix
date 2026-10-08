// Accessibility scan (axe-core) of every route at desktop + mobile size against out/.
//   node scripts/a11y.mjs        -> exits 1 on serious/critical violations
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routes = ["/", "/products/gaming/", "/products/business/", "/products/infrastructure/", "/products/peripherals/", "/services/", "/about/", "/contact/", "/no-such-page/"];
const port = 4174;
const server = spawn(process.execPath, [path.join(root, "node_modules/serve/build/main.js"), path.join(root, "out"), "-l", String(port), "--no-clipboard"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 1500));
const browser = await chromium.launch({ channel: "chrome" });
let bad = 0;
for (const vp of [{ w: 1440, h: 900, n: "desktop" }, { w: 390, h: 844, n: "mobile" }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, reducedMotion: "reduce" }); // reduced motion = all text visible, stable layout
  for (const r of routes) {
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}${r}`);
    await page.waitForTimeout(1200);
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
    const v = res.violations.filter((x) => ["serious", "critical"].includes(x.impact ?? ""));
    const minor = res.violations.length - v.length;
    console.log(`${v.length ? "FAIL" : "ok  "} ${vp.n.padEnd(7)} ${r.padEnd(28)} serious/critical: ${v.length}  other: ${minor}`);
    for (const x of v) {
      bad++;
      console.log(`     - [${x.impact}] ${x.id}: ${x.help} (${x.nodes.length} node${x.nodes.length > 1 ? "s" : ""})  e.g. ${x.nodes[0].target.join(" ")}`);
    }
    for (const x of res.violations.filter((x) => !v.includes(x))) console.log(`     · [${x.impact}] ${x.id}: ${x.help} (${x.nodes.length})`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
server.kill();
console.log(bad ? `\n${bad} serious/critical violation(s)` : "\nno serious/critical accessibility violations");
process.exit(bad ? 1 : 0);
