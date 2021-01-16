import { PerspectiveCamera } from '../../lib/three.module.js';

const createCamera = function (fov, aspect, near, far) {
  return new PerspectiveCamera(fov, aspect, near, far);
};

// 네임 스페이스 - 카메라 관련 함수들
const CustomCamera = {
  camera: null,
};

CustomCamera.init = function () {
  const camera = createCamera(85, 2, 0.1, 8);
  camera.up.set(0, 0, 1);
  camera.position.set(2.5, 2.5, 2.5);
  camera.lookAt(0, 0, 0);
  this.camera = camera;

  return this.camera;
};

CustomCamera.setAspect = function (aspect) {
  this.camera.aspect = aspect;
};

export default CustomCamera;
