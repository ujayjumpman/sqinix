// Transcodes a source clip (or a PNG frame folder) into web-ready loop video.
//
//   node scripts/make-video.mjs <video | frames-dir> <name> [--fps 30] [--width 1920] [--crf 27] [--mobile-width 960]
//   node scripts/make-video.mjs <portrait source> <name> --mobile-only [--mobile-width 720]   (writes only the -m files)
//
// Output in public/media/video/:
//   <name>.mp4 / <name>.webm      desktop (H.264 + VP9, no audio, faststart)
//   <name>-m.mp4 / <name>-m.webm  mobile  (smaller)
//   <name>-poster.webp            first frame

import fs from "node:fs";
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
  console.error("usage: node scripts/make-video.mjs <video | frames-dir> <name> [--fps 30] [--width 1920] [--crf 27]");
  process.exit(1);
}
const fps = Number(opt("fps", 30));
const width = Number(opt("width", 1920));
const mobileOnly = args.includes("--mobile-only");
const mWidth = Number(opt("mobile-width", mobileOnly ? 720 : 960));
const crf = Number(opt("crf", 27));
const abs = path.resolve(root, input);
const outDir = path.join(root, "public/media/video");
fs.mkdirSync(outDir, { recursive: true });

const src = fs.statSync(abs).isDirectory() ? ["-framerate", String(fps), "-i", path.join(abs, "%04d.png")] : ["-i", abs];
const run = (extra, out) => {
  const r = spawnSync(ffmpegPath, ["-y", ...src, "-an", ...extra, out], { stdio: ["ignore", "ignore", "pipe"], encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg failed for ${out}\n${r.stderr.slice(-800)}`);
  console.log(`${path.relative(root, out)}  ${(fs.statSync(out).size / 1048576).toFixed(2)} MB`);
};
const vf = (w) => ["-vf", `scale=${w}:-2:flags=lanczos,format=yuv420p`];

if (!mobileOnly) run([...vf(width), "-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-movflags", "+faststart", "-pix_fmt", "yuv420p", "-r", String(fps)], path.join(outDir, `${name}.mp4`));
run([...vf(mWidth), "-c:v", "libx264", "-preset", "slow", "-crf", String(crf + 3), "-movflags", "+faststart", "-pix_fmt", "yuv420p", "-r", String(fps)], path.join(outDir, `${name}-m.mp4`));
if (!mobileOnly) run([...vf(width), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf + 5), "-row-mt", "1", "-r", String(fps)], path.join(outDir, `${name}.webm`));
run([...vf(mWidth), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf + 8), "-row-mt", "1", "-r", String(fps)], path.join(outDir, `${name}-m.webm`));

// poster = first frame
const posterName = mobileOnly ? `${name}-m-poster.webp` : `${name}-poster.webp`;
const tmpPng = path.join(outDir, `.${name}-poster.png`);
const r = spawnSync(ffmpegPath, ["-y", ...src, "-frames:v", "1", tmpPng], { stdio: "ignore" });
if (r.status === 0) {
  await sharp(tmpPng).resize({ width: mobileOnly ? mWidth : width }).webp({ quality: 78 }).toFile(path.join(outDir, posterName));
  fs.rmSync(tmpPng);
}
