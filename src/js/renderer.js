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

Renderer.resizeRenderToDisplaySize = function (renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0;
  const height = (canvas.clientHeight * pixelRatio) | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }

  return needResize;
};

export default Renderer;
