export default class EventManager {
  constructor() {
    this.clickable = true;
  }

  setClickable(flag) {
    this.clickable = flag;
  }

  isClickable() {
    return this.clickable;
  }
}
