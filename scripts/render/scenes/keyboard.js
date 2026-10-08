// Peripherals line: a mechanical keyboard explodes into its layers with an RGB wave, then snaps back together.
import { materials, stage, orbit, shadowify, glow, setGlow, rbox, mesh, seg, easeInOut, lerp, smooth, TAU, shiftView } from "../lib.js";

const ROWS = [
  [["`", 1], ["1", 1], ["2", 1], ["3", 1], ["4", 1], ["5", 1], ["6", 1], ["7", 1], ["8", 1], ["9", 1], ["0", 1], ["-", 1], ["=", 1], ["⌫", 2]],
  [["Tab", 1.5], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1], ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["[", 1], ["]", 1], ["\\", 1.5]],
  [["Caps", 1.75], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1], ["J", 1], ["K", 1], ["L", 1], [";", 1], ["'", 1], ["Enter", 2.25]],
  [["Shift", 2.25], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1], ["M", 1], [",", 1], [".", 1], ["/", 1], ["Shift", 1.75], ["↑", 1]],
  [["Ctrl", 1.25], ["Win", 1.25], ["Alt", 1.25], ["", 5.75], ["Alt", 1.25], ["Fn", 1.25], ["←", 1], ["↓", 1], ["→", 1]],
];

function legendTexture(THREE, label) {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const x = c.getContext("2d");
  x.clearRect(0, 0, 128, 128);
  if (label) {
    x.fillStyle = "#dfe9f7";
    x.font = label.length > 1 && label.length < 4 ? "600 40px sans-serif" : label.length >= 4 ? "600 30px sans-serif" : "600 56px sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(label, 64, 66);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

export default async function build({ THREE, scene, camera, renderer, W, H, aspect }) {
  const M = materials();
  const floorY = -9;
  stage({ scene, renderer, W, H, floorY, floorR: 380, key: 2.4 });
  scene.environmentIntensity = 0.45;
  camera.fov = 30;
  camera.updateProjectionMatrix();

  const PITCH = 1.9;
  const totalU = 15;
  const KW = totalU * PITCH, KD = ROWS.length * PITCH;
  const kb = new THREE.Group();
  scene.add(kb);

  // layers ------------------------------------------------------------------------
  const caseL = new THREE.Group();
  caseL.add(mesh(rbox(KW + 2.2, 1.7, KD + 2.2, 0.8, 4), new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.35, metalness: 0.9 }), 0, 0, 0));
  caseL.add(mesh(rbox(KW + 2.3, 0.18, KD + 2.3, 0.1), glow(0x2aa3ff, 0.9), 0, -0.6, 0));
  kb.add(caseL);

  const pcbL = new THREE.Group();
  pcbL.add(mesh(new THREE.BoxGeometry(KW + 0.6, 0.18, KD + 0.6), M.pcb, 0, 0, 0));
  const plateL = new THREE.Group();
  plateL.add(mesh(new THREE.BoxGeometry(KW + 0.9, 0.22, KD + 0.9), new THREE.MeshStandardMaterial({ color: 0x6f7784, roughness: 0.5, metalness: 1 }), 0, 0, 0));
  const swL = new THREE.Group();
  const capL = new THREE.Group();

  const housing = rbox(1.45, 0.62, 1.45, 0.16, 2);
  const stem = new THREE.BoxGeometry(0.42, 0.5, 0.42);
  const capMat = new THREE.MeshStandardMaterial({ color: 0x151a22, roughness: 0.5, metalness: 0.15 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x2aa3ff, roughness: 0.35, metalness: 0.1, emissive: 0x0a4a80 });
  const housingMat = new THREE.MeshStandardMaterial({ color: 0x2a3140, roughness: 0.35, metalness: 0.3 });
  const glows = [];
  const keyList = [];
  ROWS.forEach((row, r) => {
    let x = -KW / 2;
    row.forEach(([label, w]) => {
      const kw = w * PITCH;
      const cx = x + kw / 2;
      const cz = -KD / 2 + (r + 0.5) * PITCH;
      x += kw;
      // underglow square on the PCB
      const gm = glow(0x2aa3ff, 2);
      const gq = mesh(new THREE.PlaneGeometry(Math.min(kw, 2.6) - 0.35, PITCH - 0.35).rotateX(-Math.PI / 2), gm, cx, 0.1, cz);
      pcbL.add(gq);
      glows.push({ m: gm, x: cx, z: cz });
      // switch
      swL.add(mesh(housing, housingMat, cx, 0, cz));
      swL.add(mesh(stem, stemMat, cx, 0.45, cz));
      // keycap
      const cap = new THREE.Group();
      const body = new THREE.Mesh(rbox(kw - 0.2, 1.05, PITCH - 0.2, 0.28, 3), capMat);
      body.scale.set(1, 1, 1);
      cap.add(body);
      const topFace = mesh(new THREE.PlaneGeometry(Math.min(kw - 0.6, 1.5), 1.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: legendTexture(THREE, label), transparent: true, depthWrite: false }), 0, 0.535, 0);
      cap.add(topFace);
      cap.position.set(cx, 0, cz);
      capL.add(cap);
      keyList.push({ cap, x: cx, z: cz, r });
    });
  });
  kb.add(pcbL, plateL, swL, capL);
  shadowify(kb, true, true);

  // resting heights of each layer (assembled)
  const rest = { case: 0, pcb: 1.2, plate: 1.6, sw: 2.15, cap: 3.0 };
  const gap = { case: -9, pcb: -2.5, plate: 4.5, sw: 10, cap: 17.5 };

  // a hot-pink/cyan rim to make the aluminium case pop
  const target = new THREE.Vector3(0, 2, 0);
  const fit = aspect < 1 ? 1.65 : 1;

  return {
    exposure: 1.0,
    bloom: { strength: 0.75, radius: 0.5, threshold: 0.9 },
    update(t) {
      const ex = easeInOut(seg(t, 0.12, 0.42)) * (1 - easeInOut(seg(t, 0.7, 0.92)));
      caseL.position.y = rest.case + gap.case * ex;
      pcbL.position.y = rest.pcb + gap.pcb * ex;
      plateL.position.y = rest.plate + gap.plate * ex * 0.6;
      swL.position.y = rest.sw + gap.sw * ex;
      capL.position.y = rest.cap + gap.cap * ex;
      // caps float individually when exploded
      keyList.forEach((k, i) => {
        k.cap.position.y = Math.sin(t * TAU * 2 + i * 0.7) * 0.55 * ex;
        k.cap.rotation.y = Math.sin(t * TAU + i) * 0.08 * ex;
      });
      // RGB wave
      const lvl = lerp(0.7, 0.95, ex);
      glows.forEach((g) => setGlow(g.m, 0.6 + 0.12 * Math.sin(g.x * 0.18 - t * TAU * 2) + 0.04 * Math.cos(g.z * 0.9), 2.0 * lvl, 1, 0.5));
      // camera: orbit across the board while it separates
      const a1 = easeInOut(seg(t, 0, 0.7));
      const a2 = easeInOut(seg(t, 0.7, 1));
      const az = lerp(-0.7, 0.55, a1) + lerp(0, -0.35, a2);
      const el = lerp(0.46, 0.32, smooth(seg(t, 0.08, 0.5))) + lerp(0, 0.1, a2);
      const dist = (lerp(56, 68, smooth(seg(t, 0.1, 0.42))) - lerp(0, 18, a2)) * fit;
      target.set(0, lerp(1.5, 7, ex), 0);
      orbit(camera, target, az, el, dist);
      shiftView(camera, W, H, 0, (aspect < 1 ? 0.2 : 0.16) * (1 - smooth(seg(t, 0.03, 0.2))));
    },
  };
}
