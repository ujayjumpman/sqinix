// Renders a procedural 3D scene to a PNG frame sequence using headless Chrome.
//
//   node scripts/render/render.mjs <scene> [--frames 120] [--w 1440] [--h 810]
//        [--mobile] [--out scripts/.tmp/frames/<scene>-desktop] [--from 0] [--to N-1]
//        [--loop]   (render frames 0..N-1 of N so frame N == frame 0 - seamless loops)
//
// Then encode with: node scripts/make-sequence.mjs <frames-dir> <name>

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const args = process.argv.slice(2);
const scene = args[0];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1];
};
const flag = (name) => args.includes(`--${name}`);
if (!scene) {
  console.error("usage: node scripts/render/render.mjs <scene> [options]");
  process.exit(1);
}
const mobile = flag("mobile");
const frames = Number(opt("frames", 120));
const W = Number(opt("w", mobile ? 720 : 1440));
const H = Number(opt("h", mobile ? 960 : 810));
const out = path.resolve(root, opt("out", `scripts/.tmp/frames/${scene}-${mobile ? "mobile" : "desktop"}`));
const from = Number(opt("from", 0));
const to = Number(opt("to", frames - 1));
fs.mkdirSync(out, { recursive: true });

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg" };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": types[path.extname(p)] ?? "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const browser = await chromium.launch({
  channel: process.env.RENDER_CHANNEL ?? "chrome",
  args: ["--ignore-gpu-blocklist", "--enable-webgl", "--enable-unsafe-swiftshader", ...(process.env.RENDER_ANGLE ? [`--use-angle=${process.env.RENDER_ANGLE}`] : [])],
});
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[page]", m.text()); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`http://127.0.0.1:${port}/scripts/render/page.html?scene=${scene}&w=${W}&h=${H}&mobile=${mobile ? 1 : 0}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
console.log("renderer:", JSON.stringify(await page.evaluate(() => window.__info())));
console.log(`rendering ${scene}: ${W}x${H}, frames ${from}..${to} of ${frames} -> ${path.relative(root, out)}`);

const t0 = Date.now();
for (let i = from; i <= to; i++) {
  // total = frames-1 so the last frame lands exactly on t=1 (unless --loop)
  const total = flag("loop") ? frames : frames - 1;
  const url = await page.evaluate(([i, total]) => window.renderFrame(i, total), [i, total]);
  fs.writeFileSync(path.join(out, `${String(i + 1).padStart(4, "0")}.png`), Buffer.from(url.split(",")[1], "base64"));
  if ((i - from) % 10 === 0) console.log(`  frame ${i + 1}/${frames}  ${((Date.now() - t0) / 1000 / (i - from + 1)).toFixed(2)}s/frame`);
}
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
await browser.close();
server.close();
