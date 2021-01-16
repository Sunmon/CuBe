import { PerspectiveCamera } from '../../lib/three.module.js';

const createCamera = function (fov, aspect, near, far) {
  return new PerspectiveCamera(fov, aspect, near, far);
};

// 네임 스페이스 - 외부에서 사용할 카메라에 관한 함수들
const Camera = {};

Camera.init = function () {
  const camera = createCamera(85, 2, 0.1, 8);
  camera.up.set(0, 0, 1);
  camera.position.set(2.5, 2.5, 2.5);
  camera.lookAt(0, 0, 0);

  return camera;
};

Camera.setAspect = function (camera, aspect) {
  camera.aspect = aspect;
};

export default Camera;
