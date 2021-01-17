import * as THREE from '../../lib/three.module.js';
import Cube from './cube.js';
import CustomCamera from './camera.js';
import CustomScene from './scene.js';
import CustomRenderer from './renderer.js';

const camera = CustomCamera.init();
const renderer = CustomRenderer.init();
const scene = CustomScene.init();
const core = Cube.core;

const render = function (camera, renderer, time) {
  time *= 0.005;
  if (renderer.resizeRenderToDisplaySize()) {
    camera.updateAspect(renderer.getRendererAspect());
  }
  // TODO: 0,0,0을 중심으로 회전하도록 수정
  core.center.rotation.z = time;
  core.yAxis.rotation.y = time;
  renderer.render(scene, camera.getCamera());
};

const animate = function (camera, renderer) {
  const time = requestAnimationFrame(() => animate(camera, renderer));
  render(camera, renderer, time);
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  // renderer.render(scene, camera.getCamera());
  Cube.init();
  scene.add(core.center);
  animate(camera, renderer);
}
