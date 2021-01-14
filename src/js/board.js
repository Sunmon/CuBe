import * as THREE from '../../lib/three.module.js';
import { testBox } from './cube.js';
import Camera from './camera.js';
import scene from './scene.js';
import Renderer from './renderer.js';

export function init() {
  const camera = Camera.init();
  const renderer = Renderer.init();
  scene.add(testBox);
  renderer.render(scene, camera);
  animate(camera, renderer);
}

const render = function (camera, renderer, time) {
  time *= 0.005;
  camera.aspect = Renderer.getRendererAspect(renderer);
  camera.updateProjectionMatrix();
  testBox.rotation.y = time;
  renderer.render(scene, camera);
};

const animate = function (camera, renderer) {
  const time = requestAnimationFrame(() => animate(camera, renderer));
  render(camera, renderer, time);
};
