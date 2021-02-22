const CANVAS = document.querySelector('#canvas');
const CUBE_SIZE = 3;
const CUBIC_SIZE = CUBE_SIZE / 3;
const CUBIC_PER_ROW = 3;
const DEFAULT_COLORS = [
  0xff6663,
  0xfeb144,
  0xfdfd97,
  0x9ee09e,
  0x9ec1cf,
  0xcc99c9,
]; // 나중에 색깔 구하는걸로 하기
const VELOCITY = 0.1;
const WEIGHT = 10; // 마우스 이동 가중치
export {
  CANVAS,
  CUBE_SIZE,
  CUBIC_SIZE,
  DEFAULT_COLORS,
  CUBIC_PER_ROW,
  WEIGHT,
  VELOCITY,
};
