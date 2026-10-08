// Offscreen render page. Driven by scripts/render/render.mjs through
// window.renderFrame(i, total) -> PNG data URL.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const q = new URLSearchParams(location.search);
const sceneName = q.get("scene");
const W = Number(q.get("w") ?? 1440);
const H = Number(q.get("h") ?? 810);
const mobile = q.get("mobile") === "1";

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, W / H, 0.1, 4000);
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = envTex;

const mod = await import(`/scripts/render/scenes/${sceneName}.js`);
const api = await mod.default({ THREE, scene, camera, renderer, W, H, aspect: W / H, mobile, envTex });

renderer.toneMappingExposure = api.exposure ?? 1;
const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), api.bloom?.strength ?? 0.6, api.bloom?.radius ?? 0.5, api.bloom?.threshold ?? 0.85);
composer.addPass(bloom);
composer.addPass(new OutputPass());

window.renderFrame = async (i, total) => {
  api.update(total > 1 ? i / total : 0, i, total);
  camera.updateMatrixWorld();
  composer.render();
  return renderer.domElement.toDataURL("image/png");
};
window.__info = () => {
  const gl = renderer.getContext();
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return { gpu: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "unknown", triangles: renderer.info.render.triangles };
};
window.__ready = true;
