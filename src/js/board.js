import { TransformControls } from 'https://unpkg.com/three/examples/jsm/controls/TransformControls.js';
import * as THREE from '../../lib/three.module.js';
import * as TWEEN from '../../lib/tween.esm.js';
import Cube from './cube.js';
import CustomCamera from './camera.js';
import CustomScene from './scene.js';
import CustomRenderer from './renderer.js';
import CustomMesh from './mesh.js';
import { PickHelper } from './motion.js';
import { axesHelper, isEmpty } from '../common/common.js';

const customCamera = CustomCamera.init();
const customRenderer = CustomRenderer.init();
const customScene = CustomScene.init();
const cube = Cube.init();
const pickHelper = PickHelper.init();

const followUserGesture = function (event) {
  const gesture = (event.touches && event.touches[0]) || event;
  pickHelper.setPickPosition(gesture, customRenderer.getCanvas());
  if (!pickHelper.motioning) return;
  if (cube.selectedMesh && isEmpty(cube.rotatingLayer) && cube.mouseDirection) {
    const cubic = cube.selectedMesh.parent;
    const objectScene = customScene.getObjectByName('objectScene');
    cube.rotatingLayer = cube.calculateRotatingLayer(cubic);
    cube.addCubicsToObjectScene(cube.rotatingLayer, objectScene);
  }

  cube.rotateBody(pickHelper.pickStartedPosition, pickHelper.pickPosition);
};

const clearUserGesture = function () {
  pickHelper.clearPickPosition();
  cube.resetMouseDirection();
};

const initUserGesture = function (event) {
  event.preventDefault(); // 스크롤 이벤트 방지

  pickHelper.setPickPosition(event, customRenderer.getCanvas());
  cube.selectedMesh = pickHelper.getClosestSticker(
    customScene,
    customCamera.getCamera(),
  )?.object;
  cube.saveCurrentStatus(cube.core, cube.selectedMesh);
};

const alreadyClear = function () {
  return !pickHelper.motioning;
};

const rotateToClosest = function () {
  const clickStart = { ...pickHelper.pickStartedPosition };
  const clickEnd = { ...pickHelper.pickPosition };
  if (!cube.selectedMesh) {
    cube.slerp(clickStart, clickEnd); // 큐브 몸통 전체 회전
  } else {
    const objectScene = customScene.getObjectByName('objectScene');
    if (!objectScene) {
      alert('no object scene');
      return;
    }
    cube.slerpCubicsByScene(cube.mouseDelta, objectScene); // 특정 층만 회전
  }
};

const createObjectScene = function (object) {
  const objectScene = new THREE.Object3D();
  objectScene.applyQuaternion(object.quaternion);
  objectScene.name = 'objectScene';

  return objectScene;
};

const handleMouseDown = function (event) {
  initUserGesture(event);
  customScene.add(createObjectScene(cube.core));
};

const handleMouseMove = function (event) {
  followUserGesture(event);
};

const handleMouseUp = function (event) {
  if (alreadyClear()) return;
  rotateToClosest(event);
  clearUserGesture();
};

const initMouseEvents = function () {
  window.addEventListener('mousedown', handleMouseDown);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseout', handleMouseUp);
  window.addEventListener('mouseleave', handleMouseUp);
  window.addEventListener('mouseup', handleMouseUp);
};

const initMobileEvents = function () {
  window.addEventListener('touchstart', handleMouseDown, { passive: false });
  window.addEventListener('touchmove', handleMouseMove);
  window.addEventListener('touchend', handleMouseUp);
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
  control.attach(cube.core);

  return control;
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  customScene.add(cube.core);
  initEventListners();

  cube.core.add(axesHelper(4));

  animate(customCamera, customRenderer);
}
