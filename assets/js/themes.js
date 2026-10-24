/* =========================================================
   색상 테마
   여기 색상 값만 바꾸면 "화면"과 "결과 이미지" 색이 함께 바뀝니다.
   테마를 추가하고 싶으면 아래 THEMES 안에 한 덩어리를 복사해서
   이름과 색만 바꾸면 됩니다.
   ========================================================= */
var Themes = (function () {

  var THEMES = {
    peach: {
      label: '피치',
      bg: '#FFF5F2',        // 바탕색
      board: '#FFFFFF',     // 빙고판 카드 색
      cell: '#FFF0EB',      // 안 누른 칸 색
      cellText: '#3A2E2B',  // 안 누른 칸 글자색
      accent: '#FF5C5C',    // 누른 칸 / 강조색
      accentText: '#FFFFFF',// 누른 칸 글자색
      soft: '#FFD9D1',      // 연한 강조색 (FREE 칸, 배지)
      title: '#2B2320',     // 제목 글자색
      muted: '#A3938D',     // 흐린 글자색
      line: '#FFE6DF'       // 테두리 선 색
    },
    mint: {
      label: '민트',
      bg: '#F1FBF7', board: '#FFFFFF', cell: '#E8F7F0', cellText: '#1F3B33',
      accent: '#15B57E', accentText: '#FFFFFF', soft: '#C7EEDD',
      title: '#17322B', muted: '#86A79B', line: '#D9F0E6'
    },
    sky: {
      label: '하늘',
      bg: '#F1F7FF', board: '#FFFFFF', cell: '#E9F1FD', cellText: '#1E2E45',
      accent: '#3B82F6', accentText: '#FFFFFF', soft: '#CBDFFB',
      title: '#17263D', muted: '#8C9CB5', line: '#DCE8FA'
    },
    grape: {
      label: '포도',
      bg: '#F8F3FF', board: '#FFFFFF', cell: '#F0E9FC', cellText: '#2E2340',
      accent: '#8B5CF6', accentText: '#FFFFFF', soft: '#DDCEFB',
      title: '#271C3A', muted: '#9D90B5', line: '#E8DEFB'
    },
    night: {
      label: '다크',
      bg: '#15161A', board: '#1E2026', cell: '#272A32', cellText: '#E8E9ED',
      accent: '#FFD166', accentText: '#1A1A1A', soft: '#4A422C',
      title: '#FFFFFF', muted: '#8A8D96', line: '#32353E'
    }
  };

  // 'cellText' → '--c-cell-text' 로 바꿔서 CSS 변수로 넣어줍니다.
  function toCssVar(key) {
    return '--c-' + key.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); });
  }

  function get(name) {
    return THEMES[name] || THEMES.peach;
  }

  function apply(name) {
    var theme = get(name);
    var root = document.documentElement;
    for (var key in theme) {
      if (key === 'label') continue;
      root.style.setProperty(toCssVar(key), theme[key]);
    }
    return theme;
  }

  function list() {
    return Object.keys(THEMES).map(function (key) {
      return { id: key, label: THEMES[key].label, theme: THEMES[key] };
    });
  }

  return { get: get, apply: apply, list: list, THEMES: THEMES };
})();
