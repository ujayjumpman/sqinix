// Generates favicon / touch icon / social-share image from the traced logo and the rendered posters.
//   node scripts/make-brand-assets.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mark = path.join(root, "public/brand/logo-mark.svg");
const BG = "#05070b";

async function icon(size, out, pad = 0.2) {
  const inner = Math.round(size * (1 - pad * 2));
  const m = await sharp(mark, { density: 300 }).resize({ height: inner, fit: "inside" }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: m, gravity: "center" }])
    .png()
    .toFile(out);
}

await icon(512, path.join(root, "app/icon.png"), 0.16);
await icon(180, path.join(root, "app/apple-icon.png"), 0.18);
fs.rmSync(path.join(root, "app/favicon.ico"), { force: true });

// Open Graph image 1200x630: poster backdrop + logo + line of copy
const poster = path.join(root, "public/media/sequences/rig/card.webp");
const logo = await sharp(path.join(root, "public/brand/logo.svg"), { density: 200 }).resize({ width: 380 }).png().toBuffer();
const bg = await sharp(poster).resize(1200, 630, { fit: "cover", position: "centre" }).modulate({ brightness: 0.62 }).toBuffer();
const shade = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${BG}" stop-opacity=".96"/><stop offset=".62" stop-color="${BG}" stop-opacity=".55"/><stop offset="1" stop-color="${BG}" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/>
  <text x="70" y="330" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="74" font-weight="700" fill="#f1f6ff" letter-spacing="-2">Hardware that</text>
  <text x="70" y="410" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="74" font-weight="700" fill="#52b8ec" letter-spacing="-2">performs.</text>
  <text x="72" y="478" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="27" fill="#93a0b4">Gaming PCs · Business IT · Servers &amp; networking · Consulting</text>
  <text x="72" y="578" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24" fill="#93a0b4" letter-spacing="1">squinix.com · Noida West, India</text></svg>`
);
await sharp(bg)
  .composite([{ input: shade }, { input: logo, left: 70, top: 70 }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "public/og.png"));
console.log("brand assets written");
