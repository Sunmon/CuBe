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

const tempDest = new THREE.Quaternion();
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
    const origin = cube.lastCubeQuaternion.clone();
    const cur = cube.core.center.quaternion;
    // TODO: invert말고 90도 돌린거 찾아내기
    const invert = origin.clone().conjugate(); // FIXME: invert가 이상하다. 180도 돌리는게 이상함
    // const dest = getCloserQuaternion(cur, origin, invert);
    // 일단 아래 식이 동작하는지 확인후 dest 위 코드 쓰기
    if (origin.angleTo(cur) > Math.PI / 4) {
      cur.copy(invert);
    } else {
      cur.copy(origin);
    }

    // 새로운 좌표 저장
    // cube.setLastCubeQuaternion(cube.core.center.quaternion);
    cube.setLastCubeQuaternion(cur);
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
  // TODO: 0,0,0을 중심으로 회전하도록 수정
  // slerpTest(tempBox, time);

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

const slerpToCloser = function (start, destination1, destination2, t) {
  t = (t + 1) % 1;
  const dest = getCloserQuaternion(start, destination1, destination2);
  start.quaternion.slerp(dest, t);
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

  // HACK: v 설정 안해주면 쿼터니온이 (0,0,0,0)이 되어버리기때문에
  // invert를 구할 수 없다. (invert 식을 바꾸면 될수도있음)
  const v = new THREE.Vector3(0, 1, 0);
  cube.core.center.quaternion.setFromAxisAngle(v, Math.PI / 4);
  cube.setLastCubeQuaternion(cube.core.center.quaternion);
  animate(customCamera, customRenderer);
}
