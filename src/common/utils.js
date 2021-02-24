import {
  AxesHelper,
  Vector3,
  Matrix3,
  Quaternion,
} from '../../lib/three.module.js';
import { CLOCKWISE, CUBIC_PER_ROW, THRESHOLD_ANGLE } from './constants.js';

export default class Utils {
  // X(빨강), Y(초록), Z(파랑) 축 표시
  static axesHelper(len) {
    return new AxesHelper(len);
  }

  static isEmpty(object) {
    if (object === null || object === undefined) return true;
    if (Array.isArray(object)) {
      if (!object.length) return true;
      if (object.length > 1) return false;
      return Array.isArray(object[0]) ? Utils.isEmpty(object[0]) : false;
    }

    return false;
  }

  static setObjectPosition(object, x, y, z) {
    object.position.x = x;
    object.position.y = y;
    object.position.z = z;
  }

  static applyAllCubics(func) {
    for (let i = 0; i < CUBIC_PER_ROW; i++) {
      for (let j = 0; j < CUBIC_PER_ROW; j++) {
        for (let k = 0; k < CUBIC_PER_ROW; k++) {
          func(i, j, k);
        }
      }
    }
  }

  static getWorldNormal(object) {
    const normalMatrix = new Matrix3();
    const worldNormal = new Vector3(0, 0, 1);
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

    return Utils.charToVector(dir[Utils.vectorToChar(worldNormal)]);
  }

  static vectorToChar(vector) {
    return ['x', 'y', 'z'].find(axes => Math.abs(vector[axes]) === 1);
  }

  static charToVector(char, val = 1) {
    const vector = new Vector3();
    vector[char] = val;

    return vector;
  }

  static calculateMajorAxis(delta, local) {
    const majorX = new Vector3(-delta.y, delta.x, 0);
    const majorZ = new Vector3(0, delta.x, delta.y);

    return rotatingAxis => {
      if (rotatingAxis === 'x') return majorX;
      if (rotatingAxis === 'y') return local.y === 1 ? majorZ : majorX;
      if (rotatingAxis === 'z') return majorZ;
      return new Vector3();
    };
  }

  static inverseVector(delta, axis) {
    delta[axis] = -delta[axis];
  }

  static swapVectorXY(delta) {
    [delta.x, delta.y] = [delta.y, delta.x];
  }

  static calculateMouseDirection(delta, THRESHOLD = 0.1) {
    return ['x', 'y'].find(val => Math.abs(delta[val]) > THRESHOLD);
  }

  static createRotatedVectorFrom(src, axis, angle) {
    return src.clone().applyAxisAngle(axis, angle);
  }

  static getCloserQuaternion(cur, origin, direction) {
    const dest = new Quaternion().multiplyQuaternions(direction, origin);
    if (cur.quaternion.angleTo(origin) < THRESHOLD_ANGLE) {
      dest.copy(origin);
    }

    return dest;
  }

  static getCloserVector(cur, origin, direction) {
    return cur.angleTo(origin) < THRESHOLD_ANGLE ? origin : direction;
  }

  static isClockwise(src, dest) {
    const srcInt = Utils.xyzToInt(Utils.vectorToChar(src));
    const destInt = Utils.xyzToInt(Utils.vectorToChar(dest));
    const reverse = src.getComponent(srcInt) * dest.getComponent(destInt) < 0;

    return reverse ? !CLOCKWISE[srcInt][destInt] : CLOCKWISE[srcInt][destInt];
  }

  static xyzToInt(char) {
    return { x: 0, y: 1, z: 2 }[char];
  }

  // 3x3 매트릭스 90도 회전
  static createRotatedMatrix(arr, clockwise) {
    return clockwise
      ? Utils.rotateMatrix90Degree(arr)
      : Utils.rotateMatrix270Degree(arr);
  }

  static rotateMatrix90Degree(arr) {
    const ret = Array.from(Array(3), () => new Array(3));
    for (let i = 0; i < CUBIC_PER_ROW; i++) {
      for (let j = 0; j < CUBIC_PER_ROW; j++) {
        ret[i][CUBIC_PER_ROW - j - 1] = arr[j][i];
      }
    }

    return ret;
  }

  static rotateMatrix270Degree(arr) {
    const ret = Array.from(Array(3), () => new Array(3));
    for (let i = 0; i < CUBIC_PER_ROW; i++) {
      for (let j = 0; j < CUBIC_PER_ROW; j++) {
        ret[i][j] = arr[j][CUBIC_PER_ROW - i - 1];
      }
    }

    return ret;
  }

  static roundCubicsPositionOnMatrix(matrix) {
    matrix.forEach(row => row.forEach(col => col.position.round()));
  }

  static printMatrixPosition(matrix) {
    let str = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const { x, y, z } = matrix[i][j].position.round();
        str += `(${x},${y},${z}), `;
      }
      str += '\n';
    }
    console.log(str);
  }

  static printMatrixNames(matrix) {
    let str = '';
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        str += `${matrix[i][j].name} `;
      }
      str += '\n';
    }
    console.log(str);
  }
}
