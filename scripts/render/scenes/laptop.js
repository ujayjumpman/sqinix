// Business line: a slim aluminium laptop opens, powers on and the camera pushes into the screen.
import { materials, stage, orbit, shadowify, glow, rbox, mesh, seg, easeInOut, lerp, smooth, hash, shiftView } from "../lib.js";

function dashboardTexture(THREE) {
  const w = 1280, h = 800;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const x = c.getContext("2d");
  const bg = x.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#07142b"); bg.addColorStop(0.55, "#0d2f5e"); bg.addColorStop(1, "#1b6fb4");
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  // soft glow
  const rg = x.createRadialGradient(w * 0.75, h * 0.2, 10, w * 0.75, h * 0.2, 520);
  rg.addColorStop(0, "rgba(80,190,255,0.35)"); rg.addColorStop(1, "rgba(80,190,255,0)");
  x.fillStyle = rg; x.fillRect(0, 0, w, h);
  const panel = (px, py, pw, ph, a = 0.55) => {
    x.fillStyle = `rgba(8,18,40,${a})`;
    x.strokeStyle = "rgba(140,200,255,0.22)";
    x.lineWidth = 2;
    x.beginPath(); x.roundRect(px, py, pw, ph, 18); x.fill(); x.stroke();
  };
  // sidebar
  panel(30, 30, 210, h - 60, 0.6);
  x.fillStyle = "#4db8ff"; x.beginPath(); x.roundRect(54, 58, 34, 34, 8); x.fill();
  x.fillStyle = "#e8f4ff"; x.font = "700 24px sans-serif"; x.fillText("Console", 100, 85);
  const items = ["Overview", "Devices", "Network", "Storage", "Security", "Reports"];
  items.forEach((t, i) => {
    if (i === 0) { x.fillStyle = "rgba(77,184,255,0.25)"; x.beginPath(); x.roundRect(46, 130 + i * 58, 178, 44, 12); x.fill(); }
    x.fillStyle = i === 0 ? "#ffffff" : "rgba(210,228,255,0.7)";
    x.font = "500 21px sans-serif"; x.fillText(t, 76, 160 + i * 58);
    x.fillStyle = i === 0 ? "#4db8ff" : "rgba(210,228,255,0.35)";
    x.beginPath(); x.arc(60, 152 + i * 58, 6, 0, 7); x.fill();
  });
  // header
  x.fillStyle = "#ffffff"; x.font = "700 40px sans-serif"; x.fillText("Infrastructure overview", 280, 85);
  x.fillStyle = "rgba(210,228,255,0.7)"; x.font = "400 22px sans-serif"; x.fillText("All systems operational", 280, 120);
  // KPI cards
  const kpis = [["Devices online", "1,284", "+4.2%"], ["Network uptime", "99.98%", "stable"], ["Open tickets", "12", "-18%"]];
  kpis.forEach((k, i) => {
    const px = 280 + i * 310;
    panel(px, 150, 290, 130);
    x.fillStyle = "rgba(210,228,255,0.7)"; x.font = "500 20px sans-serif"; x.fillText(k[0], px + 24, 190);
    x.fillStyle = "#fff"; x.font = "700 48px sans-serif"; x.fillText(k[1], px + 24, 246);
    x.fillStyle = "#5fe0b0"; x.font = "600 20px sans-serif"; x.fillText(k[2], px + 190, 246);
  });
  // line chart
  panel(280, 310, 600, 270);
  x.fillStyle = "#e8f4ff"; x.font = "600 22px sans-serif"; x.fillText("Throughput", 304, 348);
  const pts = []; for (let i = 0; i < 24; i++) pts.push(470 - (Math.sin(i * 0.5) * 36 + Math.sin(i * 0.17) * 50 + i * 3.6 + 40) * 0.9);
  x.beginPath();
  pts.forEach((py, i) => { const px = 304 + i * 24.5; i ? x.lineTo(px, py + 70) : x.moveTo(px, py + 70); });
  x.strokeStyle = "#4db8ff"; x.lineWidth = 5; x.lineJoin = "round"; x.stroke();
  x.lineTo(304 + 23 * 24.5, 560); x.lineTo(304, 560); x.closePath();
  const ag = x.createLinearGradient(0, 380, 0, 560); ag.addColorStop(0, "rgba(77,184,255,0.45)"); ag.addColorStop(1, "rgba(77,184,255,0)");
  x.fillStyle = ag; x.fill();
  // donut + bars
  panel(900, 310, 340, 270);
  x.fillStyle = "#e8f4ff"; x.font = "600 22px sans-serif"; x.fillText("Storage", 924, 348);
  const segs = [[0.52, "#4db8ff"], [0.26, "#7a5cff"], [0.14, "#5fe0b0"], [0.08, "#ffffff55"]];
  let a0 = -Math.PI / 2;
  segs.forEach(([f, col]) => { x.beginPath(); x.arc(1070, 455, 78, a0, a0 + f * Math.PI * 2 - 0.05); x.strokeStyle = col; x.lineWidth = 26; x.stroke(); a0 += f * Math.PI * 2; });
  x.fillStyle = "#fff"; x.font = "700 34px sans-serif"; x.textAlign = "center"; x.fillText("78%", 1070, 468); x.textAlign = "left";
  panel(280, 600, 960, 170);
  x.fillStyle = "#e8f4ff"; x.font = "600 22px sans-serif"; x.fillText("Fleet health", 304, 640);
  for (let i = 0; i < 38; i++) {
    const bh = 30 + hash(i * 3.1) * 75;
    x.fillStyle = i % 9 === 4 ? "#7a5cff" : "#4db8ff";
    x.beginPath(); x.roundRect(304 + i * 24.4, 750 - bh, 14, bh, 5); x.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export default async function build({ THREE, scene, camera, renderer, W, H, aspect }) {
  const M = materials();
  const lights = stage({ scene, renderer, W, H, floorY: 0, floorR: 360, key: 3.0 });
  camera.fov = 28;
  camera.updateProjectionMatrix();
  scene.environmentIntensity = 0.38;
  lights.key.intensity = 1.7;
  lights.rimA.intensity = 22000;
  lights.rimB.intensity = 12000;

  const BW = 31.0, BD = 21.6, BH = 1.45;
  const laptop = new THREE.Group();
  scene.add(laptop);
  const alu = new THREE.MeshStandardMaterial({ color: 0x8e96a3, roughness: 0.42, metalness: 1 });
  const aluDark = new THREE.MeshStandardMaterial({ color: 0x4a515c, roughness: 0.38, metalness: 1 });

  // --- base ---
  const base = new THREE.Group();
  base.add(mesh(rbox(BW, BH, BD, 0.7, 4), alu, 0, BH / 2 + 0.25, 0));
  // keyboard well + keys
  base.add(mesh(rbox(BW - 3.4, 0.2, 9.7, 0.3), M.black, 0, BH + 0.25, -3.6));
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.55, metalness: 0.2 });
  const keyGeo = rbox(1.5, 0.35, 1.45, 0.18, 2);
  const rows = [14, 14, 13, 12, 8];
  const keys = [];
  rows.forEach((n, r) => {
    for (let i = 0; i < n; i++) {
      const wide = r === 4 && i === 3 ? 6 : 1;
      if (r === 4 && i > 3 && i < 8) continue;
      const kw = (BW - 4.0) / 14.2;
      const kx = -((BW - 4.0) / 2) + kw * (i + 0.5) + (r === 4 && i > 3 ? 4.6 * kw : 0);
      const kz = -7.5 + r * 1.78;
      const m = new THREE.Mesh(keyGeo, keyMat);
      m.position.set(kx, BH + 0.5, kz);
      m.scale.set(wide === 6 ? 5.9 : 1, 1, 1);
      base.add(m);
      keys.push(m);
    }
  });
  const backlight = glow(0xcfe6ff, 0.55);
  base.add(mesh(new THREE.PlaneGeometry(BW - 3.6, 9.5).rotateX(-Math.PI / 2), backlight, 0, BH + 0.36, -3.6));
  // trackpad
  base.add(mesh(rbox(10.4, 0.12, 6.6, 0.5), new THREE.MeshStandardMaterial({ color: 0x7c8491, roughness: 0.25, metalness: 1 }), 0, BH + 0.3, 6.0));
  // port slots + feet
  base.add(mesh(new THREE.BoxGeometry(0.3, 0.45, 1.6), M.black, BW / 2 + 0.0, 0.8, 1.2));
  base.add(mesh(new THREE.BoxGeometry(0.3, 0.45, 1.6), M.black, BW / 2 + 0.0, 0.8, 3.4));
  base.add(mesh(new THREE.BoxGeometry(0.3, 0.45, 1.6), M.black, -BW / 2 - 0.0, 0.8, 1.2));
  base.add(mesh(new THREE.BoxGeometry(0.3, 0.45, 1.6), M.black, -BW / 2 - 0.0, 0.8, 3.4));
  laptop.add(base);

  // --- lid (pivot at the rear edge of the base) ---
  const pivot = new THREE.Group();
  pivot.position.set(0, BH + 0.25 + 0.15, -BD / 2 + 0.6);
  laptop.add(pivot);
  const lid = new THREE.Group();
  pivot.add(lid);
  lid.add(mesh(rbox(BW, 0.85, BD - 0.2, 0.55, 4), alu, 0, 0.45, (BD - 0.2) / 2));
  // inner bezel + glossy screen (facing -Y in the closed pose)
  lid.add(mesh(rbox(BW - 0.8, 0.12, BD - 1.2, 0.45), M.black, 0, 0.0, (BD - 0.2) / 2));
  const tex = dashboardTexture(THREE);
  const screenMat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.0, 0.0, 0.0) });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(BW - 1.9, BD - 3.0).rotateX(Math.PI / 2), screenMat);
  screen.position.set(0, -0.07, (BD - 0.2) / 2 + 0.2);
  lid.add(screen);
  // webcam dot + hinge barrel
  lid.add(mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), glow(0x44ff99, 1.2), 0, -0.1, BD - 1.1).rotateX(0));
  const hinge = mesh(new THREE.CylinderGeometry(0.55, 0.55, BW * 0.7, 28).rotateZ(Math.PI / 2), aluDark, 0, 0.05, 0.1);
  pivot.add(hinge);
  shadowify(laptop, true, true);

  // --- a soft light on the keyboard deck from the screen ---
  const screenLight = new THREE.PointLight(0x6bc4ff, 0, 120, 2);
  scene.add(screenLight);

  const target = new THREE.Vector3(0, 8, 0);
  const fit = aspect < 1 ? 1.5 : 1;
  const OPEN = 1.88; // ~108 degrees

  return {
    exposure: 1.1,
    bloom: { strength: 0.45, radius: 0.45, threshold: 1.15 },
    update(t) {
      const open = easeInOut(seg(t, 0.1, 0.46));
      const alpha = open * OPEN;
      lid.rotation.x = -alpha;
      const power = smooth(seg(t, 0.34, 0.5));
      screenMat.color.setScalar(0.04 + power * 1.0);
      backlight.color.setRGB(0.1 * power, 0.22 * power, 0.42 * power);
      screenLight.intensity = 500 * power;
      // light position follows the lid
      const ly = Math.sin(alpha) * 9 + BH, lz = -BD / 2 + 0.6 + Math.cos(alpha) * 9;
      screenLight.position.set(0, ly + 2, lz + 6);
      // lid lifts to follow the hinge
      laptop.rotation.y = lerp(0.0, 0.0, t);
      // camera
      const a1 = easeInOut(seg(t, 0, 0.5));
      const a2 = easeInOut(seg(t, 0.5, 0.82));
      const a3 = easeInOut(seg(t, 0.82, 1));
      const az = lerp(-1.0, -0.38, a1) + lerp(0, 0.9, a2) - lerp(0, 0.98, a3);
      const el = lerp(0.46, 0.2, a1) + lerp(0, 0.04, a2) - lerp(0, 0.16, a3);
      const dist = (lerp(72, 66, a1) - lerp(0, 8, a2) - lerp(0, 18, a3)) * fit;
      target.set(lerp(0, 0, a1), lerp(4, 8.5, a1) + lerp(0, 1, a3), lerp(0, -1.5, a1) - lerp(0, 3, a3));
      orbit(camera, target, az, el, dist);
      shiftView(camera, W, H, 0, (aspect < 1 ? 0.2 : 0.15) * (1 - smooth(seg(t, 0.03, 0.2))));
    },
  };
}
