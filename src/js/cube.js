// import * as THREE from 'three'; // webpack으로 모듈 사용시
import CustomMesh from './mesh.js';
import * as TWEEN from '../../lib/tween.esm.js';
import * as THREE from '../../lib/three.module.js';
import {
  CUBIC_SIZE,
  DEFAULT_COLORS,
  VELOCITY,
  WEIGHT,
} from '../common/constants.js';
import Utils from '../common/utils.js';

export default class Cube {
  constructor(enableEvent) {
    this.core = new THREE.Object3D();
    this.cubics = [[[]]]; // cuibcs[x][y][z].position: (x-1, y-1, z-1)로 일정하게 유지
    this.mouseDelta = new THREE.Vector2();
    this.mouseDirection = ''; // x,y (화면 가로, 화면 세로). 가로세로 중 한 방향으로만 움직이기 위해 필요함
    this.selectedMesh = null; // 마우스로 선택한 메쉬
    this.selectedWorldNormal = new THREE.Vector3(); // 선택한 메쉬의 월드 노멀 벡터
    this.clockwise = false;
    this.rotatingLayer = [[]]; // 회전할 평면에 속하는 큐빅들을 임시로 저장하는 배열
    this.rotatingAxesChar = '';
    this.rotatingAxes = new THREE.Vector3();
    this.needCubicsUpdate = false;
    this.lastCubeQuaternion = new THREE.Quaternion();
    this.enableEvent = enableEvent;

    this.createCube();
  }

  createCube() {
    this.core = CustomMesh.createCore();
    this.cubics = CustomMesh.createCubics();
    Utils.applyAllCubics(this.addStickerToCubic());
    Utils.applyAllCubics(this.setDefaultPosition());
    Utils.applyAllCubics(this.addCubicToCore());
    Utils.applyAllCubics(this.nameToCubic());

    return this;
  }

  setDefaultPosition() {
    const pos = [-CUBIC_SIZE, 0, CUBIC_SIZE];
    return (i, j, k) =>
      this.cubics[i][j][k].position.set(pos[i], pos[j], pos[k]);
  }

  addCubicToCore() {
    return (i, j, k) => {
      this.core.add(this.cubics[i][j][k]);
      this.cubics[i][j][k].position.round();
    };
  }

  addStickerToCubic() {
    return (x, y, z) => {
      if (x % 2 === 0) this.stickerOnto('x', { x, y, z });
      if (y % 2 === 0) this.stickerOnto('y', { x, y, z });
      if (z % 2 === 0) this.stickerOnto('z', { x, y, z });
    };
  }

  stickerOnto(axis, val) {
    const { x, y, z } = val;
    const color = Utils.xyzToInt(axis) * 2 + val[axis] / 2;
    const sticker = CustomMesh.createSticker(DEFAULT_COLORS[color]);
    const vector = Utils.charToVector(axis, val[axis] - 1);
    CustomMesh.addStickerToCubic(this.cubics[x][y][z], sticker, vector);
  }

  nameToCubic() {
    let name = 65;
    return (i, j, k) => {
      this.cubics[i][j][k].name = String.fromCharCode(name);
      name += 1;
    };
  }

  saveCurrentStatus() {
    this.setLastCubeQuaternion(this.core.quaternion);
    if (this.selectedMesh) {
      this.selectedWorldNormal = Utils.getWorldNormal(this.selectedMesh);
    }
  }

  initRotatingLayer() {
    const cubic = this.selectedMesh.parent;
    const objectScene = this.getObjectScene();
    this.rotatingLayer = this.calculateRotatingLayer(cubic);
    CustomMesh.addCubicsToObjectScene(this.rotatingLayer, objectScene);
  }

  calculateRotatingLayer(cubic) {
    this.rotatingAxes = this.calculateLocalRotatingAxes(this.selectedMesh);
    this.rotatingAxesChar = Utils.vectorToChar(this.rotatingAxes);

    return this.filterCubicsByLayer(
      this.rotatingAxesChar,
      cubic.position[this.rotatingAxesChar] + 1,
    );
  }

  calculateLocalRotatingAxes(selected) {
    const worldNormal = Utils.getWorldNormal(selected);
    const worldRotatingVector = Utils.calculateWorldRotatingVector(
      worldNormal,
      this.mouseDirection,
    );
    const localRotatingVector = this.core
      .worldToLocal(worldRotatingVector.clone())
      .round();

    return localRotatingVector;
  }

  // 평면에 해당하는 3x3 벡터를 리턴
  // array는 새로 만들어지지만, 안의 객체는 레퍼런스 복사
  filterCubicsByLayer(plane, value) {
    const roundVal = Math.round(value);
    if (plane === 'x') return [...this.cubics[roundVal]];
    if (plane === 'y') return this.cubics.map(y => y[roundVal]);
    if (plane === 'z') return this.cubics.map(y => y.map(z => z[roundVal]));

    return [];
  }

  rotateBody(start, current) {
    this.mouseDelta.set(current.x - start.x, current.y - start.y);
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
    this.mouseDirection = Utils.calculateMouseDirection(delta);

    return this.mouseDirection;
  }

  weightedMouseDelta() {
    const delta = this.mouseDelta.clone();
    delta[this.mouseDirection] *= WEIGHT;
    delta.normalize();

    return delta;
  }

