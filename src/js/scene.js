import { Scene, DirectionalLight } from '../../lib/three.module.js';
import { axesHelper } from '../common/common.js';

const createScene = function () {
  return new Scene();
};

const createLight = function (color, intensity) {
  return new DirectionalLight(color, intensity);
};

const setObjectPosition = function (x, y, z, obj) {
  obj.position.x = x;
  obj.position.y = y;
  obj.position.z = z;
};

// namespace
const CustomScene = {};

CustomScene.init = function () {
  const scene = createScene();
  const light = createLight(0xffffff, 1);
  light.position.set(8, 8, 8);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  scene.add(light.target);
  scene.add(axesHelper(3));

  return scene;
};

CustomScene.addObject = function (x, y, z, obj, scene) {
  setObjectPosition(x, y, z);
  scene.add(obj);
};

export default CustomScene;
