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

const tempDest = new THREE.Quaternion();

let slerpA = new THREE.Quaternion();
let slerpB = new THREE.Quaternion();
let slerpEnable = false;

const slerpTest2 = function (origin, dest, time) {
  let t = time;
  t = (t + 0.01) % 1;
  console.log(`t, time : ${t}, ${time % 1}`);
  origin.slerp(dest, t);
  if (origin.angleTo(dest) === 0) {
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
    // cube.setLastCubeQuaternion(cube.core.center.matrix);
  });
  window.addEventListener('mouseup', () => {
    pickHelper.clearPickPosition();
    // TODO: slerp
    const origin = cube.lastCubeQuaternion;
    const cur = cube.core.center.quaternion;
    // FIXME: diff 로 구하는 로직을 다시 생각해봐야할듯
    const diff = origin.clone().multiply(cur.clone().invert());

    // TODO: 큐브 현재 회전방향으로 회전 쿼터니언 알아내기
    const { rotateDirection } = cube;

    // 가까운 곳 알아내기
    const dir = getClosestDirection(
      diff,
      origin,
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        Math.PI / 2,
      ),
    );
    const dest = dir.equals(origin) ? origin : origin.clone().multiply(dir);

    slerpA = cur;
    slerpB = dest;
    slerpEnable = true;

    // 큐브 마지막 상태 저장하기
    cube.setLastCubeQuaternion(dest);
    cube.resetRotateDirection();
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
    slerpTest2(slerpA, slerpB, time);
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

// TODO: 혹은 cur, origin 비교해서 PI/2 넘으면 더하고, 아니면 원래대로 돌릴수도 있지
// const over45 = function(origin, cur) {
//
// }

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

// TODO: slerp test
const slerpTest = function (box, time) {
  const startQuaternion = new THREE.Quaternion()
    .copy(box.quaternion)
    .normalize();
  const endQuaternion = new THREE.Quaternion()
    .setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
    .normalize();

  let t = time;
  t = (t + 0.01) % 1;
  THREE.Quaternion.slerp(startQuaternion, endQuaternion, box.quaternion, t);
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
