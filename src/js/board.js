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

export default class Board {
  constructor() {
    this.customCamera = new CustomCamera();
    this.customRenderer = new CustomRenderer(CANVAS);
    this.customScene = new CustomScene();
    this.cube = new Cube();
    this.pickHelper = new PickHelper(
      this.customScene.scene,
      this.customCamera.camera,
    );

    this.init();
  }

  init() {
    this.customScene.addObject(this.cube.core);
    this.initEventListners();
    this.cube.core.add(axesHelper(4));
    this.animate(this.customCamera, this.customRenderer);
  }

  initEventListners() {
    this.initMouseEvents();
    this.initMobileEvents();
  }

  initMouseEvents() {
    window.addEventListener('mousedown', e => this.handleMouseDown(e));
    window.addEventListener('mousemove', e => this.handleMouseMove(e));
    window.addEventListener('mouseout', e => this.handleMouseUp(e));
    window.addEventListener('mouseleave', e => this.handleMouseUp(e));
    window.addEventListener('mouseup', e => this.handleMouseUp(e));
  }

  initMobileEvents() {
    window.addEventListener('touchstart', e => this.handleMouseDown(e), {
      passive: false,
    });
    window.addEventListener('touchmove', e => this.handleMouseMove(e));
    window.addEventListener('touchend', e => this.handleMouseUp(e));
  }

  handleMouseDown(event) {
    this.initUserGesture(event);
    this.customScene.addObject(Board.createObjectScene(this.cube.core));
  }

  handleMouseMove(event) {
    this.followUserGesture(event);
  }

  handleMouseUp(event) {
    if (this.alreadyClear()) return;
    this.rotateToClosest(event);
    this.clearUserGesture();
  }

  initUserGesture(event) {
    event.preventDefault(); // 스크롤 이벤트 방지

    this.pickHelper.saveCurrentPosition(event, this.customRenderer.canvas);
    this.cube.selectedMesh = this.pickHelper.calculateClosestSticker(
      this.customScene.scene,
      this.customCamera.camera,
    );
    this.cube.saveCurrentStatus();
  }

  static createObjectScene(object) {
    const objectScene = new THREE.Object3D();
    objectScene.applyQuaternion(object.quaternion);
    objectScene.name = 'objectScene';

    return objectScene;
  }

  followUserGesture(event) {
    const gesture = (event.touches && event.touches[0]) || event;
    this.pickHelper.saveCurrentPosition(gesture, this.customRenderer.canvas);
    if (!this.pickHelper.motioning) return;
    if (
      this.cube.selectedMesh &&
      isEmpty(this.cube.rotatingLayer) &&
      this.cube.mouseDirection
    ) {
      const cubic = this.cube.selectedMesh.parent;
      const objectScene = this.customScene.scene.getObjectByName('objectScene');
      this.cube.rotatingLayer = this.cube.calculateRotatingLayer(cubic);
      Cube.addCubicsToObjectScene(this.cube.rotatingLayer, objectScene);
    }

    this.cube.rotateBody(
      this.pickHelper.pickStartedPosition,
      this.pickHelper.pickPosition,
    );
  }

  alreadyClear() {
    return !this.pickHelper.motioning;
  }

  rotateToClosest() {
    const clickStart = { ...this.pickHelper.pickStartedPosition };
    const clickEnd = { ...this.pickHelper.pickPosition };
    if (!this.cube.selectedMesh) {
      this.cube.slerp(clickStart, clickEnd); // 큐브 몸통 전체 회전
    } else {
      const objectScene = this.customScene.scene.getObjectByName('objectScene');
      if (!objectScene) {
        alert('no object scene');
        return;
      }
      if (!this.cube.rotatingAxesChar) return;
      this.cube.slerpCubicsByScene(this.cube.mouseDelta, objectScene); // 특정 층만 회전
    }
  }

  clearUserGesture() {
    this.pickHelper.clearPickPosition();
    this.cube.resetMouseDirection();
  }

  animate(camera, renderer) {
    const time = requestAnimationFrame(() => this.animate(camera, renderer));
    this.render(camera, renderer, time);
    TWEEN.update();
  }

  render(camera, renderer, time) {
    time *= 0.005;
    if (renderer.resizeRenderToDisplaySize()) {
      camera.updateAspect(renderer.rendererAspect);
    }
    this.pickHelper.pick(this.customScene.scene, camera.camera, time);
    renderer.render(this.customScene.scene, camera.camera);
  }
}
