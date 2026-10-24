/* =========================================================
   광고 자리 (구글 애드센스)

   지금은 꺼져 있습니다. 광고를 넣을 준비가 되면
   assets/js/config.js 에서
     ADSENSE_CLIENT: 'ca-pub-0000000000000000'  ← 내 게시자 ID
     AD_ENABLED: true
   로 바꾸고, 각 HTML 의 <div class="ad-slot"> 에
     data-ad-slot="1234567890"  ← 애드센스에서 만든 광고 단위 ID
   를 적어 주면 그 자리에 광고가 들어갑니다.

   광고 자리는 빙고판과 저장 버튼 아래에만 있어서,
   꺼져 있을 때는 높이 0 으로 아무것도 차지하지 않습니다.
   ========================================================= */
var Ads = (function () {

  function enabled() {
    return !!(CONFIG.AD_ENABLED && CONFIG.ADSENSE_CLIENT && CONFIG.ADSENSE_CLIENT.trim());
  }

  function loadScript() {
    if (document.getElementById('adsense-sdk')) { return; }
    var script = document.createElement('script');
    script.id = 'adsense-sdk';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
                 encodeURIComponent(CONFIG.ADSENSE_CLIENT.trim());
    document.head.appendChild(script);
  }

  function fill(slot) {
    var slotId = slot.dataset.adSlot;
    if (!slotId) { return; }          // 광고 단위 ID가 없으면 그냥 비워 둡니다

    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', CONFIG.ADSENSE_CLIENT.trim());
    ins.setAttribute('data-ad-slot', slotId);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    slot.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 광고가 안 떠도 화면은 그대로 동작해야 합니다.
    }
  }

  function init() {
    if (!enabled()) { return; }
    loadScript();
    var slots = document.querySelectorAll('.ad-slot');
    for (var i = 0; i < slots.length; i++) { fill(slots[i]); }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { enabled: enabled };
})();
