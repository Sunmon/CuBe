import {
  Scene,
  PointLight,
  SpotLight,
  RepeatWrapping,
  NearestFilter,
} from 'three';

import { WHITE } from '../common/constants.js';
import CustomMesh from './mesh.js';
import checkImg from '../../assets/checker.png';

export default class CustomScene {
  constructor() {
    const mainLight = CustomScene.createSpotLight(WHITE, 0.8);
    const subLight = CustomScene.createPointLight(WHITE, 0.5);
    const floor = CustomScene.createFloor();
    this.scene = CustomScene.createScene(
      mainLight,
      mainLight.target,
      subLight,
      floor,
    );
  }

  static createPointLight(color, intensity) {
    const light = new PointLight(color, intensity);
    light.position.set(0, 5, 0);
    light.distance = 12;

    return light;
  }

  static createSpotLight(color, intensity) {
    const light = new SpotLight(color, intensity);
    light.position.set(5, 10, 5);
    light.angle = Math.PI / 12;

    return light;
  }

  static createScene(...objects) {
    const scene = new Scene();
    objects.forEach(obj => scene.add(obj));

    return scene;
  }

  static createFloor() {
    const planeSize = 20;
    const repeats = planeSize / 2;
    // const texture = CustomMesh.createTexture('/assets/checker.png');
    const texture = CustomMesh.createTexture(checkImg);
    const mesh = CustomMesh.createPlane(planeSize, planeSize, WHITE);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;
    texture.repeat.set(repeats, repeats);
    mesh.material.map = texture;
    mesh.rotation.x = Math.PI * -0.5;
    mesh.position.y = -2;

    return mesh;
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
