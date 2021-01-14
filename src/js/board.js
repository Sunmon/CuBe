import * as THREE from '../../lib/three.module.js';
import { testBox } from './cube.js';
import camera from './camera.js';
import scene from './scene.js';
import renderer from './renderer.js';

export function init() {
  scene.add(testBox);
  renderer.render(scene, camera);
}
