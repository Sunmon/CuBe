import { PerspectiveCamera } from '../../lib/three.module.js';

const createCamera = function (fov, aspect, near, far) {
  return new PerspectiveCamera(fov, aspect, near, far);
};

const camera = createCamera(75, 2, 0.1, 5);
camera.position.z = 5;

export default camera;
