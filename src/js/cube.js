// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as TWEEN from '../../lib/tween.esm.js';
import * as THREE from '../../lib/three.module.js';
import { CUBE_SIZE, CUBIC_SIZE } from '../common/constants.js';
import { isEmpty } from '../common/common.js';

const addObject = function (target, obj) {
  target.add(obj);
};

const getCloserDirection = function (object, origin, direction) {
  // FIXME: cubics는 계산이 잘 안 맞을 때 있음.. 돌아가야하는데 다시 원래자리로 감
  const dest = new THREE.Quaternion().multiplyQuaternions(direction, origin);
  if (object.quaternion.angleTo(origin) < object.quaternion.angleTo(dest)) {
    dest.copy(origin);
  }

  return dest;
};

const slerpObject = function (object, destination, clockwise) {
  new TWEEN.Tween(object.quaternion)
    .to(destination, 100)
    .start()
    .onComplete(() => {
      // TODO: 안에 내용 따로 함수로 만들어야하나..? clear, rotate 이거 여따만들어야할성싶네
      if (!isEmpty(Cube.rotatingLayer)) {
        // if (isEmpty(Cube.rotatingLayer)) {
        Cube.attachCubicsToCore();
        console.log('position changed');
        Cube.printPositions();
        console.log('rotating layer');
        Cube.printPositions(Cube.rotatingLayer);

        if (Cube.needCubicsUpdate) {
          Cube.updateCubicsArray(clockwise);
        }
        // console.log(Cube.cubics[0][0][2].equals(Cube.rotatingCubics[0][0]));
        Cube.rotatingLayer = [[]];
        console.log('after full');
        Cube.printPositions();
      } else {
        // 전체 코어를 움직인 경우도 cubicsArray를 업데이트한다??
      }

      const scene = Cube.core.parent;
      const objectScene = scene.getObjectByName('objectScene');
      // Cube.rotateObjectScene.clear();
      // Cube.rotateObjectScene = null;
      objectScene.clear();
      scene.remove(objectScene);
      // objectScene = null;

      Cube.rotatingAxesChar = '';
      Cube.rotatingAxes = null;
      Cube.selectedMesh = null;
      // Cube.printPositions();
      // Cube.setLastCubeQuaternion(destination);
    });
};
// TODO: 기본값 설정하기
// namespace
const Cube = {
  core: new THREE.Object3D(),
  lastCubeQuaternion: new THREE.Quaternion(),
  cubics: [[[]]], // 큐빅 배치 저장 (model). 항상 값을 일정하게 유지해야 한다
  rotatingLayer: [[]], // 회전할 평면에 속하는 큐빅들을 임시로 저장하는 배열
  rotatingAxesChar: '', // cubic.core의 로컬 회전축. ('x','y','z')
  rotatingAxes: new THREE.Vector3(), // rotatingLayer의 local 회전하는 축
  mouseDirection: '', // x,y (화면 가로, 화면 세로) TODO: 빼버리고 mouseVetor를 이용하여 계산하는 함수로 넘기기?
  rotateInverse: '',
  selectedMesh: null, // 마우스로 선택한 메쉬
  needCubicsUpdate: false,
};

Cube.getObjectScene = function () {
  const scene = this.core.parent;

  return scene.getObjectByName('objectScene');
};

// 3x3 매트릭스 90도 회전
Cube.createRotatedMatrix = function (arr, clockwise) {
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
// FIXME: 벡터를 이용하여 회전 판별하도록 변경하기 (지금처럼 단순히 x,y,z 말고)
Cube.updateCubicsArray = function (clockwise) {
  // TODO: rotatingAxes 대신 vector를 이용하기
  const clock = this.rotatingAxesChar === 'z' ? !clockwise : clockwise;
  const newMatrix = this.createRotatedMatrix(this.rotatingLayer, clock);

  // change
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      this.rotatingLayer[i][j] = newMatrix[i][j]; // NOTE:  이 줄이 하는일ㄹ이 뭐지??
      this.rotatingLayer[i][j].position.round();
    }
  }

  // 원본 큐빅 배치 바꾸기
  // z축을 회전한 경우, 새 매트릭스이기때문에 위치를 적용해줘야 함
  const cubic = this.selectedMesh.parent;
  if (this.rotatingAxesChar === 'x') {
    // rotatingCubics 는 selectedMesh.position['x'] +1 을 골랐음
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.cubics[cubic.position.x + 1][i][j] = newMatrix[i][j];
      }
    }
  } else if (this.rotatingAxesChar === 'y') {
    // rotatingCubics 는 selectedMesh.position['y'] +1 을 골랐음
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.cubics[i][cubic.position.y + 1][j] = newMatrix[i][j];
      }
    }
  } else if (this.rotatingAxesChar === 'z') {
    // rotatingCubics 는 selectedMesh.position['z'] +1 을 골랐음
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.cubics[i][j][cubic.position.z + 1] = newMatrix[i][j];
      }
    }
  }
};

