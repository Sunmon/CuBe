import { WebGLRenderer } from '../../lib/three.module.js';
import { CANVAS } from '../common/constants.js';

const createRenderer = function (canvas) {
  return new WebGLRenderer({ canvas });
};

// namespace - 렌더러에 관한 함수들
const CustomRenderer = {
  renderer: null,
};

CustomRenderer.init = function () {
  const renderer = createRenderer(CANVAS);
  this.renderer = renderer;

  return this;
};

CustomRenderer.getRendererAspect = function () {
  const canvas = this.renderer.domElement;

  return canvas.clientWidth / canvas.clientHeight;
};

CustomRenderer.resizeRenderToDisplaySize = function () {
  const canvas = this.renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = (canvas.clientWidth * pixelRatio) | 0; // round down
  const height = (canvas.clientHeight * pixelRatio) | 0; // round down
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    this.renderer.setSize(width, height, false);
  }

  return needResize;
};

CustomRenderer.render = function (scene, camera) {
  this.renderer.render(scene, camera);
};

CustomRenderer.getCanvas = function () {
  return this.renderer.domElement;
};

export default CustomRenderer;
