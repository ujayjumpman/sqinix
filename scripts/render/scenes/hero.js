// Home hero: a seamless loop. Macro of a graphics card, fans spinning, RGB breathing, dust motes drifting.
// Render with --loop so the last frame leads straight back into the first.
import { materials, stage, orbit, shadowify, setGlow, TAU, hash, shiftView } from "../lib.js";
import { makeGPU } from "../gpu.js";

export default async function build({ THREE, scene, camera, renderer, W, H, aspect, mobile }) {
  const M = materials();
  const gpu = makeGPU(M);
  const floorY = -9.5;
  const lights = stage({ scene, renderer, W, H, floorY, key: 3.0 });
  scene.add(gpu.group);
  shadowify(gpu.group, true, true);
  camera.fov = 26;
  camera.updateProjectionMatrix();

  // drifting motes (loop exactly: position = base + A * sin(t*TAU + phase))
  const N = 140;
  const geo = new THREE.SphereGeometry(0.09, 8, 6);
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 1.4, 2.6) });
  const motes = new THREE.InstancedMesh(geo, mat, N);
  const data = [];
  for (let i = 0; i < N; i++) {
    data.push({
      b: new THREE.Vector3((hash(i) - 0.5) * 90, (hash(i + 9) - 0.2) * 40 - 6, (hash(i + 21) - 0.5) * 60 - 6),
      a: new THREE.Vector3((hash(i + 3) - 0.5) * 6, (hash(i + 5) - 0.5) * 7, (hash(i + 7) - 0.5) * 6),
      p: hash(i + 13) * TAU,
      s: 0.5 + hash(i + 17) * 1.4,
    });
  }
  scene.add(motes);
  const m4 = new THREE.Matrix4();
  const target = new THREE.Vector3(-1.5, -0.5, 0);
  const fit = aspect < 1 ? 1.5 : 1;

  return {
    exposure: 1.05,
    bloom: { strength: 0.8, radius: 0.6, threshold: 0.85 },
    update(t) {
      const a = t * TAU;
      gpu.fans.forEach((f, i) => (f.rotor.rotation.z = a * 3 * (i % 2 ? 1 : -1)));
      const hue = 0.6 + 0.075 * Math.sin(a);
      setGlow(gpu.mats.bar, hue, 2.3);
      setGlow(gpu.mats.logo, hue + 0.03, 2.1);
      setGlow(gpu.mats.backplate, hue - 0.03, 2.1);
      gpu.fans.forEach((f, i) => setGlow(f.rimMat, hue + (i - 1) * 0.035, 1.9));
      for (let i = 0; i < N; i++) {
        const d = data[i];
        const k = Math.round(d.s); // integer harmonic keeps the loop seamless
        m4.makeTranslation(d.b.x + d.a.x * Math.sin(a * k + d.p), d.b.y + d.a.y * Math.sin(a * k + d.p * 1.3), d.b.z + d.a.z * Math.cos(a * k + d.p));
        motes.setMatrixAt(i, m4);
      }
      motes.instanceMatrix.needsUpdate = true;
      orbit(camera, target, 0.62 + 0.16 * Math.sin(a), 0.2 + 0.045 * Math.cos(a), (mobile ? 66 : 72) * (mobile ? 1.22 : 1));
      // desktop: subject to the right of the headline; phone: subject in the upper half, copy below
      if (mobile) shiftView(camera, W, H, 0.0, -0.16);
      else shiftView(camera, W, H, 0.14, 0.03);
      lights.rimA.intensity = 90000 * (0.85 + 0.25 * Math.sin(a + 1));
    },
  };
}
