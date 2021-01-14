import { Scene, DirectionalLight } from '../../lib/three.module.js';

const createScene = function () {
  return new Scene();
};

const createLight = function (color, intensity) {
  return new DirectionalLight(color, intensity);
};

const scene = createScene();
const light = createLight(0xffffff, 1);
light.position.set(-1, 2, 4);
scene.add(light);

export default scene;