  rotateCore(start, delta) {
    if (this.clickedBehindCube(start)) {
      Utils.inverseVector(delta, 'x');
    }
    this.updateCoreQuaternion(start, delta);
  }

  clickedBehindCube(start) {
    return this.mouseDirection === 'x' && start.y > 0;
  }

  updateCoreQuaternion(start, delta) {
    const axis = this.mouseDirection === 'x' ? 'y' : start.x > 0 ? 'z' : 'x';
    const base = Utils.calculateMajorAxis(delta, this.mouseDelta);
    const temp = new THREE.Quaternion();
    const value = Math.abs(this.mouseDelta[this.mouseDirection]);
    temp.setFromAxisAngle(base(axis), value);
    this.core.setRotationFromQuaternion(
      temp.multiply(this.lastCubeQuaternion).normalize(),
    );
  }

  rotateCubicsByScene(delta) {
    if (this.clickedCubeUpside()) {
      Utils.swapVectorXY(delta);
    }
    const temp = new THREE.Quaternion();
    const value = Math.abs(this.mouseDelta[this.mouseDirection]) + VELOCITY;
    temp.setFromAxisAngle(this.calculateBaseVectorOfRotatingAxes(delta), value);
    this.getObjectScene().setRotationFromQuaternion(
      temp.multiply(this.lastCubeQuaternion).normalize(),
    );
  }

  clickedCubeUpside() {
    const worldNormal = Utils.getWorldNormal(this.selectedMesh);
    return worldNormal.y === 1 && this.mouseDirection === 'x';
  }

  calculateBaseVectorOfRotatingAxes(delta) {
    const localVector = this.rotatingAxes;
    const worldVector = this.core.localToWorld(localVector.clone()).round();
    const base = Utils.calculateMajorAxis(delta, this.rotatingAxes);

    return base(Utils.vectorToChar(worldVector));
  }

  slerp(clickStart, object = this.core) {
    const userDirection = this.worldUserDirQuaternion(clickStart); // world 기준 방향 리턴
    const destination = Utils.getCloserQuaternion(
      object,
      this.lastCubeQuaternion,
      userDirection,
    );
    this.needCubicsUpdate = !destination.equals(this.lastCubeQuaternion);
    this.tweenObject(object, destination);
  }

  slerpCubicsByScene(object) {
    const delta = this.weightedMouseDelta(this.mouseDelta);
    const base = this.calculateBaseVectorOfRotatingAxes(delta);
    const origin = this.selectedWorldNormal.clone();
    const userDirection = Utils.createRotatedVectorFrom(
      this.selectedWorldNormal,
      base,
      Math.PI / 2,
    ).round();
    const cur = Utils.createRotatedVectorFrom(
      this.selectedWorldNormal,
      base,
      Math.abs(this.mouseDelta[this.mouseDirection]) + 0.1,
    );
    const dest = Utils.getCloserVector(cur, origin, userDirection);
    const destQuaternion = new THREE.Quaternion().setFromUnitVectors(
      origin,
      dest,
    );

    this.needCubicsUpdate = !dest.equals(origin);
    destQuaternion.multiply(this.lastCubeQuaternion).normalize();
    this.updateClockwise(origin, dest);
    this.tweenObject(object, destQuaternion);
  }

  worldUserDirQuaternion(clickStart) {
    const units = ['z', 'y', 'x'].map(char => Utils.charToVector(char));
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

  createWorldVectorFromLocal(localVector) {
    return this.core.localToWorld(localVector.clone());
  }

  createLocalVectorFromWorld(worldVector) {
    return this.core.worldToLocal(worldVector.clone());
  }

  updateClockwise(src, dest) {
    const localSrc = this.createLocalVectorFromWorld(src).round();
    const localDest = this.createLocalVectorFromWorld(dest).round();

    this.clockwise = Utils.isClockwise(localSrc, localDest);
  }

  tweenObject(object, destination) {
    new TWEEN.Tween(object.quaternion)
      .to(destination, 100)
      .start()
      .onComplete(() => {
        if (!Utils.isEmpty(this.rotatingLayer)) {
          this.settleCubics();
        }
        this.setLastCubeQuaternion(destination);
        this.resetAll();
        // FIXME: fix issue https://github.com/Sunmon/CuBe/issues/19
        this.enableEvent.click = true;
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
    const newMatrix = Utils.createRotatedMatrix(this.rotatingLayer, dir);
    Utils.roundCubicsPositionOnMatrix(newMatrix); // copy 전에 선행되어야함
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

  printPosition() {
    let str = '';
    return (i, j, k) => {
      const { x, y, z } = this.cubics[i][j][k].position.round();
      str += `(${x},${y},${z}), `;
      if (k === 2) str += '\n';
      if (k === 2 && j === 2) {
        console.log(str);
        str = '';
      }
    };
  }

  printName() {
    let str = '';
    return (i, j, k) => {
      str += `${this.cubics[i][j][k].name} `;
      if (k === 2) str += '\n';
      if (k === 2 && j === 2) {
        console.log(str);
        str = '';
      }
    };
  }

  resetMouseDirection() {
    this.mouseDirection = '';
  }
}
