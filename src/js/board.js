import * as TWEEN from '../../lib/tween.esm.js';
import Cube from './cube.js';
import CustomCamera from './camera.js';
import CustomScene from './scene.js';
import CustomRenderer from './renderer.js';
import CustomMesh from './mesh.js';
import PickHelper from './pickHelper.js';
import { CANVAS } from '../common/constants.js';
import Utils from '../common/utils.js';
import EventManager from './eventManager.js';

export default class Board {
  constructor() {
    this.eventManager = new EventManager(CANVAS);
    this.customCamera = new CustomCamera();
    this.customRenderer = new CustomRenderer(CANVAS);
    this.customScene = new CustomScene();
    this.cube = new Cube(this.eventManager);
    this.pickHelper = new PickHelper(
      this.customScene.scene,
      this.customCamera.camera,
    );

    this.init();
  }

  init() {
    this.customScene.addObject(this.cube.core);
    this.initEventListners();
    this.animate(this.customCamera, this.customRenderer);
  }

  initEventListners() {
    this.bindEvents();
    this.initMouseEvents();
    this.initMobileEvents();
  }

  bindEvents() {
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  initMouseEvents() {
    this.eventManager.addEventListener('mousedown', this.handleMouseDown);
    this.eventManager.addEventListener('mousemove', this.handleMouseMove);
    this.eventManager.addEventListener('mouseout', this.handleMouseUp);
    this.eventManager.addEventListener('mouseleave', this.handleMouseUp);
    this.eventManager.addEventListener('mouseup', this.handleMouseUp);
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
    this.customScene.addObject(CustomMesh.createObjectScene(this.cube.core));
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

  followUserGesture(event) {
    this.saveCurrentPosition(event);
    if (!this.pickHelper.motioning) return;

    if (this.firstMove()) {
      this.cube.initRotatingLayer();
    }
    this.cube.rotateBody(
      this.pickHelper.pickStartedPosition,
      this.pickHelper.pickPosition,
    );
  }

  saveCurrentPosition(event) {
    const gesture = (event.touches && event.touches[0]) || event;
    this.pickHelper.saveCurrentPosition(gesture, this.customRenderer.canvas);
  }

  firstMove() {
    return (
      this.cube.selectedMesh &&
      Utils.isEmpty(this.cube.rotatingLayer) &&
      this.cube.mouseDirection
    );
  }

  alreadyClear() {
    return !this.pickHelper.motioning;
  }

  rotateToClosest() {
    const clickStart = { ...this.pickHelper.pickStartedPosition };
    if (!this.cube.selectedMesh) {
      this.cube.slerp(clickStart); // 큐브 몸통 전체 회전
    } else {
      const objectScene = this.customScene.scene.getObjectByName('objectScene');
      if (!objectScene || !this.cube.rotatingAxesChar) return;
      this.cube.slerpCubicsByScene(objectScene); // 특정 층만 회전
    }
  }

  clearUserGesture() {
    this.pickHelper.clearPickPosition();
    this.cube.resetMouseDirection();
    this.eventManager.setEnable('mousedown', false); // 회전중에 이벤트를 입력받아 회전이 꼬이는것을 방지
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
