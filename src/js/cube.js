// import * as THREE from 'three'; // webpack으로 모듈 사용시
import * as THREE from '../../lib/three.module.js';

let renderer;
let scene;
let camera;

const createCamera = function (fov, aspect, near, far) {
  return new THREE.PerspectiveCamera(fov, aspect, near, far);
};

const createBoxGeometry = function (width, height, depth) {
  return new THREE.BoxGeometry(width, height, depth);
};

const createMeshMaterial = function (color) {
  return new THREE.MeshBasicMaterial({ color });
};

const createTestBox = function () {
  const geometry = createBoxGeometry(1, 1, 1);
  const material = createMeshMaterial(0x00ff00);
  return new THREE.Mesh(geometry, material);
};

const createScene = function () {
  return new THREE.Scene();
};

const createRenderer = function (canvas) {
  return new THREE.WebGLRenderer({ canvas });
};

export const init = function () {
  const canvas = document.querySelector('#canvas');
  const cube = createTestBox();

  camera = createCamera(75, 2, 0.1, 5);
  camera.position.z = 5;
  scene = createScene();
  scene.add(cube);
  renderer = createRenderer(canvas);
  renderer.render(scene, camera);
};
