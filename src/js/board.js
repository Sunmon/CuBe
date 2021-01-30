import { TransformControls } from 'https://unpkg.com/three/examples/jsm/controls/TransformControls.js';
import * as THREE from '../../lib/three.module.js';
import * as TWEEN from '../../lib/tween.esm.js';
import Cube from './cube.js';
import CustomCamera from './camera.js';
import CustomScene from './scene.js';
import CustomRenderer from './renderer.js';
import CustomMesh from './mesh.js';
import { PickHelper } from './motion.js';
import { axesHelper } from '../common/common.js';

const customCamera = CustomCamera.init();
const customRenderer = CustomRenderer.init();
const customScene = CustomScene.init();
const cube = Cube.init();
const pickHelper = PickHelper.init();
let tempSelected = null;

const followUserGesture = function (event) {
  const gesture = (event.touches && event.touches[0]) || event;
  pickHelper.setPickPosition(gesture, customRenderer.getCanvas());
  if (pickHelper.motioning) {
    cube.rotateBody(pickHelper.pickStartedPosition, pickHelper.pickPosition);
  }
};

const clearUserGesture = function () {
  pickHelper.clearPickPosition();
  cube.selectedMesh = null;
};

const initUserGesture = function (event) {
  event.preventDefault(); // 스크롤 이벤트 방지
  const gesture = (event.touches && event.touches[0]) || event;
  pickHelper.setPickPosition(gesture, customRenderer.getCanvas());
  tempSelected = pickHelper.getCurrentIntersect(customScene);
  cube.selectedMesh = tempSelected?.object;
  console.log(tempSelected?.object.geometry);
  console.log(cube.selectedMesh);
  // TODO: 선택한게 있다/ 없다로 큐브 전체회전 / 일반회전 나누기
  // if (tempSelected.object.geometry.type === 'PlaneBufferGeometry')
  // tempSelected = tempSelected.object.parent;
  // if (tempSelected.object.geometry.type === 'BoxGeometry') console.log('box');
  // console.log(tempSelected);
  cube.core.center.quaternion.copy(cube.lastCubeQuaternion);
};

const rotateToClosest = function () {
  const clickStart = { ...pickHelper.pickStartedPosition };
  const clickEnd = { ...pickHelper.pickPosition };
  cube.slerp(clickStart, clickEnd);
  pickHelper.clearPickPosition();
  cube.resetMouseDirection();
};

const initMouseEvents = function () {
  window.addEventListener('mousemove', followUserGesture);
  window.addEventListener('mouseout', clearUserGesture);
  window.addEventListener('mouseleave', clearUserGesture);
  window.addEventListener('mousedown', initUserGesture);
  window.addEventListener('mouseup', rotateToClosest);
};

const initMobileEvents = function () {
  window.addEventListener('touchstart', initUserGesture, { passive: false });
  window.addEventListener('touchmove', followUserGesture);
  window.addEventListener('touchend', rotateToClosest);
};

const initEventListners = function () {
  initMouseEvents();
  initMobileEvents();
};

const render = function (camera, renderer, time) {
  time *= 0.005;
  if (renderer.resizeRenderToDisplaySize()) {
    camera.updateAspect(renderer.getRendererAspect());
  }
  pickHelper.pick(
    pickHelper.pickPosition,
    customScene,
    camera.getCamera(),
    time,
  );
  renderer.render(customScene, camera.getCamera());
};

const animate = function (camera, renderer) {
  const time = requestAnimationFrame(() => animate(camera, renderer));
  render(camera, renderer, time);
  TWEEN.update();
};

const initTransformControls = function () {
  const control = new TransformControls(
    customCamera.getCamera(),
    customRenderer.renderer.domElement,
  );
  control.setMode('rotate');
  control.addEventListener('dragging-changed', function (event) {});
  control.attach(cube.core.center);

  return control;
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  customScene.add(cube.core.center);
  initEventListners();

  cube.core.center.add(axesHelper(1));

  animate(customCamera, customRenderer);
}
