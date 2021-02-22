// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as TWEEN from '../../lib/tween.esm.js';
import * as THREE from '../../lib/three.module.js';
import { CUBE_SIZE, CUBIC_SIZE } from '../common/constants.js';
import { isEmpty } from '../common/common.js';

export default class Cube {
  // TODO: 가상 프로퍼티로 뺄 수 있는것들은 get set 으로 만들자
  constructor() {
    // const core = new THREE.Object3D();
    // const lastCubeQuaternion = new THREE.Quaternion();
    // const cubicsLayerMatrix = [[[]]]; // 큐빅 배치 저장 (model). 항상 값을 일정하게 유지해야 한다
    // const selectedMesh = null; // 마우스로 선택한 메쉬
    // const clockwise = false;
    // const rotatingLayer = [[]]; // 회전할 평면에 속하는 큐빅들을 임시로 저장하는 배열
    // const rotatingAxesChar = ''; // cubic.core의 로컬 회전축. ('x','y','z')
    // const rotatingAxes = new THREE.Vector3(); // rotatingLayer의 local 회전하는 축
    // const mouseDirection = ''; // x,y (화면 가로, 화면 세로) TODO= 빼버리고 mouseVetor를 이용하여 계산하는 함수로 넘기기?
    // const mouseDelta = new THREE.Vector2();
    // const rotateInverse = '';
    // const selectedWorldNormal = new THREE.Vector3(); // 선택한 메쉬의 월드 노멀 벡터
    // const needCubicsUpdate = false;

    this.core = new THREE.Object3D();
    this.lastCubeQuaternion = new THREE.Quaternion();
    this.cubicsLayerMatrix = [[[]]]; // 큐빅 배치 저장 (model). 항상 값을 일정하게 유지해야 한다
    this.selectedMesh = null; // 마우스로 선택한 메쉬
    this.clockwise = false;
    this.rotatingLayer = [[]]; // 회전할 평면에 속하는 큐빅들을 임시로 저장하는 배열
    this.rotatingAxesChar = ''; // cubic.core의 로컬 회전축. ('x','y','z')
    this.rotatingAxes = new THREE.Vector3(); // rotatingLayer의 local 회전하는 축
    this.mouseDirection = ''; // x,y (화면 가로, 화면 세로) TODO= 빼버리고 mouseVetor를 이용하여 계산하는 함수로 넘기기?
    this.mouseDelta = new THREE.Vector2();
    this.rotateInverse = '';
    this.selectedWorldNormal = new THREE.Vector3(); // 선택한 메쉬의 월드 노멀 벡터
    this.needCubicsUpdate = false;

    this.createCube();
  }

  createCube() {
    // FIXME: refactor
    this.core.name = 'core';
    // cubics[x][y][z]
    const cubics = Cube.createCubicsLayerMatrix();
    Cube.setCubicsPosition(cubics);
    this.addCubicsToCore(cubics);
    this.addStickers(cubics);
    this.cubicsLayerMatrix = cubics;

    // 임시용 큐브 이름 붙이기
    let name = 65;
    for (let i = 2; i >= 0; i--) {
      for (let j = 2; j >= 0; j--) {
        for (let k = 2; k >= 0; k--) {
          this.cubicsLayerMatrix[i][j][k].name = String.fromCharCode(name);
          name++;
        }
      }
    }
    this.printPositions();

    return this;
  }

  // TODO: 이름을 바꿔서.. createCubi~ 이건 모든 과정을 통합한 메소드로..
  static createCubicsLayerMatrix() {
    return [...Array(3)].map(() =>
      [...Array(3)].map(() =>
        [...Array(3)].map(() => this.createCubic(0xffffff)),
      ),
    );
  }

  // FIXME: mesh 로 뺄까?
  static createCubic(color) {
    const cubic = CustomMesh.createBox(
      CUBIC_SIZE,
      CUBIC_SIZE,
      CUBIC_SIZE,
      color,
    );
    cubic.name = 'cubic';

    return cubic;
  }

