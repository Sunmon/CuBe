// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as TWEEN from '../../lib/tween.esm.js';
import * as THREE from '../../lib/three.module.js';
import { CUBE_SIZE, CUBIC_SIZE } from '../common/constants.js';

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
      if (Cube.rotatingLayer) {
        Cube.attachCubicsToCore();
        console.log('position changed');
        Cube.printPositions();
        console.log('rotating layer');
        Cube.printPositions(Cube.rotatingLayer);

        if (Cube.needCubicsUpdate) {
          //Cube.tempUpdateCubicsArray(clockwise);
          Cube.updateCubicsArray(clockwise);
        }
        // console.log(Cube.cubics[0][0][2].equals(Cube.rotatingCubics[0][0]));
        Cube.rotatingLayer = null;
        Cube.printPositions();
      } else {
        // 전체 코어를 움직인 경우도 cubicsArray를 업데이트한다??
      }

      Cube.rotateObjectScene.clear();
      Cube.rotateObjectScene = null;
      Cube.rotatingAxes = '';
      Cube.selectedMesh = null;
      // Cube.printPositions();
      // Cube.setLastCubeQuaternion(destination);
    });
};

// namespace
const Cube = {
  lastCubeQuaternion: new THREE.Quaternion(),
  lastCubeWorldMatrix: new THREE.Matrix4(),
  rotateObjectScene: null, // view
  cubics: [[[]]], // 큐빅 mesh 저장 어레이
  rotatingLayer: null, // 회전하는 3x3 평면 임시 저장, model
  rotatingAxes: '', // x,y,z
  localRotatingVector: null,
  mouseDirection: '', // x,y (화면 가로, 화면 세로)
  rotateStart: {},
  rotateInverse: '',
  selectedMesh: null, // 마우스로 선택한 메쉬
  needCubicsUpdate: false,
};

// 3x3 매트릭스 90도 회전
Cube.rotateMatrix90 = function (arr, clockwise) {
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
Cube.updateCubicsArray = function (clockwise) {
  const newMatrix = this.rotateMatrix90(this.rotatingLayer, clockwise);
  // change
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      this.rotatingLayer[i][j] = newMatrix[i][j]; // NOTE:  이 줄이 하는일ㄹ이 뭐지??
      this.rotatingLayer[i][j].position.round();
    }
  }
};

Cube.tempUpdateCubicsArray = function (clockwise) {
  console.log(this.selectedMesh);
  const newMatrix = this.rotatingLayer;
  // x,y 바꾸기 (z=2인 부분을 우측으로 돌렸을때)
  // FIXME: layer를 돌려봤자 원본 cubics는 영향 x
  for (let i = 0; i < 3; i++) {
    for (let j = i; j < 3; j++) {
      const temp = newMatrix[i][j];
      newMatrix[i][j] = newMatrix[j][i];
      newMatrix[j][i] = temp;

      // [newMatrix[i][j], newMatrix[j][i]] = [
      // newMatrix[j][i],
      // newMatrix[i][j],
      // ];

      newMatrix[i][j].position.round();
      newMatrix[j][i].position.round();

      // TODO: cubics 원본 고치기
      // this.cubics[i][j][1] = this.rotatingCubics[i][j];
      // this.cubics[j][i][1] = this.rotatingCubics[j][i];
      // clone을 하는 방법? 멈춘다
      // const temp = new THREE.Object3D().copy(this.rotatingCubics[i][j]);
      // this.rotatingCubics[i][j].copy(this.rotatingCubics[j][i]);
      // console.log(temp);
    }
  }

  // 원본 큐빅 배치 바꾸기
  const cubic = this.selectedMesh.parent;
  if (this.rotatingAxes === 'x') {
    // rotatingCubics 는 selectedMesh.position['x'] +1 을 골랐음
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.cubics[cubic.position['x'] + 1][i][j] = newMatrix[i][j];
      }
    }
  } else if (this.rotatingAxes === 'y') {
    // rotatingCubics 는 selectedMesh.position['y'] +1 을 골랐음
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.cubics[i][cubic.position['y'] + 1][j] = newMatrix[i][j];
      }
    }
  } else if (this.rotatingAxes === 'z') {
    // rotatingCubics 는 selectedMesh.position['z'] +1 을 골랐음
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // console.log(this.cubics[i][j][cubic.position['z'] + 1]);
        this.cubics[i][j][cubic.position['z'] + 1] = newMatrix[i][j];
      }
    }
  }

  console.log('after swap rotating layer');
  // console.log(this.rotatingCubics[0][2].id);
  Cube.printPositions(Cube.rotatingLayer);
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

