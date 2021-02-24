import { Scene, DirectionalLight } from '../../lib/three.module.js';
import Utils from '../common/utils.js';

export default class CustomScene {
  constructor() {
    const light = CustomScene.createLight(0xffffff, 1);
    this.scene = CustomScene.createScene(light, Utils.axesHelper(3));
  }

  static createLight(color, intensity) {
    const light = new DirectionalLight(color, intensity);
    light.position.set(8, 8, 8);
    light.target.position.set(0, 0, 0);

    return light;
  }

  static createScene(...objects) {
    const scene = new Scene();
    objects.forEach(obj => scene.add(obj));

    return scene;
  }

  set scene(scene) {
    this._scene = scene;
  }

  get scene() {
    return this._scene;
  }

  addObject(object) {
    this.scene.add(object);
  }
}
