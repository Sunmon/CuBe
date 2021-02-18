/**
 * @ref https://threejsfundamentals.org/threejs/lessons/kr/threejs-picking.html
 */
import { Raycaster, Scene, Camera } from '../../lib/three.module.js';

// 네임 스페이스
const PickHelper = {
  raycaster: Raycaster,
  scene: Scene,
  camera: Camera,
  pickPosition: { x: 0, y: 0 }, // 정규화된 마우스 좌표
  pickStartedPosition: { x: 0, y: 0 },
  motioning: false,
  pickedObject: null,
  pickedObjectSavedColor: 0,
};

PickHelper.init = function (scene, camera) {
  this.raycaster = new Raycaster();
  this.raycaster.params.Line.threshold = 0.1;
  this.scene = scene;
  this.camera = camera;
  this.pickedObject = null;
  this.pickedObjectSavedColor = 0;

  return this;
};

PickHelper.pick = function (time) {
  if (this.pickedObject) {
    this.resetPickedObject();
  }
  this.pickedObject = this.getClosestSticker(this.scene, this.camera);
  if (this.pickedObject) {
    this.twinklePickedObject(time);
  }
};

PickHelper.resetPickedObject = function () {
  this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
  this.pickedObject = null;
};

PickHelper.getClosestSticker = function (scene, camera) {
  this.raycaster.setFromCamera(this.pickPosition, camera);

  return this.raycaster
    .intersectObjects(scene.children, true)
    ?.find(intersect => intersect.object.name === 'sticker')?.object;
};

PickHelper.twinklePickedObject = function (time) {
  this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
  this.pickedObject.material.color.setHex(
    (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000,
  );
};

PickHelper.saveCurrentPosition = function (event, canvas) {
  this.setPickPosition(event, canvas);
  if (this.isClickStart(event)) {
    this.setStartedPosition(this.pickPosition);
  }
};

PickHelper.setPickPosition = function (event, canvas) {
  const gesture = (event.touches && event.targetTouches[0]) || event;
  const pos = this.getCanvasRelativePosition(gesture, canvas);
  this.pickPosition.x = (pos.x / canvas.width) * 2 - 1;
  this.pickPosition.y = (pos.y / canvas.height) * -2 + 1; // Y 축을 뒤집었음
};

PickHelper.isClickStart = function (event) {
  return event.type === 'mousedown' || event.type === 'touchstart';
};

PickHelper.getCanvasRelativePosition = function (event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
};

PickHelper.setStartedPosition = function (pos) {
  this.pickStartedPosition = { ...pos };
  this.motioning = true;
};

PickHelper.clearPickPosition = function () {
  // 터치하는 경우에 손가락을 떼면 위치 초기화하기 위함
  [this.pickPosition.x, this.pickPosition.y] = [-10000, -10000];
  [this.pickStartedPosition.x, this.pickStartedPosition.y] = [-10000, -10000];
  this.motioning = false;
};

export { PickHelper };
