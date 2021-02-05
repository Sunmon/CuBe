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
  new TWEEN.Tween(object.quaternion)
    .to(destination, 100)
    .start()
    .onComplete(() => {
      // NOTE: 7. tempScene에 있던 큐빅을 다시 cube로 돌려놓는다
      if (Cube.rotatingPlane) {
        Cube.attachCubicsToCore();
        if (Cube.needCubicsUpdate) {
          // NOTE: 8. cubics 어레이도 회전시킨다
          Cube.updateCubicsArray();
        }
        Cube.rotatingPlane = null;
      }

      // NOTE: 8. tempScene을 삭제한다
      Cube.tempScene = null;
      console.log('result:::');
      Cube.printPositions();
    });
};

// namespace
const Cube = {
  lastCubeQuaternion: new THREE.Quaternion(),
  lastCubeWorldMatrix: new THREE.Matrix4(),
  tempScene: null,
  cubics: [[[]]], // 큐빅 mesh 저장 어레이
  rotatingPlane: null, // 회전하는 3x3 평면 임시 저장
  mouseDirection: '', // x,y (화면 가로, 화면 세로)
  rotateStart: {},
  rotateInverse: '',
  selectedMesh: null, // 마우스로 선택한 메쉬
  needCubicsUpdate: false,
};

// 3x3 매트릭스 90도 회전
Cube.rotateMatrix90 = function (arr, clockwise) {
  // console.log(arr);
  const ret = Array.from(Array(3), () => Array(3).fill(0));
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (clockwise) {
        ret[i][3 - j - 1] = arr[j][i];
      } else {
        ret[i][j] = arr[j][3 - i - 1];
      }
    }
  }

  return ret;
};

// TODO: cubics 어레이 수정 작성하기
Cube.updateCubicsArray = function () {
  console.log('update:::');
  // NOTE: clockwise는 회전방향과 반대로 해야 함
  // TODO: mouseDirection, start.y 이런것들로 clockwise 정하기
  // TODO: mouseDirection, start.y 이런것들로 아예 회전 일반화하여 정하기

  const newMatrix = this.rotateMatrix90(this.rotatingPlane, true);

  for (let i = 0; i < 3; i++) {
    let str = '';
    for (let j = 0; j < 3; j++) {
      str += `(${Math.round(newMatrix[i][j].position.x)}, ${Math.round(
        newMatrix[i][j].position.y,
      )}, ${Math.round(newMatrix[i][j].position.z)}), `;
    }
    str += '\n';
    console.log(str);
  }

  // NOTE: plane 출력
  console.log('updated plane');
  for (let i = 0; i < 3; i++) {
    let str = '';
    for (let j = 0; j < 3; j++) {
      str += `(${Math.round(this.rotatingPlane[i][j].position.x)}, ${Math.round(
        this.rotatingPlane[i][j].position.y,
      )}, ${Math.round(this.rotatingPlane[i][j].position.z)}), `;
    }
    str += '\n';
    console.log(str);
  }

  // change
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      this.rotatingPlane[i][j] = newMatrix[i][j];
      this.rotatingPlane[i][j].position.round();
    }
  }
};

Cube.printPositions = function () {
  for (let i = 0; i < 3; i++) {
    let str = '';
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        str += `(${Math.round(this.cubics[i][j][k].position.x)},${Math.round(
          this.cubics[i][j][k].position.y,
        )},${Math.round(this.cubics[i][j][k].position.z)}), `;
      }
      str += '\n';
    }
    console.log(str);
  }
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
  const cubic = CustomMesh.createBox(CUBIC_SIZE, CUBIC_SIZE, CUBIC_SIZE, color);
  cubic.name = 'cubic';

  return cubic;
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