Cube.printPositions = function (matrix) {
  if (!matrix) {
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
  } else {
    // 2D 매트릭스 출력
    for (let i = 0; i < 3; i++) {
      let str = '';
      for (let j = 0; j < 3; j++) {
        str += `(${Math.round(matrix[i][j].position.x)},${Math.round(
          matrix[i][j].position.y,
        )},${Math.round(matrix[i][j].position.z)}), `;
      }
      str += '\n';
      console.log(str);
    }
  }
};

// Cube.core = {
//   center: new THREE.Object3D(),
//   xAxis: CustomMesh.createLine([-CUBE_SIZE, 0, 0], [CUBE_SIZE, 0, 0]),
//   yAxis: CustomMesh.createLine([0, -CUBE_SIZE / 2, 0], [0, CUBE_SIZE / 2, 0]),
//   zAxis: CustomMesh.createLine([0, 0, -CUBE_SIZE / 2], [0, 0, CUBE_SIZE / 2]),
// };

// Cube.core = new THREE.Object3D();

Cube.createPlane = function (color) {
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
        this.core.add(cubics[i][j][k]);
        // this.core.center.attach(cubics[i][j][k]);
      }
    }
  }
};

// 평면에 해당하는 3x3 벡터를 리턴
// array는 새로 만들어지지만, 안의 객체는 레퍼런스 복사
Cube.filterCubicsByPlane = function (plane, value, cubics) {
  if (plane === 'x') return [...cubics[value]];
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
        sticker.name = 'sticker';
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

  console.log(
    `worldNormal : ${worldNormal.x}, ${worldNormal.y}, ${worldNormal.z}`,
  );
  return worldNormal;
};

// Z -> X -> Y 순으로 회전 (오일러 회전과 순서를 맞춤)
Cube.init = function () {
  this.core.name = 'core';
  // TODO: line으로부터방향 알아내서 testPlane에 법선으로 적용하기
  // 그냥 line 벡터 알아내서 add한다음에 lookAt하면된다

  // cubics[x][y][z]
  const cubics = this.createCubicsArray();
  this.setCubicsPosition(cubics);
  this.addCubicsToCore(cubics);
  this.addStickers(cubics);
  this.cubics = cubics;

  this.printPositions();

  return this;
};

Cube.updateMouseDirection = function (delta) {
  this.mouseDirection = this.calculateMouseDirection(delta);

  return this.mouseDirection;
};

Cube.resetMouseDirection = function () {
  this.mouseDirection = '';
};

Cube.calculateMouseDirection = function (delta, THRESHOLD = 0.1) {
  return ['x', 'y'].find(val => Math.abs(delta[val]) > THRESHOLD);
};

