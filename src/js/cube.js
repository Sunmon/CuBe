// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as THREE from '../../lib/three.module.js';
import { CUBE_SIZE } from '../common/constants.js';

const addObject = function (target, obj) {
  target.add(obj);
};

// namespace
const Cube = {};

Cube.core = {
  center: new THREE.Object3D(),
  xAxis: CustomMesh.createLine([-CUBE_SIZE, 0, 0], [CUBE_SIZE, 0, 0]),
  yAxis: CustomMesh.createLine([0, -CUBE_SIZE / 2, 0], [0, CUBE_SIZE / 2, 0]),
  zAxis: CustomMesh.createLine([0, 0, -CUBE_SIZE / 2], [0, 0, CUBE_SIZE / 2]),
};

Cube.createPlane = function (color) {
  return CustomMesh.createPlane(CUBE_SIZE, CUBE_SIZE, color);
};

// Z -> X -> Y 순으로 회전 (오일러 회전과 순서를 맞춤)
Cube.init = function () {
  addObject(this.core.center, this.core.zAxis);
  addObject(this.core.center, this.core.xAxis);
  addObject(this.core.center, this.core.yAxis);

  // TODO: line으로부터방향 알아내서 testPlane에 법선으로 적용하기
  const plane = this.createPlane(0x57838f);
  plane.translateY(CUBE_SIZE / 2);
  plane.rotateX(-Math.PI / 2);
  addObject(this.core.yAxis, plane);
};

export default Cube;
