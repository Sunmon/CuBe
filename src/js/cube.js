// import * as THREE from 'three'; // webpack으로 모듈 사용시
import * as THREE from '../../lib/three.module.js';

const createBoxGeometry = function (width, height, depth) {
  return new THREE.BoxGeometry(width, height, depth);
};

const createMaterial = function (color) {
  // TODO: 다른 면들까지 추가하고나면, THREE.DoubleSide 삭제하기
  return new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
};

const createPlaneGeometry = function (
  width,
  height,
  widthSegments,
  heightSegments,
) {
  return new THREE.PlaneBufferGeometry(
    width,
    height,
    widthSegments,
    heightSegments,
  );
};

// namespace
const gameCube = {};

gameCube.createLine = function (from, to) {
  const material = new THREE.LineBasicMaterial({ color: 0xbabcfd });
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);

  return line;
};

// TODO: 넓은 3x3짜리 plane은 Object3D 씬그래프로 변경할 것
// 일단 보기 좋게 3x3짜리도 Plane으로 놔둠
gameCube.createPlane = function (width, height, color) {
  const geometry = createPlaneGeometry(width, height);
  const material = createMaterial(color);

  return new THREE.Mesh(geometry, material);
};

gameCube.getCenterPoint = function (mesh) {
  const { geometry } = mesh;
  geometry.computeBoundingBox();
  const center = new THREE.Vector3();
  geometry.boundingBox.getCenter(center);
  mesh.localToWorld(center);

  return center;
};

export default gameCube;
