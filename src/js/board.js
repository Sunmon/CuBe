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
  // tempSelected = pickHelper.getCurrentIntersect(customScene);
  tempSelected = pickHelper.getClosestSticker(customScene);
  cube.selectedMesh = tempSelected?.object;

  // cube core의 마지막 매트릭스 저장
  cube.lastCubeWorldMatrix.copy(cube.core.center.matrixWorld);

  // TODO: worldQuaternion으로 수정하기
  cube.lastCubeQuaternion.copy(cube.core.center.quaternion);

  // NOTE: 1. 큐브를 회전할 씬 그래프 생성
  const tempScene = new THREE.Object3D();
  tempScene.applyQuaternion(cube.core.center.quaternion);
  tempScene.name = 'tempScene';
  cube.tempScene = tempScene;

  // NOTE: 2. 씬 그래프에 선택한 큐빅 추가
  if (cube.selectedMesh) {
    const cubic = cube.selectedMesh.parent;
    cube.tempScene.add(cubic);
  }

  // NOTE: 3. 전체 씬에 씬 그래프 추가
  customScene.add(tempScene);
};

const rotateToClosest = function () {
  const clickStart = { ...pickHelper.pickStartedPosition };
  const clickEnd = { ...pickHelper.pickPosition };
  // NOTE: 5. tempScene에 있던 큐빅을 다시 cube로 돌려놓는다
  if (!cube.selectedMesh) {
    cube.slerp(clickStart, clickEnd);
  } else {
    cube.slerp(clickStart, clickEnd, cube.tempScene);
    const cubic = cube.tempScene.children[0];
    // NOTE: TODO: 6. slerp 결과를 확인한다
  }
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
