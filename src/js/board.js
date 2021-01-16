import * as THREE from '../../lib/three.module.js';
import gameCube from './cube.js';
import CustomCamera from './camera.js';
import gameScene from './scene.js';
import CustomRenderer from './renderer.js';
import { CUBE_SIZE } from '../common/constants.js';

const camera = CustomCamera.init();
const renderer = CustomRenderer.init();
const scene = gameScene.init();

// 회전값을 업데이트할 객체들
// const objects = [];
// 회전을 관장하는 객체.

const core = new THREE.Object3D(); // 가운데 코어
const coreY = gameCube.createLine(
  // Y축으로 회전
  [0, -CUBE_SIZE / 2, 0],
  [0, CUBE_SIZE / 2, 0],
); // z축
const coreZ = gameCube.createLine(
  // Z축으로 회전
  [0, 0, -CUBE_SIZE / 2],
  [0, 0, CUBE_SIZE / 2],
); // z축
const xyScene = new THREE.Object3D(); // xy평면
const xzScene = new THREE.Object3D(); // xz평면

const render = function (camera, renderer, time) {
  time *= 0.005;
  if (renderer.resizeRenderToDisplaySize()) {
    // TODO: 아래 두 함수 카메라 안 함수로 묶고, cameara init 리턴 수정
    camera.aspect = renderer.getRendererAspect();
    camera.updateProjectionMatrix();
  }
  // TODO: 0,0,0을 중심으로 회전하도록 수정
  coreZ.rotation.z = time;
  coreY.rotation.y = time;
  renderer.render(scene, camera);
};

const animate = function (camera, renderer) {
  const time = requestAnimationFrame(() => animate(camera, renderer));
  render(camera, renderer, time);
};

// eslint-disable-next-line import/prefer-default-export
export function init() {
  renderer.render(scene, camera);

  // TODO: line으로부터방향 알아내서 testPlane에 법선으로 적용하기
  const plane = gameCube.createPlane(CUBE_SIZE, CUBE_SIZE, 0x4837ef);
  plane.translateY(CUBE_SIZE / 2);
  plane.rotateX(-Math.PI / 2);

  // 중심 축 추가
  scene.add(core);
  core.add(coreY);
  core.add(coreZ);
  coreZ.add(coreY);
  coreY.add(plane);

  coreY.material.color.set(0x7aeecc);

  animate(camera, renderer);
}
