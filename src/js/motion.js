/**
 * @ref https://threejsfundamentals.org/threejs/lessons/kr/threejs-picking.html
 */
import { Raycaster } from '../../lib/three.module.js';

// 네임 스페이스
const PickHelper = {};

// 캔버스 내 정규화된 마우스의 좌표
PickHelper.pickPosition = { x: 0, y: 0 };
PickHelper.pickStartedPosition = { x: 0, y: 0 };
PickHelper.motioning = false;
PickHelper.selected = null; // 마우스로 선택한 객체

PickHelper.init = function () {
  this.raycaster = new Raycaster();
  this.pickedObject = null;
  this.pickedObjectSavedColor = 0;
  this.raycaster.params.Line.threshold = 0.1;

  return this;
};

PickHelper.getCurrentIntersect = function (scene) {
  return this.raycaster.intersectObjects(scene.children, true)[0];
};

PickHelper.getClosestSticker = function (scene, camera) {
  this.raycaster.setFromCamera(this.pickPosition, camera);

  return this.raycaster
    .intersectObjects(scene.children, true)
    .find(intersect => intersect.object.name === 'sticker');
};

PickHelper.pick = function (normalizedPosition, scene, camera, time) {
  // 이미 다른 물체를 피킹했다면 색을 복원합니다
  if (this.pickedObject) {
    this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);
    this.pickedObject = undefined;
  }

  this.raycaster.setFromCamera(normalizedPosition, camera);
  const intersectedObjects = this.raycaster.intersectObjects(
    scene.children,
    true,
  );
  if (intersectedObjects.length) {
    // this.pickedObject = intersectedObjects[0].object;
    this.pickedObject = this.getClosestSticker(scene, camera)?.object;
    this.pickedObjectSavedColor = this.pickedObject?.material.color.getHex();
    this.pickedObject?.material.color.setHex(
      (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000,
    );
  }
};

PickHelper.getCanvasRelativePosition = function (event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
};

PickHelper.setPickPosition = function (event, canvas) {
  const gesture = (event.touches && event.targetTouches[0]) || event;
  const pos = this.getCanvasRelativePosition(gesture, canvas);
  this.pickPosition.x = (pos.x / canvas.width) * 2 - 1;
  this.pickPosition.y = (pos.y / canvas.height) * -2 + 1; // Y 축을 뒤집었음

  const clicked = event.type === 'mousedown' || event.type === 'touchstart';
  if (clicked && !this.motioning) {
    this.setStartedPosition(this.pickPosition);
  }
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
