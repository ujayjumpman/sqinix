// Shared helpers for the procedural hardware scenes (browser module).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/addons/objects/Reflector.js";

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
/** local progress of t inside [a,b], clamped 0..1 */
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeOutBack = (t, s = 1.2) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
/** deterministic pseudo-random in [0,1) */
export const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function rbox(w, h, d, r = 0.4, seg = 3) {
  return new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
}

export function materials() {
  return {
    black: new THREE.MeshStandardMaterial({ color: 0x0c0e13, roughness: 0.58, metalness: 0.25 }),
    matte: new THREE.MeshStandardMaterial({ color: 0x15181f, roughness: 0.85, metalness: 0.05 }),
    gun: new THREE.MeshStandardMaterial({ color: 0x2b313b, roughness: 0.32, metalness: 0.9 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xc9cfd9, roughness: 0.26, metalness: 1 }),
    brushed: new THREE.MeshStandardMaterial({ color: 0x9aa3b0, roughness: 0.42, metalness: 1 }),
    pcb: new THREE.MeshStandardMaterial({ color: 0x0a1c24, roughness: 0.5, metalness: 0.25 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xd8b25a, roughness: 0.3, metalness: 1 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x2c3f52,
      roughness: 0.03,
      metalness: 0,
      transparent: true,
      opacity: 0.1,
      envMapIntensity: 1.2,
      specularIntensity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  };
}

/** HDR emissive material (values > 1 feed the bloom pass). */
export function glow(color = 0x2aa3ff, intensity = 2) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
  m.color.multiplyScalar(intensity);
  return m;
}
export function setGlow(mat, hue, intensity = 2, sat = 1, light = 0.5) {
  mat.color.setHSL(((hue % 1) + 1) % 1, sat, light);
  mat.color.multiplyScalar(intensity);
}

export function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** Plate with a rectangular or circular hole. axis: the thin axis is Z (extruded). */
export function plateWithHoles(w, h, depth, holes = [], r = 0.6) {
  const s = roundedRectShape(w, h, r);
  for (const hl of holes) {
    const p = new THREE.Path();
    if (hl.r) p.absarc(hl.x, hl.y, hl.r, 0, TAU, true);
    else {
      const x0 = hl.x - hl.w / 2, y0 = hl.y - hl.h / 2;
      p.moveTo(x0, y0);
      p.lineTo(x0, y0 + hl.h);
      p.lineTo(x0 + hl.w, y0 + hl.h);
      p.lineTo(x0 + hl.w, y0);
      p.lineTo(x0, y0);
    }
    s.holes.push(p);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 40 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/**
 * A case/PC fan. Faces +Z. size = frame width. Returns parts so a scene can
 * spin the rotor and tint the rim light.
 */
export function makeFan({ size = 12, blades = 9, M, frame = true, rim = true, bladeColor = 0x10131a, thick = 2.4 }) {
  const g = new THREE.Group();
  const R = size * 0.46;
  const hubR = size * 0.17;
  if (frame) {
    const f = new THREE.Mesh(
      plateWithHoles(size, size, thick, [{ x: 0, y: 0, r: R }], size * 0.1),
      M.black
    );
    g.add(f);
  }
  const rotor = new THREE.Group();
  g.add(rotor);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(hubR, hubR * 1.02, thick * 0.9, 40).rotateX(Math.PI / 2), M.black);
  rotor.add(hub);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(hubR * 0.78, 40), M.gun);
  cap.position.z = thick * 0.46;
  rotor.add(cap);
  const bladeMat = new THREE.MeshStandardMaterial({ color: bladeColor, roughness: 0.38, metalness: 0.5, side: THREE.DoubleSide });
  const a = hubR * 0.85, b = R * 0.985;
  const sh = new THREE.Shape();
  sh.moveTo(a, -size * 0.03);
  sh.bezierCurveTo(a + (b - a) * 0.35, -size * 0.06, a + (b - a) * 0.8, size * 0.0, b, size * 0.07);
  sh.lineTo(b, size * 0.27);
  sh.bezierCurveTo(a + (b - a) * 0.75, size * 0.2, a + (b - a) * 0.35, size * 0.12, a, size * 0.075);
  sh.closePath();
  const bg = new THREE.ExtrudeGeometry(sh, { depth: thick * 0.08, bevelEnabled: false, curveSegments: 14 });
  bg.translate(0, 0, -thick * 0.04);
  for (let k = 0; k < blades; k++) {
    const bl = new THREE.Mesh(bg, bladeMat);
    const holder = new THREE.Group();
    bl.rotation.x = 0.62; // angle of attack around the radial axis
    holder.add(bl);
    holder.rotation.z = (k / blades) * TAU;
    rotor.add(holder);
  }
  let rimMesh = null;
  const rimMat = glow(0x2aa3ff, 2);
  if (rim) {
    rimMesh = new THREE.Mesh(new THREE.TorusGeometry(R + size * 0.015, size * 0.016, 10, 96), rimMat);
    rimMesh.position.z = thick * 0.5 + 0.45;
    g.add(rimMesh);
    const hubRing = new THREE.Mesh(new THREE.TorusGeometry(hubR * 0.9, size * 0.012, 8, 48), rimMat);
    hubRing.position.z = thick * 0.5 + 0.47;
    rotor.add(hubRing);
  }
  return { group: g, rotor, rimMat, R, size };
}

/** Soft radial-gradient CanvasTexture (alpha falloff) for fake shadows / glows. */
export function radialTexture(inner = "rgba(0,0,0,0.85)", outer = "rgba(0,0,0,0)", size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d");
  const gr = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner);
  gr.addColorStop(1, outer);
  x.fillStyle = gr;
  x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function contactShadow(scene, w, d, y = 0.05, opacity = 0.85) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ map: radialTexture(`rgba(0,0,0,${opacity})`, "rgba(0,0,0,0)"), transparent: true, depthWrite: false })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  scene.add(m);
  return m;
}

