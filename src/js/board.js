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

const initMouseEvents = function () {
  window.addEventListener('mousemove', e => {
    pickHelper.setPickPosition(e, customRenderer.getCanvas());
    if (pickHelper.motioning) {
      cube.rotateBody(pickHelper.pickStartedPosition, pickHelper.pickPosition);
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
    cube.setLastCubeQuaternion(cube.core.center.matrix);
  });
  window.addEventListener('mouseup', () => {
    pickHelper.clearPickPosition();
    cube.setLastCubeQuaternion(cube.core.center.matrix);
    cube.toggleRotateDirection();
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
let tempBox;

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
  slerpTest(tempBox, time);

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

// slerp 예제코드
// const startQuaternion = new THREE.Quaternion().set(0, 0, 0, 1).normalize();
// const endQuaternion = new THREE.Quaternion().set(1, 1, 1, 1).normalize();

// TODO: slerp test
const slerpTest = function (box, time) {
  // const endQuaternion = new THREE.Quaternion();
  // endQuaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI);
  // const qm = new THREE.Quaternion();
  const startQuaternion = new THREE.Quaternion()
    .copy(box.quaternion)
    .normalize();
  // const endQuaternion = new THREE.Quaternion().set(3, 2, 1, 1).normalize();
  const endQuaternion = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
    .normalize();

  // // slerp 예제코드
  // const startQuaternion = new THREE.Quaternion().set(0, 0, 0, 1).normalize();
  // const endQuaternion = new THREE.Quaternion().set(1, 1, 1, 1).normalize();
  let t = time;

  t = (t + 0.01) % 1;
  // console.log(t);
  THREE.Quaternion.slerp(startQuaternion, endQuaternion, box.quaternion, t);
  // box.quaternion.slerp(endQuaternion, t);

  // box.quaternion.slerp
  // THREE.Quaternion.slerp(cube.core.center.quaternion, endQuaternion, qm, 0.5);
  // cube.core.center.quaternion = qm;
  // cube.core.center.quaternion.slerp(endQuaternion, 0.5);
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  customScene.add(cube.core.center);
  initEventListners();

  tempBox = CustomMesh.temp();
  const tempPlane = Cube.createPlane(0x987653);
  customScene.add(tempBox);
  tempPlane.rotateX(Math.PI / 8);
  cube.core.center.add(tempPlane);
  animate(customCamera, customRenderer);
}
