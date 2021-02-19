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

export default class CustomMesh {
  static createPlane(width, height, color) {
    const geometry = CustomMesh.createPlaneGeometry(width, height);
    const material = CustomMesh.createMaterial(color);

    return new Mesh(geometry, material);
  }

  static createBox(width, height, depth, color) {
    const geometry = CustomMesh.createBoxGeometry(width, height, depth);
    const material = CustomMesh.createMaterial(color);

    return new Mesh(geometry, material);
  }

  static createPlaneGeometry(width, height) {
    return new PlaneBufferGeometry(width, height);
  }

  static createBoxGeometry(width, height, depth) {
    return new BoxGeometry(width, height, depth);
  }

  static createLine(from, to) {
    const material = new LineBasicMaterial({ color: 0xffaa00 });
    const points = [new Vector3(...from), new Vector3(...to)];
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);

    return line;
  }

  static createMaterial(color) {
    return new MeshPhongMaterial({
      color,
      // side: DoubleSide,
      opacity: 0.5,
      transparent: true,
    });
  }

  static getCenterPoint(mesh) {
    const { geometry } = mesh;
    const center = new Vector3();
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center);

    return center;
  }
}
