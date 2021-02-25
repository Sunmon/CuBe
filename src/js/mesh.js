import {
  BoxGeometry,
  MeshPhongMaterial,
  LineBasicMaterial,
  PlaneBufferGeometry,
  BufferGeometry,
  Vector3,
  Mesh,
  Line,
  Object3D,
  MeshToonMaterial,
  WireframeGeometry,
  LineSegments,
  EdgesGeometry,
  Loader,
  RepeatWrapping,
  NearestFilter,
  PlaneGeometry,
  TextureLoader,
} from '../../lib/three.module.js';
import { CUBIC_PER_ROW, CUBIC_SIZE, WHITE } from '../common/constants.js';

// 카툰렌더링
// https://threejs.org/examples/#webgl_materials_variations_toon
export default class CustomMesh {
  static createCore() {
    const core = new Object3D();
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

  static createSticker(color) {
    const sticker = CustomMesh.createPlane(
      CUBIC_SIZE - 0.1,
      CUBIC_SIZE - 0.1,
      color,
    );
    sticker.name = 'sticker';
    const edges = new EdgesGeometry(sticker.geometry);
    const line = new LineSegments(
      edges,
      new LineBasicMaterial({ color: 0x000000, linewidth: 3 }),
    );
    sticker.add(line);

    return sticker;
  }

  static addStickerToCubic(cubic, sticker, direction) {
    const face = direction.clone().setLength(CUBIC_SIZE * 2);
    // sticker.translateOnAxis(direction, CUBIC_SIZE / 2);
    sticker.translateOnAxis(direction, CUBIC_SIZE / 2 + 0.01);
    sticker.lookAt(face);
    cubic.add(sticker);
  }

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
    return new MeshToonMaterial({
      color,
    });
  }

  static createTexture(src) {
    const loader = new TextureLoader();
    const texture = loader.load(src);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;

    return texture;
  }

  static getCenterPoint(mesh) {
    const { geometry } = mesh;
    const center = new Vector3();
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(center);
    mesh.localToWorld(center);

    return center;
  }

  static createObjectScene(object) {
    const objectScene = new Object3D();
    objectScene.applyQuaternion(object.quaternion);
    objectScene.name = 'objectScene';

    return objectScene;
  }

  static addCubicsToObjectScene(rotatingLayer, scene) {
    rotatingLayer.forEach(row => {
      row.forEach(col => {
        scene.add(col);
      });
    });

    return scene;
  }
}
