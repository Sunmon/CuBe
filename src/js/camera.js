import { PerspectiveCamera } from 'three';

export default class CustomCamera {
  constructor() {
    this.camera = CustomCamera.createCamera(85, 2, 5, 20);
    this.camera.position.set(6, 4, 6);
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
