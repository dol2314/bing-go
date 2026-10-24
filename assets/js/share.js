/* =========================================================
   공유 기능 (카카오톡 공유 + 링크 복사)

   카카오 키는 assets/js/config.js 의 KAKAO_JS_KEY 에 넣습니다.
   키가 비어 있으면 카카오 버튼은 화면에 나타나지 않습니다.
   키 발급 방법은 README 의 "카카오 공유 설정"을 보세요.
   ========================================================= */
var Share = (function () {

  // 카카오 SDK (버전을 올리려면 주소와 아래 무결성 해시를 함께 바꿔야 합니다)
  var SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js';
  var SDK_INTEGRITY = 'sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm';

  var loading = null;

  /* ---------- 카카오톡 ---------- */

  // 키가 있을 때만 카카오 공유를 쓸 수 있습니다.
  function kakaoAvailable() {
    return !!(CONFIG.KAKAO_JS_KEY && CONFIG.KAKAO_JS_KEY.trim());
  }

  function loadSdk() {
    if (window.Kakao) { return Promise.resolve(); }
    if (loading) { return loading; }

    loading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = SDK_URL;
      script.integrity = SDK_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = function () { reject(new Error('카카오 SDK를 불러오지 못했습니다.')); };
      document.head.appendChild(script);
    });
    return loading;
  }

  function initKakao() {
    return loadSdk().then(function () {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(CONFIG.KAKAO_JS_KEY.trim());
      }
    });
  }

  /**
   * 카카오톡으로 링크 보내기
   * opts = { title, description, link }
   */
  function sendKakao(opts) {
    if (!kakaoAvailable()) {
      return Promise.reject(new Error('카카오 키가 설정되지 않았습니다.'));
    }

    return initKakao().then(function () {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: opts.title,
          description: opts.description,
          imageUrl: CONFIG.ogImageUrl(),
          link: { mobileWebUrl: opts.link, webUrl: opts.link }
        },
        buttons: [
          {
            title: '빙고 해보기',
            link: { mobileWebUrl: opts.link, webUrl: opts.link }
          }
        ]
      });
    });
  }

  /* ---------- 링크 복사 ---------- */

  // 복사에 성공하면 true 를 돌려줍니다.
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
        .then(function () { return true; })
        .catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  // 구형 브라우저 / 카톡 인앱 브라우저용
  function fallbackCopy(text) {
    var temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();

    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }

    document.body.removeChild(temp);
    return ok;
  }

  return {
    kakaoAvailable: kakaoAvailable,
    sendKakao: sendKakao,
    copyText: copyText
  };
})();
