import { PerspectiveCamera } from '../../lib/three.module.js';

const createCamera = function (fov, aspect, near, far) {
  return new PerspectiveCamera(fov, aspect, near, far);
};

const camera = createCamera(75, 2, 0.1, 5);
camera.up.set(0, 0, 1);
camera.position.set(1.5, 1.5, 1.5);
camera.lookAt(0, 0, 0);

export default camera;
