// Home signature sequence: a gaming PC assembles itself part by part, lights up, then the camera orbits.
import {
  materials, stage, orbit, shadowify, setGlow, glow, seg, easeInOut, easeOut, lerp, smooth, rbox, plateWithHoles,
  makeFan, mesh, TAU, clamp,
} from "../lib.js";
import { makeGPU } from "../gpu.js";

export default async function build({ THREE, scene, camera, renderer, W, H, aspect }) {
  const M = materials();
  const lights = stage({ scene, renderer, W, H, floorY: 0, key: 2.6 });
  const Wc = 23, Hc = 47, D = 47; // case width (x), height (y), depth (z) in cm
  const lift = 1.6; // case feet height
  camera.fov = 30;
  camera.updateProjectionMatrix();

  // ------------------------------------------------------------------ parts
  const parts = []; // {obj, to:Vector3, off:Vector3, start, dur, rot?}
  const root = new THREE.Group();
  root.position.y = lift;
  scene.add(root);
  const addPart = (obj, to, off, start, dur, spin = 0) => {
    obj.position.copy(to);
    root.add(obj);
    parts.push({ obj, to: to.clone(), off: new THREE.Vector3(...off), start, dur, spin });
    return obj;
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- chassis (static) ----------
  const chassis = new THREE.Group();
  chassis.add(mesh(rbox(Wc, 1.2, D, 0.5), M.black, 0, -0.6, 0)); // base
  chassis.add(mesh(plateWithHoles(Wc, D, 1.0, [{ x: 0, y: -1.5, w: 15.5, h: 29.5 }], 0.5).rotateX(Math.PI / 2), M.black, 0, Hc, 0)); // top frame
  chassis.add(mesh(new THREE.BoxGeometry(0.5, Hc, D), M.gun, -Wc / 2 + 0.25, Hc / 2, 0)); // motherboard tray
  chassis.add(mesh(plateWithHoles(Wc - 0.4, Hc - 1, 0.6, [{ x: 0, y: 6, r: 6.1 }, { x: 0, y: -16, w: 9, h: 5 }], 0.6).rotateY(Math.PI), M.black, 0, Hc / 2, -D / 2)); // rear plate
  for (const sz of [-1, 1]) chassis.add(mesh(rbox(1.3, Hc, 1.3, 0.35), M.gun, Wc / 2 - 0.55, Hc / 2, sz * (D / 2 - 0.65))); // open-side pillars
  chassis.add(mesh(rbox(1.0, 1.0, D - 1.5, 0.3), M.gun, Wc / 2 - 0.5, 0.5, 0)); // lower rail
  chassis.add(mesh(rbox(1.0, 1.0, D - 1.5, 0.3), M.gun, Wc / 2 - 0.5, Hc - 0.5, 0)); // upper rail
  // front mesh panel with airflow slits (alpha mapped)
  const c = document.createElement("canvas");
  c.width = 512; c.height = 1024;
  const cx = c.getContext("2d");
  cx.fillStyle = "#fff"; cx.fillRect(0, 0, 512, 1024);
  cx.fillStyle = "#000";
  for (let y = 5; y < 1024; y += 11) for (let x = 5; x < 512; x += 17) cx.fillRect(x + (((y / 11) | 0) % 2) * 8, y, 10, 5);
  const alpha = new THREE.CanvasTexture(c);
  alpha.wrapS = alpha.wrapT = THREE.RepeatWrapping;
  alpha.repeat.set(1, 1);
  const meshMat = new THREE.MeshStandardMaterial({ color: 0x12151a, roughness: 0.9, metalness: 0.05, alphaMap: alpha, alphaTest: 0.5, side: THREE.DoubleSide });
  chassis.add(mesh(new THREE.BoxGeometry(Wc - 0.4, Hc - 1, 0.4), meshMat, 0, Hc / 2, D / 2 - 0.2));
  // feet
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) chassis.add(mesh(new THREE.CylinderGeometry(1.2, 1.4, lift, 20), M.black, sx * (Wc / 2 - 2.5), -1.2 - 0.2, sz * (D / 2 - 5)));
  // PSU shroud (bottom-rear)
  const shroud = new THREE.Group();
  shroud.add(mesh(rbox(Wc - 1.6, 11, 30, 0.7), M.matte, 0.6, 5.5, -D / 2 + 17));
  const shroudLed = glow(0x2aa3ff, 2.2);
  shroud.add(mesh(new THREE.BoxGeometry(0.2, 0.3, 24), shroudLed, 11.35, 9.6, -D / 2 + 17));
  for (let i = 0; i < 10; i++) shroud.add(mesh(new THREE.BoxGeometry(0.15, 5.6, 0.7), M.gun, 11.33, 4.6, -D / 2 + 7.4 + i * 1.7)); // vents
  chassis.add(shroud);
  root.add(chassis);
  shadowify(chassis, true, true);

  // ---------- motherboard ----------
  const mobo = new THREE.Group();
  const bz = -6.25, by = 24.4;
  mobo.add(mesh(new THREE.BoxGeometry(0.18, 24.4, 30.5), M.pcb, 0, 0, 0));
  const vrm = (y, z, h, w) => mesh(rbox(1.8, h, w, 0.35), M.gun, 0.95, y, z);
  mobo.add(vrm(8.2, -9.5, 3.4, 11)); // VRM left (top row)
  mobo.add(mesh(rbox(1.8, 9.5, 3.4, 0.35), M.gun, 0.95, 7.6, -12.9));
  mobo.add(mesh(rbox(2.5, 4.6, 12.8, 0.5), M.black, 1.3, 8.0, -9.5)); // io shroud top
  mobo.add(mesh(new THREE.BoxGeometry(0.2, 0.28, 8), glow(0x2aa3ff, 2.4), 2.55, 8.3, -9.8)); // io logo bar (static brand blue)
  mobo.add(mesh(rbox(1.5, 6.5, 6.5, 0.4), M.gun, 0.85, -4.7, 4.2)); // chipset sink
  mobo.add(mesh(rbox(0.9, 1.2, 8.6, 0.3), M.brushed, 0.55, -6.9, -4.8)); // m.2 sink
  mobo.add(mesh(new THREE.BoxGeometry(0.9, 0.7, 14), M.black, 0.5, -3.0, -8.6)); // pcie x16 slot
  for (let i = 0; i < 4; i++) mobo.add(mesh(new THREE.BoxGeometry(1.1, 13.4, 0.75), M.black, 0.6, 5.9, 2.9 + i * 0.9 - 1)); // ram slots
  mobo.add(mesh(new THREE.BoxGeometry(1.5, 3, 1.8), M.black, 0.75, -1.5, 9.2)); // 24 pin
  mobo.add(mesh(new THREE.BoxGeometry(1.0, 1.0, 5.4), M.gun, 0.55, 11.6, -4.5)); // cpu 8 pin
  const socket = mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.5, 6).rotateZ(Math.PI / 2), M.brushed, 0.35, 6.0, -7.0);
  mobo.add(socket);
  addPart(mobo, V(-Wc / 2 + 1.4, by - lift * 0 - 0.0, bz), [46, 12, 0], 0.02, 0.2);
  shadowify(mobo, true, true);

  // ---------- RAM (2 sticks) ----------
  const ramMats = [];
  const rams = [];
  for (let i = 0; i < 2; i++) {
    const ram = new THREE.Group();
    ram.add(mesh(rbox(3.6, 13.4, 0.9, 0.25), M.gun, 0, 0, 0));
    const bar = glow(0x2aa3ff, 2.6);
    ramMats.push(bar);
    ram.add(mesh(new THREE.BoxGeometry(2.6, 12.2, 0.25), M.black, 0.0, 0, 0.0));
    ram.add(mesh(new THREE.BoxGeometry(1.0, 11.4, 0.98), bar, 1.4, 0, 0)); // light bar along the top edge (x = out of board)
    ram.add(mesh(new THREE.BoxGeometry(0.3, 12.8, 0.92), M.gold, -1.7, 0, 0));
    rams.push(ram);
    addPart(ram, V(-Wc / 2 + 1.4 + 2.5, by - 0.4 + 5.9 - 3.3, bz + 2.0 + i * 1.8 + 0.2), [0, 38 + i * 6, 0], 0.16 + i * 0.045, 0.18);
    shadowify(ram, true, false);
  }

  // ---------- AIO pump block ----------
  const pump = new THREE.Group();
  pump.add(mesh(new THREE.CylinderGeometry(3.7, 3.9, 3.4, 56).rotateZ(Math.PI / 2), M.black, 0, 0, 0));
  const pumpRing = glow(0x2aa3ff, 2.4);
  pump.add(mesh(new THREE.TorusGeometry(3.05, 0.17, 12, 72).rotateY(Math.PI / 2), pumpRing, 1.78, 0, 0));
  pump.add(mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.2, 48).rotateZ(Math.PI / 2), M.gun, 1.72, 0, 0));
  const pumpCore = glow(0x2aa3ff, 1.6);
  pump.add(mesh(new THREE.TorusGeometry(1.2, 0.12, 10, 40).rotateY(Math.PI / 2), pumpCore, 1.86, 0, 0));
  addPart(pump, V(-Wc / 2 + 1.4 + 3.3, by + 6.0, bz - 7.0), [40, 14, 6], 0.1, 0.2, 0.9);
  shadowify(pump, true, false);

  // ---------- radiator + top fans ----------
  const rad = new THREE.Group();
  rad.add(mesh(rbox(12.2, 2.9, 28.4, 0.5), M.black, 0, 0, 0));
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(11.6, 0.1, 27.4), M.brushed, 22);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 22; i++) { m4.makeTranslation(0, -1.1 + (i / 21) * 2.2, 0); fins.setMatrixAt(i, m4); }
  rad.add(fins);
  const topFans = [];
  for (let i = 0; i < 2; i++) {
    const f = makeFan({ size: 12, blades: 9, M, thick: 2.4 });
    f.group.rotation.x = Math.PI / 2; // face -y? (+Z -> +Y after rotating x by +90deg gives -Y)
    f.group.position.set(0, -2.8, -7.1 + i * 14.2);
    rad.add(f.group);
    topFans.push(f);
  }
  addPart(rad, V(0.5, Hc - 3.6, -5.2), [0, 44, 0], 0.0, 0.22);
  shadowify(rad, true, false);

  // ---------- tubes pump -> radiator ----------
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.75, metalness: 0.15 });
  const mkTube = (pts, r) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.4);
    const g = new THREE.TubeGeometry(curve, 80, r, 14, false);
    const m = new THREE.Mesh(g, tubeMat);
    m.castShadow = true;
    m.userData.count = g.index.count;
    return m;
  };
  const tubes = [
    mkTube([[-3.8, 31, -15], [-3.6, 33, -17.5], [-3.6, 38, -19.5], [-3.5, 42.0, -17.6]], 0.85),
    mkTube([[-3.8, 31, -13.5], [-3.0, 34, -12.0], [-3.0, 38, -10.6], [-3.0, 42.0, -9.2]], 0.85),
  ];
  const cables = [
    mkTube([[-5.0, 12.5, -2.0], [-5.0, 13.0, 4.0], [-8.4, 19.5, 8.4], [-9.4, 25.6, 9.2]], 0.62), // 24 pin
    mkTube([[-6.5, 12.5, -6.5], [-4.6, 22, -1.0], [-3.2, 24.5, 4.6]], 0.55), // gpu power (approx.)
    mkTube([[-10.5, 20.5, -10.5], [-10.8, 40, -17], [-9.0, 41.5, -15.5], [-8.9, 36.2, -14.6]], 0.5), // cpu 8-pin
  ];
  tubes.concat(cables).forEach((t) => root.add(t));

  // ---------- GPU ----------
  const gpu = makeGPU(M);
  const gpuWrap = new THREE.Group();
  gpu.group.rotation.y = Math.PI / 2; // fans face +X, bracket toward the rear (-Z)
  gpuWrap.add(gpu.group);
  addPart(gpuWrap, V(-Wc / 2 + 1.4 + 1.8 + 2.75, 18.2, -D / 2 + 1.0 + 16.5), [58, -3, 14], 0.06, 0.24);
  shadowify(gpuWrap, true, true);

  // ---------- PSU ----------
  const psu = new THREE.Group();
  psu.add(mesh(rbox(14, 8.6, 16, 0.5), M.black, 0, 0, 0));
  psu.add(mesh(new THREE.BoxGeometry(0.2, 5.6, 5.6), M.gun, 7.05, 0, -2));
  addPart(psu, V(-0.5, 4.8, -D / 2 + 9.0), [30, -1, 0], 0.0, 0.14);

  // ---------- case fans ----------
  const caseFans = [];
  for (let i = 0; i < 3; i++) {
    const f = makeFan({ size: 12, blades: 9, M, thick: 2.4 });
    addPart(f.group, V(0.5, 8.1 + i * 12.6, D / 2 - 3.1), [0, 0, 42 + i * 6], 0.2 + i * 0.045, 0.2);
    caseFans.push(f);
  }
  const rearFan = makeFan({ size: 12, blades: 9, M, thick: 2.4 });
  rearFan.group.rotation.y = Math.PI;
  addPart(rearFan.group, V(0.5, 30.2, -D / 2 + 2.0), [0, 0, -40], 0.24, 0.18);
  [...caseFans, rearFan].forEach((f) => shadowify(f.group, true, false));

  // ---------- glass side panel ----------
  const glass = new THREE.Group();
  glass.add(mesh(new THREE.BoxGeometry(0.4, Hc - 1.4, D - 2.6), M.glass, 0, 0, 0));
  const frameMat = M.black;
  glass.add(mesh(new THREE.BoxGeometry(0.5, 0.7, D - 2.6), frameMat, 0, (Hc - 1.4) / 2, 0));
  glass.add(mesh(new THREE.BoxGeometry(0.5, 0.7, D - 2.6), frameMat, 0, -(Hc - 1.4) / 2, 0));
  glass.add(mesh(new THREE.BoxGeometry(0.5, Hc - 1.4, 0.7), frameMat, 0, 0, (D - 2.6) / 2));
  glass.add(mesh(new THREE.BoxGeometry(0.5, Hc - 1.4, 0.7), frameMat, 0, 0, -(D - 2.6) / 2));
  glass.renderOrder = 10;
  const glassPart = { obj: glass, to: V(Wc / 2 + 0.2, Hc / 2, 0), off: new THREE.Vector3(10, 70, 6), start: 0.56, dur: 0.17, spin: 0, hideUntil: true };
  glass.position.copy(glassPart.to);
  root.add(glass);
  parts.push(glassPart);

  // ---------- interior lights that pick up the RGB ----------
  const l1 = new THREE.PointLight(0x2aa3ff, 380, 90, 2);
  l1.position.set(3, 30, 2);
  const l2 = new THREE.PointLight(0x7a5cff, 300, 90, 2);
  l2.position.set(2, 36, 8);
  root.add(l1, l2);

  // gather all animated emissives
  const ASSEMBLY_END = 0.55;
  const glowers = [
    ...gpu.fans.map((f) => ({ m: f.rimMat, k: 1.0, o: 0 })),
    ...topFans.map((f, i) => ({ m: f.rimMat, k: 1.0, o: 0.1 + i * 0.05 })),
    ...caseFans.map((f, i) => ({ m: f.rimMat, k: 1.0, o: 0.2 + i * 0.05 })),
    { m: rearFan.rimMat, k: 1.0, o: 0.3 },
    { m: pumpRing, k: 1.1, o: 0.15 },
    { m: pumpCore, k: 0.8, o: 0.2 },
    { m: gpu.mats.bar, k: 1.2, o: 0.0 },
    { m: gpu.mats.logo, k: 1.0, o: 0.05 },
    { m: gpu.mats.backplate, k: 1.2, o: 0.0 },
    { m: shroudLed, k: 1.0, o: 0.25 },
    ...ramMats.map((m, i) => ({ m, k: 1.2, o: 0.1 + i * 0.04 })),
  ];
  const target = new THREE.Vector3(0, 23, 0);
  const fit = aspect < 1 ? 1.55 : 1;
  const tmp = new THREE.Vector3();

  return {
    exposure: 1.0,
    bloom: { strength: 0.7, radius: 0.5, threshold: 1.0 },
    update(t) {
      // --- assembly ---
      // parts have start/dur expressed in the 0..ASSEMBLY_END window
      parts.forEach((p, idx) => {
        const local = seg(t, p.start, p.start + p.dur);
        if (p.hideUntil) p.obj.visible = t >= p.start;
        const e = easeOut(local);
        tmp.copy(p.off).multiplyScalar(1 - e);
        p.obj.position.copy(p.to).add(tmp);
        if (p.spin) {
          p.obj.rotation.x = (p.obj.userData.rx ?? (p.obj.userData.rx = p.obj.rotation.x)) + (1 - e) * p.spin * 1.2;
        }
        // gentle float while waiting/arriving
        if (local < 1) p.obj.position.y += Math.sin(t * 40 + idx) * 0.25 * (1 - e);
      });
      // cables draw in after the main parts land
      const cableE = easeInOut(seg(t, 0.46, 0.6));
      tubes.forEach((m, i) => m.geometry.setDrawRange(0, Math.floor((m.userData.count * easeInOut(seg(t, 0.22 + i * 0.03, 0.34 + i * 0.03))) / 3) * 3));
      cables.forEach((m, i) => m.geometry.setDrawRange(0, Math.floor((m.userData.count * clamp(cableE * 1.2 - i * 0.12)) / 3) * 3));

      // --- lighting up ---
      const on = smooth(seg(t, 0.6, 0.76));
      const level = lerp(0.1, 1, on) * (1 + 0.1 * Math.sin(t * 90));
      const hue = 0.57 + 0.12 * Math.sin(t * TAU * 1.2);
      glowers.forEach((g) => setGlow(g.m, hue + g.o, 2.5 * g.k * level));
      l1.intensity = 380 * level;
      l2.intensity = 300 * level;
      l1.color.setHSL(hue, 1, 0.55);
      l2.color.setHSL(hue + 0.2, 1, 0.55);

      // --- fans spin (spin up as the lights come on) ---
      const spin = t * 55 * (0.25 + 0.75 * smooth(seg(t, 0.5, 0.7)));
      gpu.fans.forEach((f, i) => (f.rotor.rotation.z = -spin * (i % 2 ? 1 : -1) * 0.9));
      topFans.forEach((f) => (f.rotor.rotation.z = spin));
      caseFans.forEach((f) => (f.rotor.rotation.z = spin * 0.9));
      rearFan.rotor.rotation.z = -spin;

      // --- camera ---
      const a1 = easeInOut(seg(t, 0.0, ASSEMBLY_END));
      const a2 = easeInOut(seg(t, ASSEMBLY_END, 0.82));
      const a3 = easeInOut(seg(t, 0.82, 1));
      const az = lerp(0.6, 0.98, a1) + lerp(0, 0.14, a2) - lerp(0, 0.3, a3);
      const el = lerp(0.2, 0.13, a1) - lerp(0, 0.04, a3);
      const dist = (lerp(158, 128, a1) - lerp(0, 22, a2) - lerp(0, 18, a3)) * fit;
      target.set(0, lerp(31, 22, a1) - lerp(0, 3, a3), -lerp(0, 5, a3));
      orbit(camera, target, az, el, dist);
      lights.rimA.intensity = 38000;
    },
  };
}
