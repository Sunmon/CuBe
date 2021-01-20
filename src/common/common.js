import { AxesHelper } from '../../lib/three.module.js';

// X(빨강), Y(초록), Z(파랑) 축 표시
const axesHelper = function (len) {
  return new AxesHelper(len);
};
// const axesHelper = new AxesHelper(3);

export { axesHelper };
