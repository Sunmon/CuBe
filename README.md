# CuBe

큐브를 맞춰주는 사이트

## 기능

### DONE

### TODO

- [ ] 마우스 클릭으로 큐브 회전하기
  - [ ] 큐브 몸통 통째로 회전하기
  - [ ] 평면 하나 가로로 회전
  - [ ] 평면 하나 오른쪽 위아래 회전
  - [ ] 평면 하나 왼쪽 위아래 회전
- [ ] 큐브 회전 각도 자동 맞추기
- [x] 선택한 객체 표시하기
  - [x] 컴퓨터 마우스로 호버링 표기
  - [x] 모바일 터치로 호버링시 표기

## 지원 환경

테스트 한 환경 -
윈도우10
Edge
Chrome 예정
S10 삼성 윈도우 예정

## 개발 기간

2020.01.14 ~

## 주안점

무슨 기능 - 무엇을 고려함
테스트 환경
어려웠던 점 - 해결 방안

- 다양한 환경에서 지원될 것 (explorer, 모바일, 크롬, 사파리, 파이어폭스)
- 세심함 (큐브가 어중간하게 회전되지 않고 각 맞춰서 회전하기, )
- 등등

- JEST는 서버랑 통신할때 사용하기
- UI 테스트 볼까? E2E Cypress

## 구현 요구사항

- 함수의 크기는 15줄을 넘지 않게
- git commit을 의미있게
- 상수를 활용
- 축약하지 않는다
- 비즈니스 로직과 UI 로직 분리
- 예외케이스 고려
- 주석은 꼭 필요한 경우만

## 사용 오픈소스

- Three.js (<https://threejs.org/>)

## 참고한 글

- 테스트: https://ui.toast.com/fe-guide/ko_TEST
- 함수형 프로그래밍: https://medium.com/@indongyoo/functional-es-%EB%B6%80%EB%A1%9D-%ED%81%B4%EB%9E%98%EC%8A%A4-%EC%97%86%EC%9D%B4-%EC%BD%94%EB%94%A9%ED%95%98%EA%B8%B0-f79d5781391b
- 함수 바인딩: https://ko.javascript.info/bind
- 테스트2: https://lumiloves.github.io/2018/08/21/my-first-frontend-test-code-experience
- clientX, Y : https://webdoli.tistory.com/53?category=959968
- raY: https://threejsfundamentals.org/threejs/lessons/kr/threejs-picking.html
- ray why client / window: https://stackoverflow.com/questions/30967954/three-js-look-at-mouse-working-but-why