Cube.rotateCore = function (start, delta, value) {
  const vector = {
    x: () =>
      start.y > 0
        ? new THREE.Vector3(delta.y, delta.x, 0)
        : new THREE.Vector3(delta.y, -delta.x, 0),
    y: () =>
      start.x > 0
        ? new THREE.Vector3(0, delta.x, -delta.y)
        : new THREE.Vector3(delta.y, delta.x, 0),
  };
  const temp = new THREE.Quaternion();
  temp.setFromAxisAngle(vector[this.mouseDirection](start), value);
  this.core.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

Cube.rotateCubicsByScene = function (delta, value) {
  if (!this.rotatingAxesChar) return;
  const localVector = this.rotatingAxes;
  const worldVector = this.core.localToWorld(localVector.clone()).round();
  const v = this.calculateCharFromVector(worldVector);
  const vertical = new THREE.Vector3(0, -delta.x, -delta.y);
  const horizontal = new THREE.Vector3(delta.y, -delta.x, 0);
  const vector = {
    x: () => horizontal,
    y: local => (local.y === 1 ? vertical : horizontal),
    z: () => vertical,
  };
  const temp = new THREE.Quaternion();
  temp.setFromAxisAngle(vector[v](localVector), value);
  this.getObjectScene().setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

Cube.calculateWorldRotatingVector = function (worldNormal, mouseDirection) {
  if (worldNormal.x === 1) {
    return mouseDirection === 'x'
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);
  }
  if (worldNormal.y === 1) {
    return mouseDirection === 'x'
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(1, 0, 0);
  }
  if (worldNormal.z === 1) {
    return mouseDirection === 'x'
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(1, 0, 0);
  }

  return new THREE.Vector3();
};

// NOTE: 나중에 localRotating만 있어도 되면 바꿔버리기
Cube.calculateRotatingAxes = function (worldNormal, mouseDirection) {
  if (worldNormal.x === 1) {
    return mouseDirection === 'x' ? 'y' : 'z';
  }
  if (worldNormal.y === 1) {
    return mouseDirection === 'x' ? 'z' : 'x';
  }

  if (worldNormal.z === 1) {
    return mouseDirection === 'x' ? 'y' : 'x';
  }

  return null;
};

Cube.calculateLocalRotatingAxes = function (selected) {
  const worldNormal = this.getWorldNormal(selected);
  const worldRotatingVector = this.calculateWorldRotatingVector(
    worldNormal,
    this.mouseDirection,
  );
  const localRotatingVector = this.core
    .worldToLocal(worldRotatingVector)
    .round();

  return localRotatingVector;
};

Cube.calculateCharFromVector = function (vector) {
  return ['x', 'y', 'z'].find(axes => Math.abs(vector[axes]) === 1);
};

Cube.calculateCubicsToRotate = function (selected, cubic) {
  this.rotatingAxes = this.calculateLocalRotatingAxes(selected);
  this.rotatingAxesChar = this.calculateCharFromVector(this.rotatingAxes);

  return this.filterCubicsByPlane(
    this.rotatingAxesChar,
    cubic.position[this.rotatingAxesChar] + 1,
    this.cubics,
  );
};

Cube.rotateBody = function (start, current) {
  const delta = new THREE.Vector2(start.x - current.x, start.y - current.y);
  if (this.mouseDirection || this.updateMouseDirection(delta)) {
    const direction = this.mouseDirection;
    const weight = 10; // 마우스를 이동하는 방향으로 큐브를 돌리기위함
    const value = Math.abs(delta[direction]);
    delta[direction] *= weight;
    delta.normalize();
    if (!this.selectedMesh) {
      this.rotateCore(start, delta, value);
    } else {
      const velocity = 0.1;
      this.rotateCubicsByScene(delta, value + velocity);
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
  // if (!this.rotatingAxes) {
  //   // this.rotatingAxes =
  //   if (from === 1 || from === 2) this.rotatingAxes = 'y';
  //   if (from === 3) this.rotatingAxes = 'z';
  //   if (from === 0) this.rotatingAxes = 'x';
  // }

  return direction;
};

Cube.attachCubicsToCore = function () {
  const cubics = this.getObjectScene().children;
  if (!cubics.length) return;
  for (let i = cubics.length - 1; i >= 0; i--) {
    this.core.attach(cubics[i]);
  }
};

Cube.calculateRotatingLayer = function (cubic) {
  return this.calculateCubicsToRotate(this.selectedMesh, cubic);
};

Cube.addCubicsToObjectScene = function (rotatingLayer, scene) {
  rotatingLayer.forEach(row => {
    row.forEach(col => {
      scene.add(col);
    });
  });

  return scene;
};

Cube.slerp = function (clickStart, clickEnd, object = this.core) {
  const userDirection = this.getUserDirection(clickStart, clickEnd);
  const destination = getCloserDirection(
    object,
    this.lastCubeQuaternion,
    userDirection,
  );
  const clockwise =
    clickEnd[this.mouseDirection] > clickStart[this.mouseDirection];
  this.needCubicsUpdate = !destination.equals(this.lastCubeQuaternion);

  console.log('original cube: ');
  this.printPositions();

  slerpObject(object, destination, clockwise);
  this.setLastCubeQuaternion(destination);
};

export default Cube;
