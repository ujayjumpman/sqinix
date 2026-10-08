// Turns a folder of frames (PNG/JPG) or a video file into a scroll-scrub frame sequence.
//
//   node scripts/make-sequence.mjs <frames-dir | video.mp4> <name> [options]
//
//   --variant desktop|mobile   default desktop
//   --width <px>               output width (default 1440 desktop / 720 mobile)
//   --height <px>              mobile only: centre-crop to this height (default 960)
//   --frames <n>               resample to n frames (default: keep all)
//   --quality <1-100>          WebP quality (default 74)
//
// Output: public/media/sequences/<name>/<variant>/0001.webp ... plus
//         public/media/sequences/<name>/manifest.json and poster-<variant>.webp
//
// Works the same for the rendered placeholder frames and for real Squinix
// footage: pass a .mp4/.mov and the frames are extracted with ffmpeg first.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const [input, name] = args;
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i === -1 ? d : args[i + 1];
};
if (!input || !name) {
  console.error("usage: node scripts/make-sequence.mjs <frames-dir | video> <name> [--variant desktop|mobile] [--width n] [--frames n] [--quality n]");
  process.exit(1);
}
const variant = opt("variant", "desktop");
const width = Number(opt("width", variant === "mobile" ? 720 : 1440));
const cropH = variant === "mobile" ? Number(opt("height", 960)) : null;
const quality = Number(opt("quality", 74));
const want = opt("frames", null) ? Number(opt("frames")) : null;

const abs = path.resolve(root, input);
let frames;
let tmp = null;
if (fs.statSync(abs).isDirectory()) {
  frames = fs.readdirSync(abs).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort().map((f) => path.join(abs, f));
} else {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sqx-seq-"));
  const dur = Number(
    /Duration: (\d+):(\d+):([\d.]+)/.exec(spawnSync(ffmpegPath, ["-i", abs], { encoding: "utf8" }).stderr)?.slice(1).reduce((a, v, i) => a + Number(v) * [3600, 60, 1][i], 0)
  );
  const n = want ?? 120;
  const fps = n / (dur || 5);
  const r = spawnSync(ffmpegPath, ["-y", "-i", abs, "-vf", `fps=${fps}`, "-frames:v", String(n), path.join(tmp, "f%04d.png")], { stdio: "ignore" });
  if (r.status !== 0) throw new Error("ffmpeg failed");
  frames = fs.readdirSync(tmp).sort().map((f) => path.join(tmp, f));
}
if (want && frames.length !== want) {
  const picked = [];
  for (let i = 0; i < want; i++) picked.push(frames[Math.round((i * (frames.length - 1)) / (want - 1))]);
  frames = picked;
}
if (!frames.length) throw new Error("no frames found");

const outDir = path.join(root, "public/media/sequences", name, variant);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

let bytes = 0, w = 0, h = 0;
for (let i = 0; i < frames.length; i++) {
  let img = sharp(frames[i]).resize({ width, kernel: "lanczos3" });
  if (cropH) img = img.resize({ width, height: cropH, fit: "cover", position: "centre" });
  const buf = await img.webp({ quality, effort: 5, smartSubsample: true }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(outDir, `${String(i + 1).padStart(4, "0")}.webp`), buf.data);
  bytes += buf.data.length;
  w = buf.info.width; h = buf.info.height;
  if (i === 0) fs.writeFileSync(path.join(root, "public/media/sequences", name, `poster-${variant}.webp`), buf.data);
}

const manifestPath = path.join(root, "public/media/sequences", name, "manifest.json");
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : { name };
manifest[variant] = { count: frames.length, width: w, height: h, ext: "webp", pad: 4 };
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${name}/${variant}: ${frames.length} frames, ${w}x${h}, ${(bytes / 1048576).toFixed(2)} MB (avg ${(bytes / frames.length / 1024).toFixed(0)} KB)`);
