import { PerspectiveCamera } from '../../lib/three.module.js';

const createCamera = function (fov, aspect, near, far) {
  return new PerspectiveCamera(fov, aspect, near, far);
};

// 네임 스페이스 - 카메라 관련 함수들
const CustomCamera = {
  camera: null,
};

CustomCamera.init = function () {
  const camera = createCamera(75, 2, 0.1, 10);
  camera.position.set(1, 3, 5);
  camera.lookAt(0, 0, 0);
  this.camera = camera;

  return this;
};

CustomCamera.updateAspect = function (aspect) {
  this.camera.aspect = aspect;
  this.camera.updateProjectionMatrix();
};

CustomCamera.getCamera = function () {
  return this.camera;
};

export default CustomCamera;
