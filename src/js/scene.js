import {
  Scene,
  PointLight,
  SpotLight,
  PlaneGeometry,
  Mesh,
  MeshToonMaterial,
} from '../../lib/three.module.js';
import { WHITE } from '../common/constants.js';
import Utils from '../common/utils.js';
import CustomMesh from './mesh.js';

export default class CustomScene {
  constructor() {
    const mainLight = CustomScene.createSpotLight(WHITE, 0.8);
    const subLight = CustomScene.createPointLight(WHITE, 0.5);
    const floor = CustomScene.createFloor();
    this.scene = CustomScene.createScene(
      mainLight,
      mainLight.target,
      subLight,
      Utils.axesHelper(3),
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
    // light.distance = 30;
    // light.penumbra = 0.1;
    // light.castShadow = true;

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
    const texture = CustomMesh.createTexture('asset/checker.png');
    texture.repeat.set(repeats, repeats);
    const planeGeo = new PlaneGeometry(planeSize, planeSize);
    const planeMat = new MeshToonMaterial({
      map: texture,
    });
    const mesh = new Mesh(planeGeo, planeMat);
    mesh.position.y = -2;
    mesh.rotation.x = Math.PI * -0.5;

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
