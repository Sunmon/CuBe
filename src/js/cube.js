// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as THREE from '../../lib/three.module.js';
import { CUBE_SIZE } from '../common/constants.js';

const addObject = function (target, obj) {
  target.add(obj);
};

// namespace
const Cube = {
  lastCubeQuaternion: new THREE.Quaternion(),
  rotateDirection: '', // x,y (화면 가로, 화면 세로)
};

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
  // 그냥 line 벡터 알아내서 add한다음에 lookAt하면된다
  const plane = this.createPlane(0x57838f);
  plane.translateY(CUBE_SIZE / 2);
  plane.rotateX(-Math.PI / 2);
  addObject(this.core.yAxis, plane);

  return this;
};

// TODO: 큐브 방향대로 xy대신 다른값으로 바꾸기. RU RL FU 이런걸로...
Cube.updateRotateDirection = function (delta = {}, THRESHOLD = 0.1) {
  if (Math.abs(delta.x) > THRESHOLD) {
    this.rotateDirection = 'x';
  } else if (Math.abs(delta.y) > THRESHOLD) {
    this.rotateDirection = 'y';
  }

  return this.rotateDirection;
};

Cube.resetRotateDirection = function () {
  this.rotateDirection = '';
};

Cube.rotateCore = function (delta, value) {
  const temp = new THREE.Quaternion();
  temp.setFromAxisAngle(delta, value);
  this.core.center.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

Cube.rotateBody = function (start, current) {
  const delta = new THREE.Vector3(start.x - current.x, start.y - current.y);
  if (this.rotateDirection || this.updateRotateDirection(delta)) {
    const direction = this.rotateDirection;
    const weight = 5; // 마우스를 이동하는 방향으로 큐브를 돌리기위함
    delta[direction] *= weight;
    delta.normalize();
    const sign = Math.sign(delta[direction]);
    const value = sign * (start[direction] - current[direction]);
    this.rotateCore(delta, value);
  }
};

Cube.setLastCubeQuaternion = function (quaternion) {
  // this.lastCubeQuaternion.setFromRotationMatrix(quaternion);
  this.lastCubeQuaternion.copy(quaternion);
};

export default Cube;
