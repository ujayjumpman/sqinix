// Renders every procedural scene and encodes the web assets.
//
//   node scripts/render-all.mjs [--only rig,gpu] [--skip-hero] [--quality 74]
//
// Pipeline per scene:  render PNG frames (headless Chrome + three.js)
//                      -> make-sequence.mjs -> public/media/sequences/<scene>/{desktop,mobile}/
// Cards:               make-cards.mjs -> public/media/sequences/<scene>/card.webp (3:2 stills for cards/menus)
// Hero loop:           render --loop -> make-video.mjs -> public/media/video/hero*.{mp4,webm}

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i === -1 ? d : args[i + 1];
};
const only = opt("only", null)?.split(",");
const quality = opt("quality", "74");

const jobs = [
  { scene: "rig", desktop: 150, mobile: 90 },
  { scene: "gpu", desktop: 120, mobile: 72 },
  { scene: "laptop", desktop: 120, mobile: 72 },
  { scene: "servers", desktop: 150, mobile: 90 },
  { scene: "keyboard", desktop: 120, mobile: 72 },
].filter((j) => !only || only.includes(j.scene));

const node = (script, a) => {
  const r = spawnSync(process.execPath, [path.join(root, script), ...a], { stdio: "inherit", cwd: root });
  if (r.status !== 0) throw new Error(`${script} ${a.join(" ")} failed`);
};
const framesDir = (name) => path.join("scripts/.tmp/frames", name);

for (const j of jobs) {
  for (const variant of ["desktop", "mobile"]) {
    const n = j[variant];
    const dir = framesDir(`${j.scene}-${variant}`);
    fs.rmSync(path.join(root, dir), { recursive: true, force: true });
    node("scripts/render/render.mjs", [j.scene, "--frames", String(n), ...(variant === "mobile" ? ["--mobile"] : []), "--out", dir]);
    node("scripts/make-sequence.mjs", [dir, j.scene, "--variant", variant, "--quality", quality]);
  }
}

if (!only) node("scripts/make-cards.mjs", []);

if (!args.includes("--skip-hero") && (!only || only.includes("hero"))) {
  const dir = framesDir("hero-video");
  fs.rmSync(path.join(root, dir), { recursive: true, force: true });
  node("scripts/render/render.mjs", ["hero", "--frames", "180", "--loop", "--w", "1920", "--h", "1080", "--out", dir]);
  node("scripts/make-video.mjs", [dir, "hero", "--fps", "30"]);
  const mdir = framesDir("hero-video-m");
  fs.rmSync(path.join(root, mdir), { recursive: true, force: true });
  node("scripts/render/render.mjs", ["hero", "--mobile", "--frames", "180", "--loop", "--out", mdir]);
  node("scripts/make-video.mjs", [mdir, "hero", "--fps", "30", "--mobile-only"]);
}
console.log("\nall renders done");
