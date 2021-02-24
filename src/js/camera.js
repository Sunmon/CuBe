import { PerspectiveCamera } from '../../lib/three.module.js';

export default class CustomCamera {
  constructor() {
    this.camera = CustomCamera.createCamera(75, 2, 0.1, 10);
    this.camera.position.set(4, 5, 6);
    this.camera.lookAt(0, 0, 0);
  }

  static createCamera(fov, aspect, near, far) {
    return new PerspectiveCamera(fov, aspect, near, far);
  }

  updateAspect(aspect) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
