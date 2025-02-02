import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { RGBELoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';

const gui = new GUI();

const [width, height] = [window.innerWidth, window.innerHeight];
const canvas = document.getElementById('canvas');

const rgbeLoader = new RGBELoader();

const scene = new THREE.Scene();

gui.add(scene, 'environmentIntensity').min(0).max(3).step(0.001);
gui.add(scene, 'backgroundIntensity').min(0).max(3).step(0.001);

rgbeLoader.load('static/spruit_sunrise_1k.hdr', (environmentMaps) => {
  environmentMaps.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = environmentMaps;
  scene.environment = environmentMaps;
});

const ambeintLight = new THREE.AmbientLight('white', 3.5);
scene.add(ambeintLight);

const camera = new THREE.PerspectiveCamera(75, width / height);
camera.position.z = 4;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const torusknotMaterial = new THREE.MeshStandardMaterial({
  metalness: 1,
  roughness: 0.1,
});

torusknotMaterial.metalness = 1;
torusknotMaterial.roughness = 0;

const TorusKnotMesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  torusknotMaterial
);

gui.add(torusknotMaterial, 'metalness').min(0).max(1).step(0.001);
gui.add(torusknotMaterial, 'roughness').min(0).max(1).step(0.001);

TorusKnotMesh.layers.enable(1);
scene.add(TorusKnotMesh);

const CubeRendererTarget = new THREE.WebGLCubeRenderTarget(256, {
  type: THREE.HalfFloatType,
});

scene.background = CubeRendererTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 100, CubeRendererTarget);
cubeCamera.layers.set(1);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(width, height);

const clock = new THREE.Clock();

const tick = () => {
  const getElapsedTime = clock.getElapsedTime();

  TorusKnotMesh.rotation.y = getElapsedTime * 0.4;
  controls.update();
  cubeCamera.update(renderer, scene);

  window.requestAnimationFrame(tick);
  renderer.render(scene, camera);
};

tick();
