// Procedural 3-fan graphics card, shared by the "rig" and "gpu" scenes.
// Local frame: length along X (bracket at +X), height along Y, fans face +Z.
import * as THREE from "three";
import { rbox, plateWithHoles, makeFan, glow, mesh, group, TAU } from "./lib.js";

export function makeGPU(M, { L = 33, Hh = 13.2, T = 5.5 } = {}) {
  const root = new THREE.Group();
  const copper = new THREE.MeshStandardMaterial({ color: 0xc27a4c, roughness: 0.28, metalness: 1 });

  // --- layer 0: backplate (z = back) ---------------------------------------
  const backplate = new THREE.Group();
  backplate.add(mesh(rbox(L, Hh * 0.98, 0.34, 0.5), M.gun, 0, 0, 0));
  const bpStrip = glow(0x2aa3ff, 2.2);
  backplate.add(mesh(new THREE.BoxGeometry(L * 0.55, 0.22, 0.12), bpStrip, -2, Hh * 0.18, -0.2));
  for (let i = 0; i < 9; i++) backplate.add(mesh(new THREE.BoxGeometry(0.5, Hh * 0.45, 0.1), M.black, 6 + i * 1.3 - 12, -Hh * 0.12, 0.17));
  backplate.position.z = -T / 2 + 0.17;
  root.add(backplate);

  // --- layer 1: PCB ---------------------------------------------------------
  const pcb = new THREE.Group();
  pcb.add(mesh(new THREE.BoxGeometry(L * 0.94, Hh * 0.82, 0.18), M.pcb, -L * 0.015, Hh * 0.04, 0));
  pcb.add(mesh(new THREE.BoxGeometry(8.9, 0.9, 0.12), M.gold, -L / 2 + 6.6, -Hh * 0.43, 0.02));
  // die + vram chips
  pcb.add(mesh(new THREE.BoxGeometry(3.2, 3.2, 0.3), M.black, 0, 0.5, 0.2));
  for (let i = 0; i < 8; i++) pcb.add(mesh(new THREE.BoxGeometry(1.1, 1.1, 0.16), M.black, 0 + (i % 4 - 1.5) * 2.4 - 0.0, (i < 4 ? 3.9 : -2.9), 0.15));
  pcb.position.z = -T / 2 + 0.7;
  root.add(pcb);

  // --- layer 2: heatsink (fin stack + heat pipes) --------------------------------
  const heatsink = new THREE.Group();
  const finCount = 64;
  const finGeo = new THREE.BoxGeometry(0.14, Hh * 0.8, T * 0.5);
  const fins = new THREE.InstancedMesh(finGeo, M.alu, finCount);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < finCount; i++) {
    m4.makeTranslation(-L / 2 + 3 + (i / (finCount - 1)) * (L - 8), 0, 0);
    fins.setMatrixAt(i, m4);
  }
  heatsink.add(fins);
  for (let i = 0; i < 5; i++) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, L * 0.84, 20).rotateZ(Math.PI / 2), copper);
    p.position.set(-1, -Hh * 0.3 + i * Hh * 0.15, -T * 0.18);
    heatsink.add(p);
  }
  heatsink.add(mesh(new THREE.BoxGeometry(5.5, 5.5, 0.5), copper, 0, 0.5, -T * 0.36)); // vapor chamber plate
  heatsink.position.z = -T / 2 + 0.7 + T * 0.34;
  root.add(heatsink);

  // --- layer 3: shroud + fans + RGB -------------------------------------------
  const shroudGroup = new THREE.Group();
  const fanSize = 10.2;
  const pitch = 10.5;
  const fanX = [-pitch, 0, pitch].map((x) => x - 0.6);
  const holes = fanX.map((x) => ({ x, y: 0, r: fanSize * 0.5 }));
  const shroudGeo = plateWithHoles(L, Hh, 1.7, holes, 1.3);
  const shroud = new THREE.Mesh(shroudGeo, M.black);
  shroud.position.z = T / 2 - 1.1;
  shroudGroup.add(shroud);
  // shroud trim + diagonal accents
  shroudGroup.add(mesh(new THREE.BoxGeometry(L * 0.96, 0.22, 0.2), M.brushed, 0, -Hh / 2 + 0.55, T / 2 + 0.0));
  for (const sx of [-pitch / 2 - 0.6, pitch / 2 - 0.6]) {
    const acc = mesh(new THREE.BoxGeometry(0.28, Hh * 0.9, 0.22), M.gun, sx, 0, T / 2 + 0.0);
    acc.rotation.z = 0.35;
    shroudGroup.add(acc);
  }
  const fans = fanX.map((x, i) => {
    const f = makeFan({ size: fanSize, blades: 11 - (i % 2) * 2, M, frame: false, thick: 2.2 });
    f.group.position.set(x, 0, T / 2 - 1.6);
    shroudGroup.add(f.group);
    return f;
  });
  const barMat = glow(0x2aa3ff, 2.4);
  shroudGroup.add(mesh(new THREE.BoxGeometry(L * 0.74, 0.34, 0.34), barMat, -1.5, Hh / 2 - 0.15, T / 2 - 0.5));
  const logoMat = glow(0x2aa3ff, 2.2);
  shroudGroup.add(mesh(new THREE.BoxGeometry(3.4, 0.28, 0.1), logoMat, L / 2 - 4.2, -Hh / 2 + 1.5, T / 2 + 0.06));
  root.add(shroudGroup);

  // --- bracket + power connector (fixed to the PCB layer) ----------------------
  const bracket = new THREE.Group();
  bracket.add(mesh(new THREE.BoxGeometry(0.22, Hh * 0.98, T * 0.96), M.alu, 0, 0, 0));
  for (let i = 0; i < 4; i++) bracket.add(mesh(new THREE.BoxGeometry(0.1, 0.9, 1.5), M.black, -0.08, 2.2 - i * 1.3, 0.5 - (i === 3 ? 0 : 0)));
  bracket.add(mesh(new THREE.BoxGeometry(0.1, 0.8, 2.2), M.black, -0.08, -3.6, 0.0));
  bracket.position.set(L / 2 + 0.05, 0, 0);
  root.add(bracket);
  const conn = mesh(new THREE.BoxGeometry(2.4, 1.0, 1.6), M.black, L / 2 - 3.2, Hh / 2 + 0.25, -0.2);
  root.add(conn);

  return {
    group: root,
    L, Hh, T,
    layers: { backplate, pcb, heatsink, shroud: shroudGroup },
    fans,
    mats: { bar: barMat, logo: logoMat, backplate: bpStrip },
    bracket,
    conn,
  };
}
