import { TransformControls } from 'https://unpkg.com/three/examples/jsm/controls/TransformControls.js';
import * as THREE from '../../lib/three.module.js';
import Cube from './cube.js';
import CustomCamera from './camera.js';
import CustomScene from './scene.js';
import CustomRenderer from './renderer.js';
import CustomMesh from './mesh.js';
import { PickHelper } from './motion.js';

const customCamera = CustomCamera.init();
const customRenderer = CustomRenderer.init();
const customScene = CustomScene.init();
const cube = Cube.init();
const pickHelper = PickHelper.init();

let lastCubeQuaternion = new THREE.Quaternion();

const testRotationX = function (start, current) {
  const direction = new THREE.Vector3(
    start.x - current.x,
    start.y - current.y,
    0,
  ).normalize();
  const ratio = Math.sign(direction.x);

  // .NOTE: 방향 작은걸로할때 아래 함수 쓰면 되겠따
  // cube.core.center.setRotationFromAxisAngle(direction, 0.1);

  const quat = new THREE.Quaternion();
  quat.setFromAxisAngle(direction, ratio * (start.x - current.x));
  cube.core.center.setRotationFromQuaternion(
    quat.multiply(lastCubeQuaternion).normalize(),
  );
};

const initMouseEvents = function () {
  window.addEventListener('mousemove', e => {
    pickHelper.setPickPosition(e, customRenderer.getCanvas());
    if (pickHelper.motioning) {
      testRotationX(pickHelper.pickStartedPosition, pickHelper.pickPosition);
    }
  });
  window.addEventListener(
    'mouseout',
    pickHelper.clearPickPosition.bind(pickHelper),
  );
  window.addEventListener(
    'mouseleave',
    pickHelper.clearPickPosition.bind(pickHelper),
  );
  window.addEventListener('mousedown', e => {
    pickHelper.setPickPosition(e, customRenderer.getCanvas());
    lastCubeQuaternion.setFromRotationMatrix(cube.core.center.matrix);
  });
  window.addEventListener('mouseup', () => {
    pickHelper.clearPickPosition();
    lastCubeQuaternion.setFromRotationMatrix(cube.core.center.matrix);
  });
};

const initMobileEvents = function () {
  window.addEventListener(
    'touchstart',
    event => {
      event.preventDefault(); // 스크롤 이벤트 방지
      pickHelper.setPickPosition(event.touches[0], customRenderer.getCanvas());
    },
    { passive: false },
  );

  window.addEventListener('touchmove', event => {
    pickHelper.setPickPosition(event.touches[0], customRenderer.getCanvas());
  });

  window.addEventListener(
    'touchend',
    pickHelper.clearPickPosition.bind(pickHelper),
  );
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
  // TODO: 0,0,0을 중심으로 회전하도록 수정
  // core.center.rotation.z = time;
  // core.yAxis.rotation.y = time;
  renderer.render(customScene, camera.getCamera());
};

const animate = function (camera, renderer) {
  const time = requestAnimationFrame(() => animate(camera, renderer));
  render(camera, renderer, time);
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

  const tempBox = CustomMesh.temp();
  const tempPlane = Cube.createPlane(0x987653);
  customScene.add(tempBox);
  tempPlane.rotateX(Math.PI / 8);
  cube.core.center.add(tempPlane);
  animate(customCamera, customRenderer);
}
