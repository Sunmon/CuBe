import { WebGLRenderer } from 'three';

export default class CustomRenderer {
  constructor(canvas) {
    this.renderer = new WebGLRenderer({ canvas });
  }

  resizeRenderToDisplaySize() {
    const { canvas } = this;
    const { width, height } = this.calculateAdjustSize();
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }

    return needResize;
  }

  calculateAdjustSize() {
    const pixelRatio = window.devicePixelRatio;

    return {
      width: (this.canvas.clientWidth * pixelRatio) | 0, // round down
      height: (this.canvas.clientHeight * pixelRatio) | 0, // round down
    };
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  get rendererAspect() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  get canvas() {
    return this.renderer.domElement;
  }
}