Cube.core = {
  center: new THREE.Object3D(),
  xAxis: CustomMesh.createLine([-CUBE_SIZE, 0, 0], [CUBE_SIZE, 0, 0]),
  yAxis: CustomMesh.createLine([0, -CUBE_SIZE / 2, 0], [0, CUBE_SIZE / 2, 0]),
  zAxis: CustomMesh.createLine([0, 0, -CUBE_SIZE / 2], [0, 0, CUBE_SIZE / 2]),
};

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
        this.core.center.add(cubics[i][j][k]);
        // this.core.center.attach(cubics[i][j][k]);
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

  this.printPositions();

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
  const vector = {
    x: start =>
      start.y > 0
        ? new THREE.Vector3(delta.y, delta.x, 0)
        : new THREE.Vector3(delta.y, -delta.x, 0),
    y: start =>
      start.x > 0
        ? new THREE.Vector3(0, delta.x, -delta.y)
        : new THREE.Vector3(delta.y, delta.x, 0),
  };
  temp.setFromAxisAngle(vector[this.mouseDirection](start), value);
  // if (this.mouseDirection === 'x') {
  //   if (start.y > 0) {
  //     // (x,y,z) -> (y,x,z)
  //     temp.setFromAxisAngle(new THREE.Vector3(delta.y, delta.x, 0), value);
  //   } else {
  //     // (x,y,z) -> (y,-x,z)
  //     temp.setFromAxisAngle(new THREE.Vector3(delta.y, -delta.x, 0), value);
  //   }
  // } else if (this.mouseDirection === 'y') {
  //   // (x,y,z) -> (z, x, -y)
  //   if (start.x > 0) {
  //     temp.setFromAxisAngle(new THREE.Vector3(0, delta.x, -delta.y), value);
  //     // NOTE: 09. TODO: 선택면(윗면, 옆면 등)에 따라서 회전을 다르게 하거나
  //     // NOTE: 10. TODO: or 회전시킬때 매트릭스를 돌려버리기
  //   } else {
  //     // (x,y,z) -> (y,x,z)
  //     temp.setFromAxisAngle(new THREE.Vector3(delta.y, delta.x, 0), value);
  //   }
  // }
  this.core.center.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

Cube.rotateCubicsByScene = function (start, delta, value) {
  if (!this.rotatingAxes) return;
  // NOTE: 4. 씬 그래프 회전
  const { rotateObjectScene } = this;
  const temp = new THREE.Quaternion();
  const vector = {
    x: () => new THREE.Vector3(delta.y, delta.x, 0),
    y: () => new THREE.Vector3(delta.y, -delta.x, 0),
    z: worldNormal =>
      worldNormal.y === 1
        ? new THREE.Vector3(0, delta.y, delta.x)
        : new THREE.Vector3(0, delta.x, -delta.y),
  };
  const worldNormal = this.getWorldNormal(this.selectedMesh);

  // TODO: clock, counterclock 설정
  temp.setFromAxisAngle(vector[this.rotatingAxes](worldNormal), value);
  rotateObjectScene.setRotationFromQuaternion(
    temp.multiply(this.lastCubeQuaternion).normalize(),
  );
};

// TODO: x == 1 대신 (1,0,0) , (1,0,-0) 등등 고려할것
// 그러려면 mouseDirection === 'x' 대신 Vector2(x,y) 로 저장하는게 낫겠다
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

Cube.calculateRotatingAxes = function (worldNormal, mouseDirection) {
  if (worldNormal.x === 1) {
    return mouseDirection === 'x' ? 'y' : 'z';
  }
  if (worldNormal.y === 1) {
    return mouseDirection === 'x' ? 'z' : 'x';
    // return mouseDirection === 'x' ? 'x' : 'z';
  }

  if (worldNormal.z === 1) {
    return mouseDirection === 'x' ? 'y' : 'x';
  }

  return null;
};

