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
const THRESHOLD_ANGLE = Math.PI / 6;
const THRESHOLD_DIST = 50;
/* CLOCKWISE[from][to] : from축 -> to 축 이동이 시계방향인지 여부 저장 */
const CLOCKWISE = [
  /* x     y     z  */
  [true, false, true] /* x */,
  [true, true, false] /* y */,
  [false, true, true] /* z */,
];

export {
  CANVAS,
  CUBE_SIZE,
  CUBIC_SIZE,
  DEFAULT_COLORS,
  CUBIC_PER_ROW,
  WEIGHT,
  VELOCITY,
  THRESHOLD_ANGLE,
  THRESHOLD_DIST,
  CLOCKWISE,
};
