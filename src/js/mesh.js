import {
  BoxGeometry,
  MeshPhongMaterial,
  LineBasicMaterial,
  LineDashedMaterial,
  PlaneBufferGeometry,
  BufferGeometry,
  Vector3,
  DoubleSide,
  Mesh,
  Line,
} from '../../lib/three.module.js';

const createBoxGeometry = function (width, height, depth) {
  return new BoxGeometry(width, height, depth);
};

const createMaterial = function (color) {
  // TODO: 다른 면들까지 추가하고나면, DoubleSide 삭제하기
  return new MeshPhongMaterial({
    color,
    side: DoubleSide,
    opacity: 0.5,
    transparent: true,
  });
};

const boxGeometry = createBoxGeometry(1, 1, 1);
const material = createMaterial(0x857483);

const createPlaneGeometry = function (width, height) {
  return new PlaneBufferGeometry(width, height);
};

// namespace - 메쉬 관련된 함수 모음
const CustomMesh = {};

// TODO: 넓은 3x3짜리 plane은 Object3D 씬그래프로 변경할 것
// 일단 보기 좋게 3x3짜리도 Plane으로 놔둠
CustomMesh.createPlane = function (width, height, color) {
  const geometry = createPlaneGeometry(width, height);
  const material = createMaterial(color);

  return new Mesh(geometry, material);
};

CustomMesh.getCenterPoint = function (mesh) {
  const { geometry } = mesh;
  const center = new Vector3();

  geometry.computeBoundingBox();
  geometry.boundingBox.getCenter(center);
  mesh.localToWorld(center);

  return center;
};

CustomMesh.createLine = function (from, to) {
  const material = new LineBasicMaterial({ color: 0xffaa00 });
  const points = [new Vector3(...from), new Vector3(...to)];
  const geometry = new BufferGeometry().setFromPoints(points);
  const line = new Line(geometry, material);

  return line;
};

CustomMesh.temp = function () {
  return new Mesh(boxGeometry, material);
};

export default CustomMesh;
