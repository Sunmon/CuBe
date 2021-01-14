import { WebGLRenderer } from '../../lib/three.module.js';
import { CANVAS } from '../common/constants.js';

const createRenderer = function (canvas) {
  return new WebGLRenderer({ canvas });
};

// namespace - 렌더러에 관한 함수들
const Renderer = {};

Renderer.init = function () {
  const renderer = createRenderer(CANVAS);
  return renderer;
};

Renderer.getRendererAspect = function (renderer) {
  const canvas = renderer.domElement;
  return canvas.clientWidth / canvas.clientHeight;
};

export default Renderer;
