import { AxesHelper } from '../../lib/three.module.js';

// X(빨강), Y(초록), Z(파랑) 축 표시
const axesHelper = function (len) {
  return new AxesHelper(len);
};
// const axesHelper = new AxesHelper(3);

const isEmpty = function (object) {
  if (object === null || object === undefined) return true;
  if (Array.isArray(object)) {
    if (!object.length) return true;
    if (object.length > 1) return false;
    return Array.isArray(object[0]) ? isEmpty(object[0]) : false;
  }

  return false;
};

export { axesHelper, isEmpty };
