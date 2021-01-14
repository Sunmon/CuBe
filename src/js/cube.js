// import * as THREE from 'three'; // webpack으로 모듈 사용시
import * as THREE from '../../lib/three.module.js';

const createBoxGeometry = function (width, height, depth) {
  return new THREE.BoxGeometry(width, height, depth);
};

const createMeshMaterial = function (color) {
  return new THREE.MeshBasicMaterial({ color });
};

const createTestBox = function () {
  const geometry = createBoxGeometry(1, 1, 1);
  const material = createMeshMaterial(0x00ff00);
  return new THREE.Mesh(geometry, material);
};

const testBox = createTestBox();
export { testBox };