  static setCubicsPosition(cubics) {
    const xyz = [-CUBIC_SIZE, 0, CUBIC_SIZE];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          cubics[i][j][k].position.set(xyz[i], xyz[j], xyz[k]);
        }
      }
    }
  }

  addCubicsToCore(cubics) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          this.core.add(cubics[i][j][k]);
          cubics[i][j][k].position.round();
          // this.core.center.attach(cubics[i][j][k]);
        }
      }
    }
  }

  addStickers(cubics) {
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
      Cube.filterCubicsByPlane(f, +v, cubics),
    );

    planes.forEach((plane, i) => {
      const [dir, val] = filters[i];
      plane.forEach(row => {
        row.forEach(col => {
          const sticker = Cube.createPlane(colors[i]);
          sticker.name = 'sticker';
          Cube.translateObject(dir, ((val - 1) * CUBIC_SIZE) / 2, sticker);
          Cube.rotateObject(rotateDir[i], rotateDist[i], sticker);
          col.add(sticker);
        });
      });
    });
  }

  static createPlane(color) {
    return CustomMesh.createPlane(CUBIC_SIZE, CUBIC_SIZE, color);
  }

  static translateObject(axis, value, object) {
    if (axis === 'x') return object.translateX(value);
    if (axis === 'y') return object.translateY(value);
    if (axis === 'z') return object.translateZ(value);

    return null;
  }

  static rotateObject(axis, value, object) {
    if (axis === 'x') return object.rotateX(value);
    if (axis === 'y') return object.rotateY(value);
    if (axis === 'z') return object.rotateZ(value);

    return null;
  }

  saveCurrentStatus() {
    this.setLastCubeQuaternion(this.core.quaternion);
    if (this.selectedMesh) {
      this.selectedWorldNormal = Cube.getWorldNormal(this.selectedMesh);
    }
  }

  calculateRotatingLayer(cubic) {
    return this.calculateCubicsToRotate(this.selectedMesh, cubic);
  }

  calculateCubicsToRotate(selected, cubic) {
    this.rotatingAxes = this.calculateLocalRotatingAxes(selected);
    this.rotatingAxesChar = Cube.calculateCharFromVector(this.rotatingAxes);

    return Cube.filterCubicsByPlane(
      this.rotatingAxesChar,
      cubic.position[this.rotatingAxesChar] + 1,
      // this.cubics,
      this.cubicsLayerMatrix,
    );
  }

  calculateLocalRotatingAxes(selected) {
    const worldNormal = Cube.getWorldNormal(selected);
    const worldRotatingVector = Cube.calculateWorldRotatingVector(
      worldNormal,
      this.mouseDirection,
    );
    const localRotatingVector = this.core
      .worldToLocal(worldRotatingVector.clone())
      .round();

    return localRotatingVector;
  }

  // FIXME: static 애들은 다른곳으로 뺼 수도 있는거 아냐??
  static getWorldNormal(object) {
    const normalMatrix = new THREE.Matrix3();
    const worldNormal = new THREE.Vector3(0, 0, 1);
    normalMatrix.getNormalMatrix(object.matrixWorld);
    worldNormal.applyMatrix3(normalMatrix).normalize().round();

    return worldNormal;
  }

  static calculateWorldRotatingVector(worldNormal, mouseDirection) {
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
  }

  static calculateCharFromVector(vector) {
    return ['x', 'y', 'z'].find(axes => Math.abs(vector[axes]) === 1);
  }

  // 평면에 해당하는 3x3 벡터를 리턴
  // array는 새로 만들어지지만, 안의 객체는 레퍼런스 복사
  static filterCubicsByPlane(plane, value, cubics) {
    value = Math.round(value);
    if (plane === 'x') return [...cubics[value]];
    if (plane === 'y') return cubics.map(y => y[value]);
    if (plane === 'z') return cubics.map(y => y.map(z => z[value]));

    return [];
  }

  static addCubicsToObjectScene(rotatingLayer, scene) {
    rotatingLayer.forEach(row => {
      row.forEach(col => {
        scene.add(col);
      });
    });

    return scene;
  }

  rotateBody(start, current) {
    const delta = new THREE.Vector2(start.x - current.x, start.y - current.y);
    this.mouseDelta = delta;
    if (this.mouseDirection || this.updateMouseDirection(delta)) {
      const direction = this.mouseDirection;
      const weight = 10; // 마우스를 이동하는 방향으로 큐브를 돌리기위함
      const value = Math.abs(delta[direction]);
      const weightedDelta = delta.clone();
      weightedDelta[direction] *= weight;
      weightedDelta.normalize();
      if (!this.selectedMesh) {
        this.rotateCore(start, weightedDelta, value);
      } else {
        const velocity = 0.1;
        this.rotateCubicsByScene(weightedDelta, value + velocity);
      }
    }
  }

  updateMouseDirection(delta) {
    this.mouseDirection = Cube.calculateMouseDirection(delta);

    return this.mouseDirection;
  }

  static calculateMouseDirection(delta, THRESHOLD = 0.1) {
    return ['x', 'y'].find(val => Math.abs(delta[val]) > THRESHOLD);
  }

  rotateCore(start, delta, value) {
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
  }

  rotateCubicsByScene(delta, value) {
    if (!this.rotatingAxesChar) return;
    const localVector = this.rotatingAxes;
    const worldVector = this.core.localToWorld(localVector.clone()).round();
    const v = Cube.calculateCharFromVector(worldVector);
    const worldNormal = Cube.getWorldNormal(this.selectedMesh);
    if (worldNormal.y === 1 && this.mouseDirection === 'x') {
      [delta.x, delta.y] = [delta.y, delta.x];
    }
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
  }

  slerp(clickStart, clickEnd, object = this.core) {
    const userDirection = this.getUserDirection(clickStart, clickEnd); // world 결과 리턴
    const destination = Cube.getCloserDirection(
      object,
      this.lastCubeQuaternion,
      userDirection,
    );

    //FIXME: clockwise 구하는거 다시
    const clockwise = this.clockwise;

    this.needCubicsUpdate = !destination.equals(this.lastCubeQuaternion);

    this.tweenObject(object, destination, clockwise);
  }

  // TODO:얘를 slerp로 바꿔버리자
  slerpCubicsByScene(delta, object) {
    if (!this.rotatingAxesChar) return;
    const localVector = this.rotatingAxes;
    const worldVector = this.core.localToWorld(localVector.clone()).round();
    const v = Cube.calculateCharFromVector(worldVector);

    // 가로회전축, 세로회전축
    const vertical = new THREE.Vector3(0, -delta.x, -delta.y);
    const horizontal = new THREE.Vector3(delta.y, -delta.x, 0);

    const vector = {
      x: () => horizontal,
      y: local => (local.y === 1 ? vertical : horizontal),
      z: () => vertical,
    };

    const origin = new THREE.Vector3().copy(this.selectedWorldNormal).round();
    const userDirection = new THREE.Vector3()
      .copy(this.selectedWorldNormal)
      .applyAxisAngle(vector[v](localVector), Math.PI / 2)
      .round();
    const cur = new THREE.Vector3()
      .copy(this.selectedWorldNormal)
      .applyAxisAngle(
        vector[v](localVector),
        Math.abs(delta[this.mouseDirection]) + 0.1,
      );

    const func = (cur, origin, userDir) => {
      return cur.angleTo(origin) < cur.angleTo(userDir) ? origin : userDir;
    };
    const destinationVector = func(cur, origin, userDirection);
    const destination = new THREE.Quaternion().setFromUnitVectors(
      origin,
      destinationVector,
    );

    this.needCubicsUpdate = !destinationVector.equals(origin);

    destination.multiply(this.lastCubeQuaternion).normalize();

    let clockwise = vector[v](localVector)[v] < 0;
    if (localVector.x + localVector.y + localVector.z < 0)
      clockwise = !clockwise;

    this.clockwise = clockwise;
    this.tweenObject(object, destination, clockwise);
  }

  getUserDirection(clickStart, clickEnd) {
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
    this.clockwise = invert;

    return direction;
  }

  static getCloserDirection(object, origin, direction) {
    const dest = new THREE.Quaternion().multiplyQuaternions(direction, origin);
    if (object.quaternion.angleTo(origin) < object.quaternion.angleTo(dest)) {
      dest.copy(origin);
    }

    return dest;
  }

  tweenObject(object, destination, clockwise) {
    new TWEEN.Tween(object.quaternion)
      .to(destination, 100)
      .start()
      .onComplete(() => {
        if (!isEmpty(this.rotatingLayer)) {
          this.attachCubicsToCore();
          if (this.needCubicsUpdate) {
            this.updateCubicsArray(clockwise);
          }
          this.rotatingLayer = [[]];
        }
        const scene = this.core.parent;
        const objectScene = scene.getObjectByName('objectScene');

        objectScene.clear();
        scene.remove(objectScene);

        this.rotatingAxesChar = '';
        this.rotatingAxes = null;
        this.selectedMesh = null;
        this.needCubicsUpdate = false;
        this.setLastCubeQuaternion(destination);
      });
  }

  attachCubicsToCore() {
    const cubics = this.getObjectScene().children;
    if (!cubics.length) return;
    for (let i = cubics.length - 1; i >= 0; i--) {
      this.core.attach(cubics[i]);
    }
  }

  getObjectScene() {
    const scene = this.core.parent;

    return scene.getObjectByName('objectScene');
  }

  updateCubicsArray(clockwise) {
    const dir = this.rotatingAxesChar === 'y' ? !clockwise : clockwise;
    const clock = () => {
      return this.rotatingAxesChar === 'x'
        ? clockwise
        : this.rotatingAxesChar === 'y'
        ? !clockwise
        : clockwise;
    };

    const newMatrix = Cube.createRotatedMatrix(this.rotatingLayer, dir);

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
          // this.cubics[cubic.position.x + 1][i][j] = newMatrix[i][j];
          this.cubicsLayerMatrix[cubic.position.x + 1][i][j] = newMatrix[i][j];
        }
      }
    } else if (this.rotatingAxesChar === 'y') {
      // rotatingCubics 는 selectedMesh.position['y'] +1 을 골랐음
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // this.cubics[i][cubic.position.y + 1][j] = newMatrix[i][j];
          this.cubicsLayerMatrix[i][cubic.position.y + 1][j] = newMatrix[i][j];
        }
      }
    } else if (this.rotatingAxesChar === 'z') {
      // rotatingCubics 는 selectedMesh.position['z'] +1 을 골랐음
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          // this.cubics[i][j][cubic.position.z + 1] = newMatrix[i][j];
          this.cubicsLayerMatrix[i][j][cubic.position.z + 1] = newMatrix[i][j];
        }
      }
    }
  }

  // 3x3 매트릭스 90도 회전
  static createRotatedMatrix(arr, clockwise) {
    const ret = Array.from(Array(3), () => new Array(3));
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
  }

  setLastCubeQuaternion(quaternion) {
    this.lastCubeQuaternion.copy(quaternion);
  }

  printPositions(matrix) {
    if (!matrix) {
      for (let i = 0; i < 3; i++) {
        let str = '';
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            str += `(${Math.round(
              // this.cubics[i][j][k].position.x,
              this.cubicsLayerMatrix[i][j][k].position.x,
            )},${Math.round(
              this.cubicsLayerMatrix[i][j][k].position.y,
            )},${Math.round(this.cubicsLayerMatrix[i][j][k].position.z)}), `;
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
  }

  printNames(matrix) {
    if (!matrix) {
      for (let i = 0; i < 3; i++) {
        let str = '';
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            str += `${this.cubicsLayerMatrix[i][j][k].name} `;
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
          str += `${matrix[i][j].name} `;
        }
        str += '\n';
        console.log(str);
      }
    }
  }

  resetMouseDirection() {
    this.mouseDirection = '';
  }
}
