// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as TWEEN from '../../lib/tween.esm.js';
import * as THREE from '../../lib/three.module.js';
import { CUBE_SIZE, CUBIC_SIZE } from '../common/constants.js';

const addObject = function (target, obj) {
  target.add(obj);
};

const getCloserDirection = function (object, origin, direction) {
  const dest = new THREE.Quaternion().multiplyQuaternions(direction, origin);
  if (object.quaternion.angleTo(origin) < object.quaternion.angleTo(dest)) {
    dest.copy(origin);
  }

  return dest;
};

const slerpObject = function (object, destination) {
  new TWEEN.Tween(object.quaternion).to(destination, 100).start();
};

// namespace
const Cube = {
  lastCubeQuaternion: new THREE.Quaternion(),
  mouseDirection: '', // x,y (화면 가로, 화면 세로)
  rotateStart: {},
  rotateInverse: '',
};

Cube.core = {
  center: new THREE.Object3D(),
  xAxis: CustomMesh.createLine([-CUBE_SIZE, 0, 0], [CUBE_SIZE, 0, 0]),
  yAxis: CustomMesh.createLine([0, -CUBE_SIZE / 2, 0], [0, CUBE_SIZE / 2, 0]),
  zAxis: CustomMesh.createLine([0, 0, -CUBE_SIZE / 2], [0, 0, CUBE_SIZE / 2]),
};

Cube.createPlane = function (color) {
  // return CustomMesh.createPlane(CUBE_SIZE, CUBE_SIZE, color);
  return CustomMesh.createPlane(CUBIC_SIZE, CUBIC_SIZE, color);
};

Cube.createCubic = function (color) {
  return CustomMesh.createBox(CUBIC_SIZE, CUBIC_SIZE, CUBIC_SIZE, color);
};

Cube.createCubicsArray = function () {
  return [...Array(3)].map(() =>
    [...Array(3)].map(() =>
      [...Array(3)].map(() => this.createCubic(0xffffff)),
    ),
  );
};

Cube.setCubicsPosition = function (cubics) {
  const xyz = [-CUBIC_SIZE, 0, CUBIC_SIZE];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        cubics[i][j][k].position.set(xyz[i], xyz[j], xyz[k]);
      }
    }
  }
};

Cube.addCubicsToCore = function (cubics) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        this.core.center.add(cubics[i][j][k]);
      }
    }
  }
};

// 평면에 해당하는 3x3 벡터를 리턴
Cube.filterCubicsByPlane = function (plane, value, cubics) {
  if (plane === 'x') return cubics[value];
  if (plane === 'y') return cubics.map(y => y[value]);
  if (plane === 'z') return cubics.map(y => y.map(z => z[value]));

  return [];
};

Cube.translateObject = function (axis, value, object) {
  if (axis === 'x') return object.translateX(value);
  if (axis === 'y') return object.translateY(value);
  if (axis === 'z') return object.translateZ(value);

  return null;
};

Cube.rotateObject = function (axis, value, object) {
  if (axis === 'x') return object.rotateX(value);
  if (axis === 'y') return object.rotateY(value);
  if (axis === 'z') return object.rotateZ(value);

  return null;
};

Cube.addStickers = function (cubics) {
  const colors = [0xff6663, 0xfeb144, 0xfdfd97, 0x9ee09e, 0x9ec1cf, 0xcc99c9];
  const filters = ['x0', 'x2', 'y0', 'y2', 'z0', 'z2'];
  const rotateDir = ['y', 'y', 'x', 'x', 'y', 'y'];
  const rotateDist = [
    -Math.PI / 2,
    Math.PI / 2,
    Math.PI / 2,
    -Math.PI / 2,
    Math.PI,
    0,
  ];
  const planes = filters.map(([f, v]) =>
    this.filterCubicsByPlane(f, +v, cubics),
  );

  planes.forEach((plane, i) => {
    const [dir, val] = filters[i];
    plane.forEach(row => {
      row.forEach(col => {
        const sticker = this.createPlane(colors[i]);
        this.translateObject(dir, ((val - 1) * CUBIC_SIZE) / 2, sticker);
        this.rotateObject(rotateDir[i], rotateDist[i], sticker);
        col.add(sticker);
      });
    });
  });
};

// Z -> X -> Y 순으로 회전 (오일러 회전과 순서를 맞춤)
Cube.init = function () {
  // addObject(this.core.center, this.core.zAxis);
  // addObject(this.core.center, this.core.xAxis);
  addObject(this.core.center, this.core.yAxis);

  // TODO: line으로부터방향 알아내서 testPlane에 법선으로 적용하기
  // 그냥 line 벡터 알아내서 add한다음에 lookAt하면된다

  // cubics[x][y][z]
  const cubics = this.createCubicsArray();
  this.setCubicsPosition(cubics);
  this.addCubicsToCore(cubics);
  this.addStickers(cubics);

  return this;
};

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
  this.rotateStart = start;
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
  this.lastCubeQuaternion.copy(quaternion);
};

Cube.getUserDirection = function (clickStart, clickEnd) {
  const units = [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
  ];
  const [other, k] = this.mouseDirection === 'x' ? ['y', 1] : ['x', 3];
  const [from, to] = clickStart[other] > 0 ? [k, 2] : [3 - k, 1]; // 유닛벡터 선택
  const direction = new THREE.Quaternion().setFromUnitVectors(
    units[from],
    units[to],
  );
  const invert =
    clickStart[this.mouseDirection] < clickEnd[this.mouseDirection];
  if (invert) direction.invert();

  return direction;
};

Cube.slerp = function (clickStart, clickEnd) {
  const userDirection = this.getUserDirection(clickStart, clickEnd);
  const destination = getCloserDirection(
    this.core.center,
    this.lastCubeQuaternion,
    userDirection,
  );

  slerpObject(this.core.center, destination);
  this.setLastCubeQuaternion(destination);
};

export default Cube;
