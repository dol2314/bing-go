/* =========================================================
   사이트 전체 설정
   여기 값만 바꾸면 사이트 주소, 카카오 키, 광고가 한 번에 바뀝니다.

   ★ 배포하고 나서 꼭 할 일
     1) 아래 SITE_ORIGIN 을 진짜 주소로 바꾸기
     2) index.html / create.html / play.html 맨 위 og:url, og:image 주소도 같이 바꾸기
        (카카오톡 미리보기는 자바스크립트를 읽지 못해서 직접 적어줘야 합니다)
   ========================================================= */
var CONFIG = {
  // 배포 주소. 끝에 / 를 붙이지 마세요.
  SITE_ORIGIN: 'https://bing-go-iota.vercel.app',

  // 사이트 이름 (제목, 공유 미리보기, 결과 이미지에 사용)
  SITE_NAME: '나만의 공감 빙고',

  // 카카오 JavaScript 키 (README 의 "카카오 공유 설정" 참고)
  // 비워두면 카카오톡 공유 버튼이 자동으로 숨겨집니다.
  KAKAO_JS_KEY: '237dc30bd48a24ba9bca6f89abb2b81d',

  // 구글 애드센스 게시자 ID (예: 'ca-pub-0000000000000000')
  ADSENSE_CLIENT: '',

  // 광고를 켤 준비가 되면 true 로 바꾸세요.
  AD_ENABLED: false
};

// 결과 이미지 아래에 작게 들어갈 주소 (https:// 를 뺀 형태)
CONFIG.siteHost = function () {
  return CONFIG.SITE_ORIGIN.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

// 카카오톡 미리보기에 쓰일 이미지의 전체 주소
CONFIG.ogImageUrl = function () {
  return CONFIG.SITE_ORIGIN + '/assets/img/og-default.png';
};
