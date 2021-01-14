import { WebGLRenderer } from '../../lib/three.module.js';
import { CANVAS } from '../common/constants.js';

const createRenderer = function (canvas) {
  return new WebGLRenderer({ canvas });
};

const renderer = createRenderer(CANVAS);
export default renderer;
