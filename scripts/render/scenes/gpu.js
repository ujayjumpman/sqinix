// Gaming line: a 3-fan graphics card that separates into layers and reassembles.
import { materials, stage, orbit, shadowify, setGlow, seg, easeInOut, lerp, smooth, TAU, shiftView } from "../lib.js";
import { makeGPU } from "../gpu.js";

export default async function build({ THREE, scene, camera, renderer, W, H, aspect, mobile }) {
  const M = materials();
  const gpu = makeGPU(M);
  const floorY = -11;
  const lights = stage({ scene, renderer, W, H, floorY, key: 3.2 });
  scene.add(gpu.group);
  shadowify(gpu.group, true, true);
  camera.fov = 30;
  camera.updateProjectionMatrix();

  const base = { backplate: gpu.layers.backplate.position.z, pcb: gpu.layers.pcb.position.z, heatsink: gpu.layers.heatsink.position.z, shroud: gpu.layers.shroud.position.z };
  const gaps = { backplate: -15, pcb: -5.5, heatsink: 5, shroud: 16 };
  const target = new THREE.Vector3(0, 0, 0);
  const fit = aspect < 1 ? 1.55 : 1;

  return {
    exposure: 1.05,
    bloom: { strength: 0.75, radius: 0.55, threshold: 0.82 },
    update(t, frame, total) {
      // explode amount: 0 assembled -> 1 exploded -> 0
      const ex = easeInOut(seg(t, 0.1, 0.4)) * (1 - easeInOut(seg(t, 0.68, 0.92)));
      for (const k of Object.keys(gaps)) gpu.layers[k].position.z = base[k] + gaps[k] * ex;
      // fans: constant spin with a spool-up at the start
      const spool = smooth(seg(t, 0, 0.12));
      const angle = (t * 26 + 0) * (0.35 + 0.65 * spool);
      gpu.fans.forEach((f, i) => (f.rotor.rotation.z = -angle * (i % 2 ? -1 : 1)));
      // rgb: slow rainbow around brand blue -> violet -> cyan
      const hue = 0.56 + Math.sin(t * TAU * 1.5) * 0.13;
      const power = lerp(0.9, 1.6, ex);
      setGlow(gpu.mats.bar, hue, 2.6 * power);
      setGlow(gpu.mats.logo, hue + 0.05, 2.4 * power);
      setGlow(gpu.mats.backplate, hue - 0.04, 2.6 * power);
      gpu.fans.forEach((f, i) => setGlow(f.rimMat, hue + i * 0.05, 2.2 * power));

      // camera: orbit left->right, tilt up as it explodes, push into the fan at the end
      const az = lerp(-0.62, 0.78, easeInOut(seg(t, 0, 0.82))) + lerp(0, -0.35, easeInOut(seg(t, 0.82, 1)));
      const el = lerp(0.16, 0.34, smooth(seg(t, 0.05, 0.45))) - lerp(0, 0.2, smooth(seg(t, 0.72, 1)));
      const dist = (lerp(82, 104, smooth(seg(t, 0.05, 0.4))) - lerp(0, 44, easeInOut(seg(t, 0.84, 1)))) * fit;
      target.set(lerp(0, -3, easeInOut(seg(t, 0.84, 1))), lerp(0, 1, ex), lerp(0, 1.5, ex));
      orbit(camera, target, az, el, dist);
      shiftView(camera, W, H, 0, (mobile ? 0.2 : 0.15) * (1 - smooth(seg(t, 0.03, 0.2))));
      lights.rimA.intensity = 90000 * (0.8 + 0.6 * Math.sin(t * TAU));
    },
  };
}
