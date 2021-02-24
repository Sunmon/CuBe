/**
 * @ref https://threejsfundamentals.org/threejs/lessons/kr/threejs-picking.html
 */
import { Raycaster } from '../../lib/three.module.js';

export default class PickHelper {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new Raycaster();
    this.raycaster.params.Line.threshold = 0.1;
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
    this.pickPosition = { x: 0, y: 0 }; // 정규화된 마우스 좌표
    this.pickStartedPosition = { x: 0, y: 0 };
    this.motioning = false;
  }

  static isClickStart(event) {
    return event.type === 'mousedown' || event.type === 'touchstart';
  }

  static calculateCanvasRelativePosition(event, canvas) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  pick(time) {
    if (this.pickedObject) {
      this.resetPickedObject();
    }
    this.pickedObject = this.calculateClosestSticker(this.scene, this.camera);
    if (this.pickedObject) {
      this.twinklePickedObject(time);
    }
  }

  resetPickedObject() {
    this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
    this.pickedObject = null;
  }

  calculateClosestSticker(scene, camera) {
    this.raycaster.setFromCamera(this.pickPosition, camera);

    return this.raycaster
      .intersectObjects(scene.children, true)
      ?.find(intersect => intersect.object.name === 'sticker')?.object;
  }

  twinklePickedObject(time) {
    this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
    this.pickedObject.material.color.setHex(
      (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000,
    );
  }

  saveCurrentPosition(event, canvas) {
    this.savePickPosition(event, canvas);
    if (PickHelper.isClickStart(event)) {
      this.saveStartedPosition(this.pickPosition);
    }
  }

  savePickPosition(event, canvas) {
    const gesture = (event.touches && event.targetTouches[0]) || event;
    const pos = PickHelper.calculateCanvasRelativePosition(gesture, canvas);
    this.pickPosition.x = (pos.x / canvas.width) * 2 - 1;
    this.pickPosition.y = (pos.y / canvas.height) * -2 + 1; // Y 축을 뒤집었음
  }

  saveStartedPosition(pos) {
    this.pickStartedPosition = { ...pos };
    this.motioning = true;
  }

  clearPickPosition() {
    // 터치하는 경우에 손가락을 떼면 위치 초기화하기 위함
    [this.pickPosition.x, this.pickPosition.y] = [-10000, -10000];
    [this.pickStartedPosition.x, this.pickStartedPosition.y] = [-10000, -10000];
    this.motioning = false;
  }
}
