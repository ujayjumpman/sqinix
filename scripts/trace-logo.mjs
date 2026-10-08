// Traces the raster Squinix logo (media-src/SS_logo.png) into SVG paths.
//
//   node scripts/trace-logo.mjs [path/to/logo.png]
//
// Outputs:
//   public/brand/logo.svg, logo-mark.svg, logo-wordmark.svg
//
// The mark is traced as a silhouette plus stacked luminance layers so the
// original navy -> sky-blue ribbon gradient can be rebuilt as smooth vector
// art. If the client supplies a real vector logo, drop it into public/brand/.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import potrace from "potrace";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.resolve(process.argv[2] ?? path.join(root, "media-src/SS_logo.png"));
const SCALE = 4;
const tmpDir = path.join(root, "scripts/.tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const roundD = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(1)));

function trace(buf, options) {
  return new Promise((resolve, reject) => {
    potrace.trace(buf, { background: "transparent", turdSize: 10, optTolerance: 0.9, ...options }, (err, svg) => {
      if (err) return reject(err);
      const d = /<path d="([^"]+)"/.exec(svg)?.[1];
      resolve(roundD(d ?? ""));
    });
  });
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const isInk = (i) => data[i + 3] > 60 && !(data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235);

// 1. bounding box + the gap that separates the mark from the wordmark
let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0;
const colInk = new Array(info.width).fill(0);
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    if (isInk((y * info.width + x) * 4)) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      colInk[x]++;
    }
  }
}
let markEnd = x0;
while (colInk[markEnd] > 0 || colInk[markEnd + 1] > 0) markEnd++;
let wordStart = markEnd;
while (colInk[wordStart] === 0) wordStart++;
const pad = 3;
const region = {
  mark: { left: x0 - pad, top: y0 - pad, width: markEnd - x0 + 1 + pad * 2, height: y1 - y0 + 1 + pad * 2 },
  word: { left: wordStart - pad, top: y0 - pad, width: x1 - wordStart + 1 + pad * 2, height: y1 - y0 + 1 + pad * 2 },
};

// 2. average wordmark colour
let r = 0, g = 0, b = 0, n = 0;
for (let y = region.word.top; y < region.word.top + region.word.height; y++) {
  for (let x = region.word.left; x < region.word.left + region.word.width; x++) {
    const i = (y * info.width + x) * 4;
    if (data[i + 3] > 250 && isInk(i)) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  }
}
const hex = (v) => Math.round(v).toString(16).padStart(2, "0");
const wordColor = `#${hex(r / n)}${hex(g / n)}${hex(b / n)}`;

async function prepared(area) {
  return sharp(input)
    .extract(area)
    .flatten({ background: "#ffffff" })
    .resize({ width: area.width * SCALE, kernel: "lanczos3" })
    .greyscale()
    .png()
    .toBuffer();
}

const markBuf = await prepared(region.mark);
const wordBuf = await prepared(region.word);
const markW = region.mark.width * SCALE, markH = region.mark.height * SCALE;
const wordW = region.word.width * SCALE, wordH = region.word.height * SCALE;

// 3. silhouette + luminance layers (light -> dark). Colours interpolate
//    between sky blue (light pixels) and navy (dark pixels).
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const sky = [82, 184, 236], navy = [44, 72, 138];
const toHex = (c) => "#" + c.map((v) => hex(v)).join("");
const thresholds = [235, 195, 165, 135, 105, 85];
const silhouette = await trace(markBuf, { threshold: thresholds[0], color: "#000" });
const layers = [];
for (let i = 1; i < thresholds.length; i++) {
  const t = (i - 1) / (thresholds.length - 2);
  const d = await trace(markBuf, { threshold: thresholds[i], color: "#000" });
  if (d) layers.push({ d, color: toHex(lerp(sky, navy, t)) });
}
const wordPath = await trace(wordBuf, { threshold: 200, color: wordColor });

// 4. emit files
const outDir = path.join(root, "public/brand");
fs.mkdirSync(outDir, { recursive: true });

const gradDefs = `<defs><clipPath id="sx-mark"><path d="${silhouette}"/></clipPath><filter id="sx-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${(SCALE * 2.2).toFixed(1)}"/></filter></defs>`;
const markInner = `${gradDefs}<g clip-path="url(#sx-mark)"><path d="${silhouette}" fill="${toHex(sky)}"/><g filter="url(#sx-soft)">${layers
  .map((l) => `<path d="${l.d}" fill="${l.color}"/>`)
  .join("")}</g></g>`;

fs.writeFileSync(path.join(outDir, "logo-mark.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${markW} ${markH}">${markInner}</svg>`);
fs.writeFileSync(path.join(outDir, "logo-wordmark.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wordW} ${wordH}"><path d="${wordPath}" fill="${wordColor}"/></svg>`);

const gap = 14 * SCALE;
const totalW = markW + gap + wordW;
fs.writeFileSync(
  path.join(outDir, "logo.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${markH}"><g>${markInner}</g><g transform="translate(${markW + gap} 0)"><path d="${wordPath}" fill="${wordColor}"/></g></svg>`
);

console.log("wordmark colour", wordColor);
console.log("mark", markW, "x", markH, "| wordmark", wordW, "x", wordH, "| layers", layers.length);
