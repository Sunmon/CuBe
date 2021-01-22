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
  mouseDirection: '', // x,y (화면 가로, 화면 세로)
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
  // addObject(this.core.center, this.core.zAxis);
  // addObject(this.core.center, this.core.xAxis);
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
// TODO: ROtateDIrection 대신 mouseDirection이라고 해야겠다
Cube.updateMouseDirection = function (delta = {}, THRESHOLD = 0.1) {
  if (Math.abs(delta.x) > THRESHOLD) {
    this.mouseDirection = 'x';
  } else if (Math.abs(delta.y) > THRESHOLD) {
    this.mouseDirection = 'y';
  }

  return this.mouseDirection;
};

Cube.resetMouseDirection = function () {
  this.mouseDirection = '';
};

Cube.rotateCore = function (start, delta, value) {
  const temp = new THREE.Quaternion();

  if (this.mouseDirection === 'x') {
    if (start.y > 0) {
      // (x,y,z) -> (y,x,z)
      temp.setFromAxisAngle(new THREE.Vector3(delta.y, delta.x, 0), value);
    } else {
      // (x,y,z) -> (y,-x,z)
      temp.setFromAxisAngle(new THREE.Vector3(delta.y, -delta.x, 0), value);
    }
  } else if (this.mouseDirection === 'y') {
    // (x,y,z) -> (z, x, -y)
    if (start.x > 0) {
      temp.setFromAxisAngle(new THREE.Vector3(0, delta.x, -delta.y), value);
    } else {
      // (x,y,z) -> (y,x,z)
      temp.setFromAxisAngle(new THREE.Vector3(delta.y, delta.x, 0), value);
    }
  }
  this.core.center.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

Cube.rotateBody = function (start, current) {
  // TODO: 축의 방향 바꾸기
  const delta = new THREE.Vector3(start.x - current.x, start.y - current.y, 0);
  if (this.mouseDirection || this.updateMouseDirection(delta)) {
    const direction = this.mouseDirection;
    const weight = 10; // 마우스를 이동하는 방향으로 큐브를 돌리기위함
    delta[direction] *= weight;
    delta.normalize();
    const sign = Math.sign(delta[direction]);
    const value = sign * (start[direction] - current[direction]);
    this.rotateCore(start, delta, value);
  }
};

Cube.setLastCubeQuaternion = function (quaternion) {
  // this.lastCubeQuaternion.setFromRotationMatrix(quaternion);
  this.lastCubeQuaternion.copy(quaternion);
};

export default Cube;