export const BG = 0x05070b;

/**
 * Dark studio: solid background, glossy fading floor, key + rim lights tinted
 * with the brand blues. Returns the lights so scenes can animate them.
 */
export function stage({ scene, renderer, W, H, floorY = 0, floorR = 420, accent = 0x2aa3ff, accent2 = 0x6d5cff, reflection = true, key = 3.4 }) {
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, floorR * 0.55, floorR * 1.15);
  scene.environmentIntensity = 0.62;

  const lights = {};
  const dir = new THREE.DirectionalLight(0xdfeaff, key);
  dir.position.set(70, 140, 110);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  Object.assign(dir.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 10, far: 420 });
  dir.shadow.bias = -0.0004;
  dir.shadow.normalBias = 0.4;
  scene.add(dir);
  lights.key = dir;

  const rimA = new THREE.SpotLight(accent, 90000, 600, 0.9, 0.9, 2);
  rimA.position.set(-130, 90, -120);
  rimA.target.position.set(0, 20, 0);
  scene.add(rimA, rimA.target);
  const rimB = new THREE.SpotLight(accent2, 60000, 600, 0.9, 0.9, 2);
  rimB.position.set(140, 60, -110);
  rimB.target.position.set(0, 20, 0);
  scene.add(rimB, rimB.target);
  lights.rimA = rimA;
  lights.rimB = rimB;

  scene.add(new THREE.HemisphereLight(0x7aa6ff, 0x05070b, 0.4));

  if (reflection) {
    const refl = new Reflector(new THREE.CircleGeometry(floorR, 80), {
      textureWidth: Math.floor(W * 0.6),
      textureHeight: Math.floor(H * 0.6),
      color: 0x7f8794,
      clipBias: 0.003,
    });
    refl.rotation.x = -Math.PI / 2;
    refl.position.y = floorY - 0.02;
    scene.add(refl);
  }
  // veil: darkens the mirror and fades it into the background colour
  const veil = new THREE.Mesh(
    new THREE.CircleGeometry(floorR, 80),
    new THREE.MeshBasicMaterial({
      map: radialTexture("rgba(5,7,11,0.78)", "rgba(5,7,11,1)", 512),
      transparent: true,
      depthWrite: false,
      fog: false,
    })
  );
  veil.rotation.x = -Math.PI / 2;
  veil.position.y = floorY + 0.01;
  scene.add(veil);
  veil.material.map.center.set(0.5, 0.5);
  // shadow catcher (reflector does not receive shadows)
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(floorR, floorR), new THREE.ShadowMaterial({ opacity: 0.55 }));
  catcher.rotation.x = -Math.PI / 2;
  catcher.position.y = floorY + 0.02;
  catcher.receiveShadow = true;
  scene.add(catcher);
  return lights;
}

/** Camera on a sphere around `target`. az=0 looks from +Z toward the origin; +az swings toward +X. */
export function orbit(camera, target, az, el, dist) {
  camera.position.set(
    target.x + dist * Math.sin(az) * Math.cos(el),
    target.y + dist * Math.sin(el),
    target.z + dist * Math.cos(az) * Math.cos(el)
  );
  camera.lookAt(target);
}

export function shadowify(obj, cast = true, receive = false) {
  obj.traverse((o) => {
    if (o.isMesh && !o.material.transparent) {
      o.castShadow = cast;
      o.receiveShadow = receive;
    }
  });
}

/** Group helper: returns a group with children added. */
export function group(...children) {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
}

export function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

/**
 * Slides the whole rendered image inside the frame without moving the camera.
 * dx > 0 moves content right, dy > 0 moves content down (fractions of the frame).
 * Used to leave room for headline copy in the opening frames of each film.
 */
export function shiftView(camera, W, H, dx = 0, dy = 0) {
  if (!dx && !dy) {
    camera.clearViewOffset();
    return;
  }
  camera.setViewOffset(W, H, -dx * W, -dy * H, W, H);
}
