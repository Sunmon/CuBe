# CuBe

<center><img src = 'https://user-images.githubusercontent.com/26290571/109127463-ce4c4400-7791-11eb-9a5c-38f657c8a261.png' width = 50% ></center>

<center> 큐브를 맞추는 사이트 </center>
<center>  <a href= https://sunmon.github.io/CuBe/> 🎮 플레이 링크 </a> </center>

## 🎲 주요 기능

**큐브 자유롭게 회전**

_v.1.0.0_
큐브를 회전할 수 있습니다.

큐브 밖을 드래그하면 큐브 전체를 회전합니다.

큐브 안을 선택하여 드래그하면 해당 면만 회전합니다.

모바일도 지원합니다.

## 🎲 지원 환경

아래 환경에서 테스트 완료

- Windows 10
- Edge 88.0.705.74
- Chrome 88.0.4324
- 삼성 갤럭시 기본 모바일 브라우저

## 🎲 개발 기간

2020.01.14 ~ 2020.02.25 (버전 1.0)

2020.03. ~ ()

## 🎲 구현 요구사항

- 함수는 한번에 한 가지 기능만 한다
- git commit을 의미있게 기록한다
- 상수를 활용한다
- 비즈니스 로직과 UI 로직을 분리한다
- 예외케이스를 고려한다
- 주석에는 왜? 무엇을? 을 작성한다

### 🎲 DONE

- [x] 개발환경 설정
  - [x] eslint 설정
  - [x] prettier 설정
- [x] 브라우저 크기에 맞춰 큐브 크기 조절
- [x] 큐브 회전하기
  - [x] 큐브 몸통 회전하기
  - [x] 큐브 한 면만 회전하기
- [x] 부드러운 회전 애니메이션
- [x] 마우스로 피킹한 물체 표시하기
- [x] 카툰렌더링
- [x] 깃허브 호스팅

### 🎲 TODO

- [ ] three.js 에서 개발자 도구 열면 보이게하는기능? 글꼴 sub-zero
- [ ] 버전이 낮은 브라우저에서도 지원하기 (웹팩, 바벨)

_버전 2.0.0_

- [ ] 큐브 정답 맞추기
  - [ ] 큐브 사진 업로드
  - [ ] 큐브 색깔 인식
  - [ ] 해답 전체재생
  - [ ] 해답 단계별로 재생
- [ ] 사용법 튜토리얼 안내
- [ ] 큐브 텍스쳐 테마 선택 기능

## 🎲 사용 오픈소스

- Three.js (<https://threejs.org/>)
- Tween.js (<https://github.com/tweenjs/tween.js/>)

```
           ______     __  __     ______     ______
          /\  ___\   /\ \/\ \   /\  == \   /\  ___\
          \ \ \____  \ \ \_\ \  \ \  __<   \ \  __\
           \ \_____\  \ \_____\  \ \_____\  \ \_____\
            \/_____/   \/_____/   \/_____/   \/_____/

```

## 빌드 방법

1. 다음 항목들을 주석처리한다
   - index.html : `<script type="module" src="/src/index.js"></script>`
   - index.html : `<link rel="stylesheet" href="/src/css/common.css" />`
2. 다음 항목을 주석 해제한다.
   - /src/index.js: `import './css/common.css';`
3. npm run build
4. /dist/ 폴더 안에 번들링 결과물이 나온다
5. 주석처리를 원상복구한다.

( 추후 gulp를 이용하여 빌드 과정이 변경될 수 있음 )

## 폴더 구조

- assets: 로고, 텍스쳐 등 저장
- dist: 번들링 결과물 저장 (gitignore)
- lib: three.js, tween.js 등 외부 라이브러리
- public: 서버에서 사용하기 위한 정적 파일 저장
- src: 소스 파일 저장
- /index.html : 루트 폴더의 index.html은 github page 호스팅용 파일
