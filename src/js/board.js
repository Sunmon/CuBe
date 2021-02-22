import { TransformControls } from 'https://unpkg.com/three/examples/jsm/controls/TransformControls.js';
import * as THREE from '../../lib/three.module.js';
import * as TWEEN from '../../lib/tween.esm.js';
import Cube from './cube.js';
import CustomCamera from './camera.js';
import CustomScene from './scene.js';
import CustomRenderer from './renderer.js';
import CustomMesh from './mesh.js';
import PickHelper from './pickHelper.js';
import { axesHelper, isEmpty } from '../common/common.js';
import { CANVAS } from '../common/constants.js';

// const customCamera = CustomCamera.init();
const customCamera = new CustomCamera();
// const customRenderer = CustomRenderer.init();
const customRenderer = new CustomRenderer(CANVAS);
const customScene = new CustomScene();
// const cube = Cube.init();
const cube = new Cube();
// const pickHelper = new PickHelper(customScene.scene, customCamera.getCamera());
const pickHelper = new PickHelper(customScene.scene, customCamera.camera);

const followUserGesture = function (event) {
  const gesture = (event.touches && event.touches[0]) || event;
  // pickHelper.setPickPosition(gesture, customRenderer.getCanvas());
  pickHelper.saveCurrentPosition(gesture, customRenderer.canvas);
  if (!pickHelper.motioning) return;
  if (cube.selectedMesh && isEmpty(cube.rotatingLayer) && cube.mouseDirection) {
    const cubic = cube.selectedMesh.parent;
    const objectScene = customScene.scene.getObjectByName('objectScene');
    cube.rotatingLayer = cube.calculateRotatingLayer(cubic);
    Cube.addCubicsToObjectScene(cube.rotatingLayer, objectScene);
  }

  cube.rotateBody(pickHelper.pickStartedPosition, pickHelper.pickPosition);
};

const clearUserGesture = function () {
  pickHelper.clearPickPosition();
  cube.resetMouseDirection();
};

const initUserGesture = function (event) {
  event.preventDefault(); // 스크롤 이벤트 방지

  // pickHelper.setPickPosition(event, customRenderer.getCanvas());
  pickHelper.saveCurrentPosition(event, customRenderer.canvas);
  cube.selectedMesh = pickHelper.calculateClosestSticker(
    customScene.scene,
    // customCamera.getCamera(),
    customCamera.camera,
  );
  // cube.saveCurrentStatus(cube.core, cube.selectedMesh);
  cube.saveCurrentStatus();
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
    const objectScene = customScene.scene.getObjectByName('objectScene');
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
  customScene.addObject(createObjectScene(cube.core));
  // customScene.getScene().add(createObjectScene(cube.core));
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
    // camera.updateAspect(renderer.getRendererAspect());
    camera.updateAspect(renderer.rendererAspect);
  }
  // pickHelper.pick(customScene.scene, camera.getCamera(), time);
  // renderer.render(customScene.scene, camera.getCamera());
  pickHelper.pick(customScene.scene, camera.camera, time);
  renderer.render(customScene.scene, camera.camera);
};

const animate = function (camera, renderer) {
  const time = requestAnimationFrame(() => animate(camera, renderer));
  render(camera, renderer, time);
  TWEEN.update();
};

const initTransformControls = function () {
  const control = new TransformControls(
    // customCamera.getCamera(),
    customCamera.camera,
    customRenderer.canvas,
    // customRenderer.renderer.domElement,
  );
  control.setMode('rotate');
  control.addEventListener('dragging-changed', function (event) {});
  control.attach(cube.core);

  return control;
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  customScene.addObject(cube.core);
  initEventListners();

  cube.core.add(axesHelper(4));

  animate(customCamera, customRenderer);
}
