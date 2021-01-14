import { PerspectiveCamera } from '../../lib/three.module.js';

// 참고: https://medium.com/@indongyoo/functional-es-%EB%B6%80%EB%A1%9D-%ED%81%B4%EB%9E%98%EC%8A%A4-%EC%97%86%EC%9D%B4-%EC%BD%94%EB%94%A9%ED%95%98%EA%B8%B0-f79d5781391b
const createCamera = function (fov, aspect, near, far) {
  return new PerspectiveCamera(fov, aspect, near, far);
};

// 네임 스페이스 - 외부에서 사용할 카메라에 관한 함수들
const Camera = {};

Camera.init = function () {
  const camera = createCamera(75, 2, 0.1, 5);
  camera.up.set(0, 0, 1);
  camera.position.set(1.5, 1.5, 1.5);
  camera.lookAt(0, 0, 0);

  return camera;
};

Camera.setAspect = function (camera, aspect) {
  camera.aspect = aspect;
};

export default Camera;
