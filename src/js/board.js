import { TransformControls } from 'https://unpkg.com/three/examples/jsm/controls/TransformControls.js';
import * as THREE from '../../lib/three.module.js';
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

let slerpA = new THREE.Quaternion();
let slerpB = new THREE.Quaternion();
let slerpEnable = false;

const slerpCube = function (cur, dest, time) {
  let t = time;
  t = (t + 0.01) % 1;
  cur.slerp(dest, t);
  if (cur.angleTo(dest) === 0) {
    slerpEnable = false;
  }
};

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
    cube.core.center.quaternion.copy(cube.lastCubeQuaternion);
    slerpEnable = false;
  });
  window.addEventListener('mouseup', () => {
    const start = { ...pickHelper.pickStartedPosition };
    const end = { ...pickHelper.pickPosition };
    pickHelper.clearPickPosition();
    const origin = cube.lastCubeQuaternion;
    const cur = cube.core.center.quaternion;
    // 회전 방향 설정
    const dir = [
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
    ];
    const diff = new THREE.Quaternion();
    const [other, k] = cube.mouseDirection === 'x' ? ['y', 1] : ['x', 3];
    const [from, to] = start[other] > 0 ? [k, 2] : [3 - k, 1];
    const invert = start[cube.mouseDirection] < end[cube.mouseDirection];
    diff.setFromUnitVectors(dir[from], dir[to]);
    if (invert) diff.invert();
    // TODO: 애니메이션 Tween으로 넣기
    const dest = new THREE.Quaternion();
    dest.multiplyQuaternions(diff, origin);
    if (cur.angleTo(origin) < cur.angleTo(dest)) {
      dest.copy(origin);
    }
    slerpA = cur;
    slerpB = dest;
    slerpEnable = true;
    cube.setLastCubeQuaternion(dest);
    cube.resetMouseDirection();
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
  // TODO: 마우스를 놓으면 slerp 애니메이션 이뤄지도록
  if (slerpEnable) {
    slerpCube(slerpA, slerpB, time);
  }
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

const getCloserQuaternion = function (start, destination1, destination2) {
  const angle = (start, dest) => Math.abs(start.angleTo(dest));
  return angle(start, destination1) < angle(start, destination2)
    ? destination1
    : destination2;
};

const getClosestDirection = function (origin, ...direction) {
  console.log(direction);
  return direction.reduce((pre, cur) => {
    return origin.angleTo(pre) < origin.angleTo(cur) ? pre : cur;
  });
};

const slerpToCloser = function (start, destination1, destination2, t) {
  t = (t + 1) % 1;
  const dest = getCloserQuaternion(start, destination1, destination2);
  start.quaternion.slerp(dest, t);
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  customScene.add(cube.core.center);
  initEventListners();

  tempBox = CustomMesh.temp();
  // const tempPlane = Cube.createPlane(0x987653);
  customScene.add(tempBox);

  cube.core.center.add(axesHelper(1));

  animate(customCamera, customRenderer);
}
