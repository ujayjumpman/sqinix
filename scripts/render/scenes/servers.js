// Infrastructure line: a dolly shot down a dark data-centre aisle lined with blinking server racks.
import { materials, rbox, glow, hash, seg, easeInOut, lerp, smooth, BG, shiftView } from "../lib.js";
import { Reflector } from "three/addons/objects/Reflector.js";

export default async function build({ THREE, scene, camera, renderer, W, H, aspect }) {
  const M = materials();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(0x05080f, 180, 820);
  scene.environmentIntensity = 0.25;
  camera.fov = 56;
  camera.updateProjectionMatrix();

  const AISLE = 150; // aisle width (x)
  const RACK_W = 60, RACK_D = 100, RACK_H = 210, UNITS = 42, UH = 4.45;
  const COUNT = 16; // racks per side
  const LEN = COUNT * RACK_W;
  const z0 = 260; // first rack centre z (front of the tunnel)

  // ------------------------------------------------------------ floor (mirror + veil)
  const floorGeo = new THREE.PlaneGeometry(AISLE + 2 * RACK_D, LEN + 1200);
  const floor = new Reflector(floorGeo, {
    textureWidth: Math.floor(W * 0.6), textureHeight: Math.floor(H * 0.6), color: 0x6c7684, clipBias: 0.003,
  });
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.02, z0 - LEN / 2);
  scene.add(floor);
  const veil = new THREE.Mesh(
    floorGeo,
    new THREE.MeshBasicMaterial({ color: 0x04070c, transparent: true, opacity: 0.62, depthWrite: false })
  );
  veil.rotation.x = -Math.PI / 2;
  veil.position.set(0, 0.01, z0 - LEN / 2);
  scene.add(veil);

  // ------------------------------------------------------------ ceiling + light strips
  const ceilY = RACK_H + 55;
  const ceil = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({ color: 0x0a0d13, roughness: 0.9 }));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, ceilY, z0 - LEN / 2);
  scene.add(ceil);
  const stripMat = glow(0xbfdcff, 1.8);
  const stripBlue = glow(0x2aa3ff, 1.5);
  const strips = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 1.2, 46), stripMat, COUNT * 2);
  const tray = new THREE.InstancedMesh(new THREE.BoxGeometry(34, 6, RACK_W - 4), M.gun, COUNT);
  const trim = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 0.8, RACK_W - 6), stripBlue, COUNT * 2);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < COUNT; i++) {
    const z = z0 - i * RACK_W;
    m4.makeTranslation(-14, ceilY - 0.7, z); strips.setMatrixAt(i * 2, m4);
    m4.makeTranslation(14, ceilY - 0.7, z); strips.setMatrixAt(i * 2 + 1, m4);
    m4.makeTranslation(0, ceilY - 18, z); tray.setMatrixAt(i, m4);
    m4.makeTranslation(-AISLE / 2 + 4, RACK_H + 12, z); trim.setMatrixAt(i * 2, m4);
    m4.makeTranslation(AISLE / 2 - 4, RACK_H + 12, z); trim.setMatrixAt(i * 2 + 1, m4);
  }
  scene.add(strips, tray, trim);

  // ------------------------------------------------------------ racks
  const unitCount = COUNT * 2 * UNITS;
  const vc = document.createElement("canvas");
  vc.width = 512; vc.height = 64;
  const vx = vc.getContext("2d");
  vx.fillStyle = "#2e3541"; vx.fillRect(0, 0, 512, 64);
  vx.fillStyle = "#07090d";
  for (let i = 0; i < 48; i++) vx.fillRect(130 + i * 7, 12, 3.2, 40);
  vx.fillStyle = "#4a5362"; vx.fillRect(0, 0, 512, 5); vx.fillRect(0, 59, 512, 5);
  vx.fillStyle = "#12161d"; vx.fillRect(8, 14, 90, 36);
  const vtex = new THREE.CanvasTexture(vc);
  vtex.colorSpace = THREE.SRGBColorSpace;
  vtex.anisotropy = 8;
  const panelMat = new THREE.MeshStandardMaterial({ map: vtex, roughness: 0.5, metalness: 0.2 });
  const panels = new THREE.InstancedMesh(new THREE.BoxGeometry(6, UH - 0.5, RACK_W - 8), panelMat, unitCount);
  const body = new THREE.InstancedMesh(
    new THREE.BoxGeometry(RACK_D, RACK_H, RACK_W - 1.2),
    new THREE.MeshStandardMaterial({ color: 0x07090d, roughness: 0.8, metalness: 0.3 }),
    COUNT * 2
  );
  const post = new THREE.InstancedMesh(rbox(2.4, RACK_H + 4, 2.4, 0.6), M.gun, COUNT * 2 * 2);
  const dummy = new THREE.Object3D();
  let pi = 0;
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? -1 : 1; // -1 = left row (faces +x), +1 = right row (faces -x)
    const faceX = sx * (AISLE / 2);
    for (let r = 0; r < COUNT; r++) {
      const z = z0 - r * RACK_W;
      dummy.position.set(faceX + sx * (RACK_D / 2 + 0.2), RACK_H / 2, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      body.setMatrixAt(side * COUNT + r, dummy.matrix);
      for (const k of [-1, 1]) {
        dummy.position.set(faceX + sx * 0.4, RACK_H / 2, z + k * (RACK_W / 2 - 1.6));
        dummy.updateMatrix();
        post.setMatrixAt((side * COUNT + r) * 2 + (k + 1) / 2, dummy.matrix);
      }
      for (let u = 0; u < UNITS; u++) {
        const empty = hash(r * 97 + u * 13 + side * 7) > 0.9;
        dummy.position.set(faceX + sx * 3.4, 6 + u * UH + UH / 2, z);
        dummy.scale.set(empty ? 0.05 : 1, 1, 1);
        dummy.updateMatrix();
        panels.setMatrixAt(pi++, dummy.matrix);
      }
    }
  }
  scene.add(body, post, panels);

  // ------------------------------------------------------------ LEDs (per-instance colour, animated)
  const LED_PER = 4;
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.8, 0.9, 1.1), new THREE.MeshBasicMaterial({ color: 0xffffff }), unitCount * LED_PER);
  const ledInfo = [];
  let li = 0;
  for (let side = 0; side < 2; side++) {
    const sx = side === 0 ? -1 : 1;
    const faceX = sx * (AISLE / 2);
    for (let r = 0; r < COUNT; r++) {
      const z = z0 - r * RACK_W;
      for (let u = 0; u < UNITS; u++) {
        for (let k = 0; k < LED_PER; k++) {
          dummy.position.set(faceX + sx * 0.05, 6 + u * UH + UH / 2, z - RACK_W / 2 + 7 + 3.4 + k * 2.4);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          leds.setMatrixAt(li, dummy.matrix);
          ledInfo.push({ seed: side * 100000 + r * 1000 + u * 10 + k, k });
          li++;
        }
      }
    }
  }
  scene.add(leds);
  leds.setColorAt(0, new THREE.Color(0, 0, 0));
  const palette = [new THREE.Color(0.08, 0.75, 1.7), new THREE.Color(0.05, 1.4, 0.5), new THREE.Color(1.7, 0.9, 0.05), new THREE.Color(0.2, 1.0, 1.5)];
  const off = new THREE.Color(0.01, 0.015, 0.02);

  // ------------------------------------------------------------ far-end glow, headlight
  const endGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(34, RACK_H * 0.92),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0.65, 1.15, 1.9), fog: false })
  );
  endGlow.position.set(0, RACK_H * 0.46, z0 - LEN - 40);
  scene.add(endGlow);
  const head = new THREE.PointLight(0xaed4ff, 0, 600, 2);
  const head2 = new THREE.PointLight(0x7fb8ff, 0, 800, 2);
  scene.add(head, head2);
  scene.add(new THREE.HemisphereLight(0x6f9ad8, 0x05070b, 0.4));

  const camTarget = new THREE.Vector3();

  return {
    exposure: 0.95,
    bloom: { strength: 0.55, radius: 0.4, threshold: 1.15 },
    update(t, frame) {
      const tick = frame * 0.5;
      for (let i = 0; i < ledInfo.length; i++) {
        const { seed, k } = ledInfo[i];
        const h = hash(seed);
        let on;
        if (k < 1) on = h > 0.2; // power LED steady
        else {
          const period = 3 + Math.floor(h * 9);
          on = hash(seed + Math.floor((tick + h * 40) / period)) > 0.62;
        }
        const c = on ? palette[k < 1 ? (h > 0.94 ? 2 : 1) : (h > 0.93 ? 2 : h > 0.45 ? 0 : 3)] : off;
        leds.setColorAt(i, c);
      }
      leds.instanceColor.needsUpdate = true;

      const e = easeInOut(seg(t, 0, 1));
      const z = lerp(z0 + 120, z0 - LEN + 230, e);
      const sway = Math.sin(t * Math.PI * 2) * 3.5;
      const rise = lerp(92, 104, smooth(seg(t, 0.55, 1)));
      camera.position.set(sway, rise, z);
      camTarget.set(Math.sin(t * Math.PI * 2 + 1) * 4, lerp(98, 112, smooth(seg(t, 0.6, 1))), z - 300);
      camera.lookAt(camTarget);
      head.position.set(camera.position.x, camera.position.y + 50, camera.position.z - 70);
      head.intensity = 60000;
      head2.position.set(camera.position.x, camera.position.y + 50, camera.position.z - 260);
      head2.intensity = 80000;
      camera.fov = lerp(58, 48, smooth(seg(t, 0.7, 1)));
      camera.updateProjectionMatrix();
      shiftView(camera, W, H, 0, (aspect < 1 ? 0.16 : 0.12) * (1 - smooth(seg(t, 0.03, 0.2))));
    },
  };
}
