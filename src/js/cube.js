// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as TWEEN from '../../lib/tween.esm.js';
import * as THREE from '../../lib/three.module.js';
import {
  CUBE_SIZE,
  CUBIC_PER_ROW,
  CUBIC_SIZE,
  DEFAULT_COLORS,
  THRESHOLD_ANGLE,
  VELOCITY,
  WEIGHT,
  CLOCKWISE,
  WHITE,
} from '../common/constants.js';
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

    // this.core = new THREE.Object3D();
    this.core = Cube.createCore();
    this.lastCubeQuaternion = new THREE.Quaternion();
    // this.cubics = [[[]]]; // 큐빅 배치 저장 (model). 항상 값을 일정하게 유지해야 한다
    this.cubics = Cube.createCubics();
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

  static createCore() {
    const core = new THREE.Object3D();
    core.name = 'core';

    return core;
  }

  static createCubics() {
    return [...Array(CUBIC_PER_ROW)].map(() =>
      [...Array(CUBIC_PER_ROW)].map(() =>
        [...Array(CUBIC_PER_ROW)].map(() => CustomMesh.createCubic(WHITE)),
      ),
    );
  }

  createCube() {
    this.cubics = Cube.createCubics();
    this.addStickersToCubics();
    this.setCubicsDefaultPositions();
    this.addCubicsToCore();

    // 임시용 큐브 이름 붙이기
    let name = 65;
    for (let i = 2; i >= 0; i--) {
      for (let j = 2; j >= 0; j--) {
        for (let k = 2; k >= 0; k--) {
          this.cubics[i][j][k].name = String.fromCharCode(name);
          name++;
        }
      }
    }
    this.printPositions();

    return this;
  }

  setCubicsDefaultPositions() {
    const pos = [-CUBIC_SIZE, 0, CUBIC_SIZE];
    for (let i = 0; i < CUBIC_PER_ROW; i++) {
      for (let j = 0; j < CUBIC_PER_ROW; j++) {
        for (let k = 0; k < CUBIC_PER_ROW; k++) {
          this.cubics[i][j][k].position.set(pos[i], pos[j], pos[k]);
        }
      }
    }
  }

  addCubicsToCore() {
    for (let i = 0; i < CUBIC_PER_ROW; i++) {
      for (let j = 0; j < CUBIC_PER_ROW; j++) {
        for (let k = 0; k < CUBIC_PER_ROW; k++) {
          this.core.add(this.cubics[i][j][k]);
          this.cubics[i][j][k].position.round();
        }
      }
    }
  }

  addStickersToCubics() {
    ['x0', 'x2', 'y0', 'y2', 'z0', 'z2'].forEach(([f, v], i) => {
      const layer = this.filterCubicsByLayer(f, +v);
      const vector = Cube.charToVector(f, v - 1);
      layer.forEach(row =>
        row.forEach(col => {
          const sticker = CustomMesh.createSticker(DEFAULT_COLORS[i]);
          Cube.addStickerToCubic(col, sticker, vector);
        }),
      );
    });
  }

  static addStickerToCubic(cubic, sticker, direction) {
    const lookAt = direction.clone().setLength(CUBIC_SIZE * 2);
    sticker.translateOnAxis(direction, CUBIC_SIZE / 2);
    sticker.lookAt(lookAt);
    cubic.add(sticker);
  }

  saveCurrentStatus() {
    this.setLastCubeQuaternion(this.core.quaternion);
    if (this.selectedMesh) {
      this.selectedWorldNormal = Cube.getWorldNormal(this.selectedMesh);
    }
  }

  calculateRotatingLayer(cubic) {
    this.rotatingAxes = this.calculateLocalRotatingAxes(this.selectedMesh);
    this.rotatingAxesChar = Cube.vectorToChar(this.rotatingAxes);

    return this.filterCubicsByLayer(
      this.rotatingAxesChar,
      cubic.position[this.rotatingAxesChar] + 1,
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
    const dir = {
      x: mouseDirection === 'x' ? 'y' : 'z',
      y: mouseDirection === 'x' ? 'z' : 'x',
      z: mouseDirection === 'x' ? 'y' : 'x',
    };

    return Cube.charToVector(dir[Cube.vectorToChar(worldNormal)]);
  }

  static vectorToChar(vector) {
    return ['x', 'y', 'z'].find(axes => Math.abs(vector[axes]) === 1);
  }

  static charToVector(char, val = 1) {
    const vector = new THREE.Vector3();
    vector[char] = val;

    return vector;
  }

  // 평면에 해당하는 3x3 벡터를 리턴
  // array는 새로 만들어지지만, 안의 객체는 레퍼런스 복사
  // TODO: cubics 전역변수로 변경
  filterCubicsByLayer(plane, value) {
    value = Math.round(value);
    if (plane === 'x') return [...this.cubics[value]];
    if (plane === 'y') return this.cubics.map(y => y[value]);
    if (plane === 'z') return this.cubics.map(y => y.map(z => z[value]));

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
    this.mouseDelta.set(current.x - start.x, current.y - start.y);
    // 처음 움직였던 방향으로만 움직이기 위해 mouseDirection이 필요함
    if (this.mouseDirection || this.updateMouseDirection(this.mouseDelta)) {
      const delta = this.weightedMouseDelta();
      if (this.rotatingAxesChar) {
        this.rotateCubicsByScene(delta);
      } else if (!this.selectedMesh) {
        this.rotateCore(start, delta);
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

  weightedMouseDelta() {
    const delta = this.mouseDelta.clone();
    delta[this.mouseDirection] *= WEIGHT;
    delta.normalize();

    return delta;
  }

  // static isDeltaOverThreshold(delta) {
  //   return Cube.calculateMouseDirection(delta);
  // }

  rotateCore(start, delta) {
    if (this.clickedBehindCube(start)) {
      Cube.inverseVector(delta, 'x');
    }
    this.updateCoreQuaternion(start, delta);
  }

  clickedBehindCube(start) {
    return this.mouseDirection === 'x' && start.y > 0;
  }

  static inverseVector(delta, axis) {
    delta[axis] = -delta[axis];
  }

  updateCoreQuaternion(start, delta) {
    const axis = this.mouseDirection === 'x' ? 'y' : start.x > 0 ? 'z' : 'x';
    const base = Cube.calculateMajorAxis(delta, this.mouseDelta);
    const temp = new THREE.Quaternion();
    const value = Math.abs(this.mouseDelta[this.mouseDirection]);
    temp.setFromAxisAngle(base(axis), value);
    this.core.setRotationFromQuaternion(
      temp.multiply(this.lastCubeQuaternion).normalize(),
    );
  }

  rotateCubicsByScene(delta) {
    if (this.clickedCubeUpside()) {
      Cube.swapVectorXY(delta);
    }
    const temp = new THREE.Quaternion();
    const value = Math.abs(this.mouseDelta[this.mouseDirection]) + VELOCITY;
    temp.setFromAxisAngle(this.calculateBaseVectorOfRotatingAxes(delta), value);
    this.getObjectScene().setRotationFromQuaternion(
      temp.multiply(this.lastCubeQuaternion).normalize(),
    );
  }

  clickedCubeUpside() {
    const worldNormal = Cube.getWorldNormal(this.selectedMesh);
    return worldNormal.y === 1 && this.mouseDirection === 'x';
  }

  static swapVectorXY(delta) {
    [delta.x, delta.y] = [delta.y, delta.x];
  }

  calculateBaseVectorOfRotatingAxes(delta) {
    const localVector = this.rotatingAxes;
    const worldVector = this.core.localToWorld(localVector.clone()).round();
    const base = Cube.calculateMajorAxis(delta, this.rotatingAxes);

    return base(Cube.vectorToChar(worldVector));
  }

  static calculateMajorAxis(delta, local) {
    const majorX = new THREE.Vector3(-delta.y, delta.x, 0);
    const majorZ = new THREE.Vector3(0, delta.x, delta.y);

    return rotatingAxis => {
      if (rotatingAxis === 'x') return majorX;
      if (rotatingAxis === 'y') return local.y === 1 ? majorZ : majorX;
      if (rotatingAxis === 'z') return majorZ;
      return new THREE.Vector3();
    };
  }

  slerp(clickStart, clickEnd, object = this.core) {
    const userDirection = this.worldDirectionQuaternion(clickStart); // world 기준 방향 리턴
    const destination = Cube.getCloserQuaternion(
      object,
      this.lastCubeQuaternion,
      userDirection,
    );
    this.needCubicsUpdate = !destination.equals(this.lastCubeQuaternion);
    this.tweenObject(object, destination);
  }

  slerpCubicsByScene(delta, object) {
    const base = this.calculateBaseVectorOfRotatingAxes(delta);
    const origin = this.selectedWorldNormal.clone();
    const userDirection = Cube.createRotatedVectorFrom(
      this.selectedWorldNormal,
      base,
      Math.PI / 2,
    ).round();
    const cur = Cube.createRotatedVectorFrom(
      this.selectedWorldNormal,
      base,
      Math.abs(delta[this.mouseDirection]) + 0.1,
    );
    const dest = Cube.getCloserVector(cur, origin, userDirection);
    const destQuaternion = new THREE.Quaternion().setFromUnitVectors(
      origin,
      dest,
    );

    this.needCubicsUpdate = !dest.equals(origin);
    destQuaternion.multiply(this.lastCubeQuaternion).normalize();
    this.updateClockwise(origin, dest);
    this.tweenObject(object, destQuaternion);
  }

  worldDirectionQuaternion(clickStart) {
    const units = ['z', 'y', 'x'].map(char => Cube.charToVector(char));
    const [other, k] = this.mouseDirection === 'x' ? ['y', 2] : ['x', 1];
    const [from, to] = clickStart[other] > 0 ? [2, 2 - k] : [0, k];
    const reverse = this.mouseDelta[this.mouseDirection] * clickStart[other];
    const direction = new THREE.Quaternion().setFromUnitVectors(
      units[from],
      units[to],
    );
    if (this.mouseDelta[this.mouseDirection] < 0) direction.invert();
    this.clockwise = this.mouseDirection === 'x' ? reverse > 0 : reverse < 0;

    return direction;
  }

  static createRotatedVectorFrom(src, axis, angle) {
    return src.clone().applyAxisAngle(axis, angle);
  }

  static getCloserQuaternion(cur, origin, direction) {
    const dest = new THREE.Quaternion().multiplyQuaternions(direction, origin);
    if (cur.quaternion.angleTo(origin) < THRESHOLD_ANGLE) {
      dest.copy(origin);
    }

    return dest;
  }

  static getCloserVector(cur, origin, direction) {
    return cur.angleTo(origin) < THRESHOLD_ANGLE ? origin : direction;
  }

  createWorldVectorFromLocal(localVector) {
    return this.core.localToWorld(localVector.clone());
  }

  createLocalVectorFromWorld(worldVector) {
    return this.core.worldToLocal(worldVector.clone());
  }

  updateClockwise(src, dest) {
    const localSrc = this.createLocalVectorFromWorld(src).round();
    const localDest = this.createLocalVectorFromWorld(dest).round();

    this.clockwise = Cube.isClockwise(localSrc, localDest);
  }

  static isClockwise(src, dest) {
    const srcInt = Cube.xyzToInt(Cube.vectorToChar(src));
    const destInt = Cube.xyzToInt(Cube.vectorToChar(dest));
    const reverse = src.getComponent(srcInt) * dest.getComponent(destInt) < 0;

    return reverse ? !CLOCKWISE[srcInt][destInt] : CLOCKWISE[srcInt][destInt];
  }

  static xyzToInt(char) {
    return { x: 0, y: 1, z: 2 }[char];
  }

  tweenObject(object, destination) {
    new TWEEN.Tween(object.quaternion)
      .to(destination, 100)
      .start()
      .onComplete(() => {
        if (!isEmpty(this.rotatingLayer)) {
          this.settleCubics();
        }
        this.setLastCubeQuaternion(destination);
        this.resetAll();
      });
  }

  settleCubics() {
    this.attachCubicsToCore();
    if (this.needCubicsUpdate) {
      this.arrangeCubicsMatrixByPosition(this.clockwise);
    }
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

  arrangeCubicsMatrixByPosition(clockwise) {
    const dir = this.rotatingAxesChar === 'y' ? !clockwise : clockwise;
    const newMatrix = Cube.createRotatedMatrix(this.rotatingLayer, dir);
    Cube.roundCubicsPositionOnMatrix(newMatrix); // copy 전에 선행되어야함
    const copyIntoCubic = this.copyFrom(this.rotatingAxesChar, newMatrix);
    newMatrix.forEach((row, i) => row.forEach((col, j) => copyIntoCubic(i, j)));
  }

  copyFrom(char, newMatrix) {
    const cubic = this.selectedMesh.parent;
    const pos = cubic.position[char] + 1;
    return (i, j) => {
      if (char === 'x') this.cubics[pos][i][j] = newMatrix[i][j];
      if (char === 'y') this.cubics[i][pos][j] = newMatrix[i][j];
      if (char === 'z') this.cubics[i][j][pos] = newMatrix[i][j];
    };
  }

  // 3x3 매트릭스 90도 회전
  static createRotatedMatrix(arr, clockwise) {
    const ret = Array.from(Array(3), () => new Array(3));
    for (let i = 0; i < CUBIC_PER_ROW; i++) {
      for (let j = 0; j < CUBIC_PER_ROW; j++) {
        if (clockwise) {
          ret[i][CUBIC_PER_ROW - j - 1] = arr[j][i];
        } else {
          ret[i][j] = arr[j][CUBIC_PER_ROW - i - 1];
        }
      }
    }

    return ret;
  }

  static roundCubicsPositionOnMatrix(matrix) {
    matrix.forEach(row => row.forEach(col => col.position.round()));
  }

  setLastCubeQuaternion(quaternion) {
    this.lastCubeQuaternion.copy(quaternion);
  }

  resetAll() {
    this.removeObjectScene();
    this.clearVariables();
  }

  removeObjectScene() {
    const scene = this.core.parent;
    const objectScene = scene.getObjectByName('objectScene');

    objectScene.clear();
    scene.remove(objectScene);
  }

  clearVariables() {
    this.rotatingAxesChar = '';
    this.rotatingAxes = null;
    this.selectedMesh = null;
    this.needCubicsUpdate = false;
    this.rotatingLayer = [[]];
  }

  printPositions(matrix) {
    if (!matrix) {
      for (let i = 0; i < 3; i++) {
        let str = '';
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            str += `(${Math.round(
              // this.cubics[i][j][k].position.x,
              this.cubics[i][j][k].position.x,
            )},${Math.round(this.cubics[i][j][k].position.y)},${Math.round(
              this.cubics[i][j][k].position.z,
            )}), `;
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
            str += `${this.cubics[i][j][k].name} `;
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