Cube.getWorldNormal = function (object) {
  const normalMatrix = new THREE.Matrix3();
  const worldNormal = new THREE.Vector3(0, 0, 1);
  normalMatrix.getNormalMatrix(object.matrixWorld);
  worldNormal.applyMatrix3(normalMatrix).normalize().round();

  return worldNormal;
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
  this.cubics = cubics;

  // console.log(this.cubics[0][0][0]);

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

// TODO: rotateCore를 범용적으로 일반화시키기
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
      // NOTE: 09. TODO: 선택면(윗면, 옆면 등)에 따라서 회전을 다르게 하거나
      // NOTE: 10. TODO: or 회전시킬때 매트릭스를 돌려버리기
    } else {
      // (x,y,z) -> (y,x,z)
      temp.setFromAxisAngle(new THREE.Vector3(delta.y, delta.x, 0), value);
    }
  }
  this.core.center.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

Cube.rotateCubicsBySceneTemp = function (start, delta, value) {
  // NOTE: 4. 씬 그래프 회전
  const { tempScene } = this;

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

  tempScene.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

// FIXME: mouse를 어느정도 이동해야 direction 이 정해짐
Cube.getContainingPlane = function (cubic) {
  if (this.mouseDirection === 'x') {
    console.log('x moving');
    console.log(cubic.position.y);

    return this.filterCubicsByPlane('y', cubic.position.y + 1, this.cubics);
  }
  if (this.mouseDirection === 'y') {
    // NOTE: TODO: 선택한 면에 따라 포함한 평면 다르게 처리하기
    console.log(' y moving');
    console.log(cubic.position.x);
    return this.filterCubicsByPlane('x', cubic.position.x + 1, this.cubics);
  }

  console.log('no moving');
  return null;
};

Cube.rotateCubics = function (start, delta, value) {
  // TODO: group으로 묶거나 scenegraph에 합치거나..

  const tempScene = new THREE.Object3D();
  tempScene.name = 'tempScene';

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

  // const clicked = this.selectedMesh;
  const cubic = this.selectedMesh.parent;
  this.core.center.add(tempScene);
  tempScene.add(cubic);

  const worldCoreRotation = this.lastCubeQuaternion;
  // console.log(tempScene.quaternion);
  tempScene.setRotationFromQuaternion(
    temp.normalize(),
    // temp.multiply(this.lastCubeQuaternion).normalize(),
  );
  // tempScene.quaternion
  // .multiplyQuaternions(temp, this.lastCubeQuaternion)
  // .normalize();
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
    if (!this.selectedMesh) {
      this.rotateCore(start, delta, value);
      // this.rotateCoreByWorldMatrix(start, delta, value);
    } else {
      // 하나씩 회전
      // this.rotateCubics(start, delta, value);
      this.rotateCubicsBySceneTemp(start, delta, value);
    }
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

// tempScene -> cube로 옮기는 임시 테스트 함수
Cube.attachCubicsToCore = function (object) {
  // console.log(this.tempScene.children);
  const cubics = this.tempScene.children;
  if (cubics.length) {
    for (let i = cubics.length - 1; i >= 0; i--) {
      this.core.center.attach(cubics[i]);
    }

    // NOTE: 8. 그룹 회전하기 (예제: y축 회전)
    // cubics.forEach(cubic => this.core.center.attach(cubic));
    // cubics.forEach(cubic => console.log(cubic));
    // this.core.center.attach(cubic);
  }

  this.tempScene.clear();
};

Cube.slerp = function (clickStart, clickEnd, object = this.core.center) {
  const userDirection = this.getUserDirection(clickStart, clickEnd);
  const destination = getCloserDirection(
    // this.core.center,
    object,
    this.lastCubeQuaternion,
    userDirection,
  );

  // slerpObject(this.core.center, destination);
  slerpObject(object, destination);

  // NOTE: 6. TODO: 회전시킨대로 cubics 매트릭스도 회전하기
  if (!destination.equals(this.lastCubeQuaternion)) {
    console.log(userDirection);
    this.needCubicsUpdate = true;
  } else {
    this.needCubicsUpdate = false;
  }
  this.setLastCubeQuaternion(destination);
};

export default Cube;
