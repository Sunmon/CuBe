export default class EventManager {
  constructor($target) {
    this.$target = $target;
    this.enables = {
      mousedown: true,
      mousemove: true,
      mouseup: true,
      mouseleave: true,
      mouseout: true,
      touchstart: true,
      touchmove: true,
      touchend: true,
    };
  }

  // 활성화된 이벤트 타입만 리스너을 동작시킨다
  addEventListener(type, listener) {
    this.$target.addEventListener(type, e => {
      if (!this.isEnable(type)) return;
      listener(e);
    });
  }

  enableClick(flag) {
    this.setEnable('mousedown', flag);
    this.setEnable('touchstart', flag);
  }

  isEnable(type) {
    return this.enables[type];
  }

  setEnable(type, flag) {
    this.enables[type] = flag;
  }
}