// TODO: NOW! rotatingAxes 대신 localVector 이용하기
Cube.calculateCubicsToRotate = function (selected, cubic) {
  const worldNormal = this.getWorldNormal(selected);
  this.rotatingAxes = this.calculateRotatingAxes(
    worldNormal,
    this.mouseDirection,
  );
  const worldRotatingVector = this.calculateWorldRotatingVector(
    worldNormal,
    this.mouseDirection,
  );

  // TODO: 회전축 변경 -> rotatingCubics 구하느곳으로 옮기기
  // TODO: axes 가 - 인 경우도 따로 처리
  const localRotatingVector = this.core.center
    .worldToLocal(worldRotatingVector)
    .round();
  this.localRotatingVector = localRotatingVector;
  console.log('localRotatingVector: ');
  console.log(this.localRotatingVector);

  let tempLocalAxes = '';
  // // this.rotatingAxes.x = local3.x;
  if (worldRotatingVector.x === 1 || worldRotatingVector.x === -1)
    tempLocalAxes = 'x';
  else if (worldRotatingVector.y === 1 || worldRotatingVector.y === -1)
    tempLocalAxes = 'y';
  else if (worldRotatingVector.z === 1 || worldRotatingVector.z === -1)
    tempLocalAxes = 'z';
  // console.log(this.rotatingAxes);

  this.rotatingAxes = tempLocalAxes;
  return this.filterCubicsByPlane(
    // tempLocalAxes,
    // cubic.position[tempLocalAxes] + 1,
    this.rotatingAxes,
    cubic.position[this.rotatingAxes] + 1,
    this.cubics,
  );
};

// FIXME: mouse를 어느정도 이동해야 direction 이 정해짐
Cube.getContainingPlane = function (cubic) {
  if (this.mouseDirection === 'x') {
    return this.filterCubicsByPlane('y', cubic.position.y + 1, this.cubics);
  }
  if (this.mouseDirection === 'y') {
    return this.filterCubicsByPlane('x', cubic.position.x + 1, this.cubics);
  }

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
  tempScene.setRotationFromQuaternion(temp.normalize());
};

Cube.rotateBody = function (start, current) {
  // TODO: 축의 방향 바꾸기

  const delta = new THREE.Vector3(start.x - current.x, start.y - current.y, 0);
  this.rotateStart = start;
  if (this.mouseDirection || this.updateMouseDirection(delta)) {
    const direction = this.mouseDirection;
    const weight = 10; // 마우스를 이동하는 방향으로 큐브를 돌리기위함
    const velocity = 0.1;
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
      this.rotateCubicsByScene(start, delta, value + velocity);
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

// tempScene -> cube로 옮기는 임시 테스트 함수
Cube.attachCubicsToCore = function (object) {
  const cubics = this.rotateObjectScene.children;
  if (cubics.length) {
    for (let i = cubics.length - 1; i >= 0; i--) {
      this.core.center.attach(cubics[i]);
    }
  }

  this.rotateObjectScene.clear();
};

Cube.calculateRotatingLayer = function (cubic) {
  return this.calculateCubicsToRotate(this.selectedMesh, cubic);
};

Cube.addRotatingCubicsToObjectScene = function (rotatingLayer, scene) {
  rotatingLayer.forEach(row => {
    row.forEach(col => {
      scene.add(col);
    });
  });

  return scene;
};

Cube.slerp = function (clickStart, clickEnd, object = this.core.center) {
  const userDirection = this.getUserDirection(clickStart, clickEnd);
  const destination = getCloserDirection(
    // this.core.center,
    object,
    this.lastCubeQuaternion,
    userDirection,
  );
  let clockwise = false;
  if (clickEnd.x > clickStart.x && this.mouseDirection === 'x')
    clockwise = true;
  if (clickEnd.y > clickStart.y && this.mouseDirection === 'y')
    clockwise = true;

  if (!destination.equals(this.lastCubeQuaternion)) {
    this.needCubicsUpdate = true;
  } else {
    this.needCubicsUpdate = false;
  }

  console.log('original cube: ');
  this.printPositions();

  slerpObject(object, destination, clockwise);
  this.setLastCubeQuaternion(destination);
};

export default Cube;
