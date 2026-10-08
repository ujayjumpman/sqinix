// Post-build fix-ups for the static export in out/.
//
// 1. Prefetch payloads. The client requests flat segment files such as
//    /contact/__next.contact.__PAGE__.txt, but a Windows build writes them as
//    nested folders (/contact/__next.contact/__PAGE__.txt). Plain static servers
//    (Apache, serve, nginx) then answer 404 and every link prefetch fails.
//    We write the flat name next to each nested file so both layouts exist.
//
// 2. Prints a size summary of the export.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../out");
if (!fs.existsSync(out)) {
  console.error("out/ not found - run next build first");
  process.exit(1);
}

let created = 0;
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) {
      flatten(p, e.name, dir);
    } else if (e.name !== "_next" && e.name !== "media") {
      walk(p);
    }
  }
}
function flatten(dir, prefix, parent) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) flatten(p, `${prefix}.${e.name}`, parent);
    else if (e.name.endsWith(".txt")) {
      const flat = path.join(parent, `${prefix}.${e.name}`);
      if (!fs.existsSync(flat)) {
        fs.copyFileSync(p, flat);
        created++;
      }
    }
  }
}
walk(out);
console.log(`postbuild: wrote ${created} flat prefetch file(s)`);

let bytes = 0, files = 0;
(function size(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) size(p);
    else { bytes += fs.statSync(p).size; files++; }
  }
})(out);
console.log(`postbuild: out/ = ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
