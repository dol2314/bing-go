/* =========================================================
   빙고 데이터 ↔ 공유 링크 변환
   서버가 없으므로 빙고 내용을 통째로 압축해서 주소(#뒤)에 담습니다.
   - 압축: lz-string (vendor/lz-string.min.js)
   - 주소에 담는 위치는 ? 가 아니라 # 입니다.
     (서버 기록에 남지 않고, 길이 제한에서도 자유롭습니다)
   ========================================================= */
var BingoCodec = (function () {

  var VERSION = 1;
  var MAX_TITLE = 40;
  var MAX_CELL = 60;

  // 테마는 이름 대신 번호로 저장해서 주소를 짧게 만듭니다.
  function themeIds() {
    return Themes.list().map(function (t) { return t.id; });
  }

  /* ---------- 만들기 → 링크 ---------- */

  // data = { title, size, theme, freeCenter, cells[] }  (cells 는 FREE 칸 제외)
  function encode(data) {
    var ids = themeIds();
    var themeIndex = ids.indexOf(data.theme);

    var payload = [
      VERSION,
      String(data.title || '').slice(0, MAX_TITLE),
      data.size,
      data.freeCenter ? 1 : 0,
      themeIndex < 0 ? 0 : themeIndex,
      data.cells.map(function (c) { return String(c || '').slice(0, MAX_CELL); })
    ];

    return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  }

  /* ---------- 링크 → 플레이 데이터 ---------- */

  // 잘못된 주소가 들어와도 앱이 멈추지 않도록 전부 검사합니다.
  function decode(code) {
    if (!code) { return null; }

    var json;
    try {
      json = LZString.decompressFromEncodedURIComponent(code);
    } catch (e) {
      return null;
    }
    if (!json) { return null; }

    var payload;
    try {
      payload = JSON.parse(json);
    } catch (e) {
      return null;
    }
    if (!Array.isArray(payload) || payload[0] !== VERSION) { return null; }

    var size = Number(payload[2]);
    if (size !== 3 && size !== 4 && size !== 5) { return null; }

    var freeCenter = !!payload[3] && size % 2 === 1;
    var needed = size * size - (freeCenter ? 1 : 0);

    var cells = Array.isArray(payload[5]) ? payload[5] : [];
    var safeCells = [];
    for (var i = 0; i < needed; i++) {
      safeCells.push(String(cells[i] == null ? '' : cells[i]).slice(0, MAX_CELL));
    }

    var ids = themeIds();
    var themeId = ids[Number(payload[4])] || ids[0];

    return {
      id: 'shared',
      title: String(payload[1] || '공감 빙고').slice(0, MAX_TITLE),
      size: size,
      theme: themeId,
      freeCenter: freeCenter,
      cells: safeCells,
      results: null          // 공유 빙고는 기본 결과 문구를 씁니다
    };
  }

  /* ---------- 공유 주소 만들기 ---------- */

  function buildShareUrl(data) {
    var code = encode(data);
    var base = new URL('play.html', location.href).href;
    return base + '#' + code;
  }

  return {
    encode: encode,
    decode: decode,
    buildShareUrl: buildShareUrl,
    MAX_TITLE: MAX_TITLE,
    MAX_CELL: MAX_CELL
  };
})();
