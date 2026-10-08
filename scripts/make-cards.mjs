// Renders a 3:2 "card" still for each film (used by the product showcase, mega menu and related-product cards).
//
//   node scripts/make-cards.mjs [--only gpu,laptop]
//
// A card is the scene rendered at a chosen moment of its film (t = 0..1), not the opening frame,
// which is composed to leave room for the headline. Output: public/media/sequences/<name>/card.webp
// When real footage replaces a film, pass --from-seq to grab the frame at `t` from the encoded sequence instead.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;
const fromSeq = args.includes("--from-seq");

// moment of each film that reads best as a still
const AT = { rig: 0.78, gpu: 0.3, laptop: 0.62, servers: 0.4, keyboard: 0.42 };
const STEPS = 100; // t = i / STEPS

for (const [scene, t] of Object.entries(AT)) {
  if (only && !only.includes(scene)) continue;
  const dest = path.join(root, "public/media/sequences", scene, "card.webp");
  if (fromSeq) {
    const dir = path.join(root, "public/media/sequences", scene, "desktop");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".webp")).sort();
    await sharp(path.join(dir, files[Math.round(t * (files.length - 1))])).resize(1200, 800, { fit: "cover" }).webp({ quality: 82 }).toFile(dest);
  } else {
    const out = path.join("scripts/.tmp/frames", `card-${scene}`);
    fs.rmSync(path.join(root, out), { recursive: true, force: true });
    const i = Math.round(t * STEPS);
    const r = spawnSync(process.execPath, [path.join(root, "scripts/render/render.mjs"), scene, "--frames", String(STEPS + 1), "--from", String(i), "--to", String(i), "--w", "1200", "--h", "800", "--out", out], { stdio: "inherit", cwd: root });
    if (r.status !== 0) throw new Error(`render failed for ${scene}`);
    const png = fs.readdirSync(path.join(root, out)).find((f) => f.endsWith(".png"));
    await sharp(path.join(root, out, png)).webp({ quality: 82 }).toFile(dest);
  }
  console.log(`card ${scene} @ t=${t} -> ${path.relative(root, dest)} (${(fs.statSync(dest).size / 1024).toFixed(0)} KB)`);
}
