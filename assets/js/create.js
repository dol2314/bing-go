/* =========================================================
   만들기 화면 동작
   제목 / 칸 수 / FREE / 테마 / 칸 내용을 받아
   공유 링크(play.html#압축데이터)를 만들어 줍니다.
   ========================================================= */
(function () {

  // 칸이 작을수록 글자 수를 적게 제한합니다.
  // (기본 템플릿의 가장 긴 문장이 18자라, 5x5 는 18자까지 받습니다)
  var MAX_CHARS = { 3: 28, 4: 22, 5: 18 };

  var state = {
    title: '',
    size: 5,
    theme: 'peach',
    freeCenter: true,
    cells: [],        // FREE 칸을 뺀 입력값 목록
    warned: false     // 빈 칸이 있어도 그냥 만들지 물어봤는지
  };

  var el = {};

  /* ---------- 준비 ---------- */

  function init() {
    el.title = document.getElementById('titleInput');
    el.titleCount = document.getElementById('titleCount');
    el.sizeSeg = document.getElementById('sizeSeg');
    el.freeRow = document.getElementById('freeRow');
    el.freeCheck = document.getElementById('freeCheck');
    el.themeChips = document.getElementById('themeChips');
    el.board = document.getElementById('board');
    el.cellHint = document.getElementById('cellHint');
    el.makeBtn = document.getElementById('makeBtn');
    el.notice = document.getElementById('notice');
    el.shareBox = document.getElementById('shareBox');
    el.shareUrl = document.getElementById('shareUrl');
    el.copyBtn = document.getElementById('copyBtn');
    el.kakaoBtn = document.getElementById('kakaoBtn');
    el.tryBtn = document.getElementById('tryBtn');
    el.toast = document.getElementById('toast');

    prefillFromTemplate();
    renderThemeChips();
    renderSizeSeg();
    renderFreeRow();
    renderBoard();
    Themes.apply(state.theme);

    el.title.addEventListener('input', function () {
      state.title = el.title.value;
      el.titleCount.textContent = state.title.length;
      resetShare();
    });

    el.sizeSeg.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-size]');
      if (!btn) { return; }
      setSize(Number(btn.dataset.size));
    });

    el.freeCheck.addEventListener('change', function () {
      state.freeCenter = el.freeCheck.checked;
      resizeCells();
      renderBoard();
      resetShare();
    });

    el.makeBtn.addEventListener('click', onMake);
    el.copyBtn.addEventListener('click', onCopy);
    el.kakaoBtn.addEventListener('click', onKakao);
  }

  // create.html?t=univ 처럼 들어오면 템플릿 내용을 미리 채워 줍니다.
  function prefillFromTemplate() {
    var id = new URLSearchParams(location.search).get('t');
    if (!id) {
      state.cells = emptyCells();
      return;
    }
    var tpl = findTemplate(id);
    state.title = tpl.title;
    state.size = tpl.size;
    state.theme = tpl.theme || 'peach';
    state.freeCenter = !!tpl.freeCenter && tpl.size % 2 === 1;
    state.cells = tpl.cells.slice();

    el.title.value = state.title;
    el.titleCount.textContent = state.title.length;
    el.freeCheck.checked = state.freeCenter;
    resizeCells();
  }

  /* ---------- 입력 항목들 ---------- */

  function cellTotal() {
    return state.size * state.size - (state.freeCenter ? 1 : 0);
  }

  function emptyCells() {
    var out = [];
    for (var i = 0; i < cellTotal(); i++) { out.push(''); }
    return out;
  }

  // 칸 수가 바뀌어도 이미 적은 내용은 최대한 남겨 둡니다.
  function resizeCells() {
    var need = cellTotal();
    var max = MAX_CHARS[state.size];
    var out = [];
    for (var i = 0; i < need; i++) {
      out.push(String(state.cells[i] || '').slice(0, max));
    }
    state.cells = out;
  }

  function setSize(size) {
    state.size = size;
    if (size % 2 === 0) { state.freeCenter = false; }
    el.freeCheck.checked = state.freeCenter;
    resizeCells();
    renderSizeSeg();
    renderFreeRow();
    renderBoard();
    resetShare();
  }

  function renderSizeSeg() {
    var buttons = el.sizeSeg.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle('on', Number(buttons[i].dataset.size) === state.size);
    }
  }

  function renderFreeRow() {
    var allowed = state.size % 2 === 1;
    el.freeRow.classList.toggle('disabled', !allowed);
    el.freeCheck.disabled = !allowed;
  }

  function renderThemeChips() {
    el.themeChips.innerHTML = '';
    Themes.list().forEach(function (item) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (item.id === state.theme ? ' on' : '');
      chip.dataset.theme = item.id;

      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = item.theme.accent;
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode(item.label));

      chip.addEventListener('click', function () {
        state.theme = item.id;
        Themes.apply(item.id);
        renderThemeChips();
        resetShare();
      });

      el.themeChips.appendChild(chip);
    });
  }

  /* ---------- 칸 입력판 ---------- */

  function renderBoard() {
    var max = MAX_CHARS[state.size];
    var centerIdx = state.freeCenter ? BingoCore.centerIndex(state.size) : -1;
    var total = state.size * state.size;
    var slot = 0;   // FREE 칸을 뺀 순번

    el.cellHint.textContent = '(한 칸 최대 ' + max + '자)';
    el.board.className = 'board size-' + state.size;
    el.board.innerHTML = '';

    for (var i = 0; i < total; i++) {
      var cell = document.createElement('div');

      if (i === centerIdx) {
        cell.className = 'cell free';
        cell.textContent = 'FREE';
        el.board.appendChild(cell);
        continue;
      }

      cell.className = 'cell editing';

      var input = document.createElement('textarea');
      input.className = 'cell-input';
      input.maxLength = max;
      input.rows = 1;
      input.placeholder = String(slot + 1);
      input.value = state.cells[slot] || '';
      input.dataset.slot = slot;

      input.addEventListener('input', onCellInput);
      input.addEventListener('focus', function (e) { e.target.select(); });

      cell.appendChild(input);
      el.board.appendChild(cell);
      slot++;
    }
  }

  function onCellInput(e) {
    var slot = Number(e.target.dataset.slot);
    state.cells[slot] = e.target.value.replace(/\s+/g, ' ');
    resetShare();
  }

  /* ---------- 공유 링크 만들기 ---------- */

  function emptyCount() {
    var count = 0;
    state.cells.forEach(function (c) { if (!String(c).trim()) { count++; } });
    return count;
  }

  function onMake() {
    hideNotice();

    if (!state.title.trim()) {
      showNotice('빙고 제목을 입력해 주세요.');
      el.title.focus();
      return;
    }

    var empty = emptyCount();
    if (empty > 0 && !state.warned) {
      state.warned = true;
      el.makeBtn.textContent = '비어 있어도 만들기';
      showNotice('아직 ' + empty + '칸이 비어 있어요. 그대로 만들려면 한 번 더 눌러 주세요.');
      return;
    }

    var url = BingoCodec.buildShareUrl({
      title: state.title.trim(),
      size: state.size,
      theme: state.theme,
      freeCenter: state.freeCenter,
      cells: state.cells.map(function (c) { return String(c).trim(); })
    });

    el.shareUrl.textContent = url;
    el.tryBtn.href = url;
    el.shareBox.style.display = '';
    el.kakaoBtn.style.display = Share.kakaoAvailable() ? '' : 'none';
    el.shareBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 주소가 너무 길어지면 알려 줍니다. (카톡은 긴 주소도 보내지지만 보기가 안 좋습니다)
    if (url.length > 1800) {
      showNotice('링크가 꽤 길어요(' + url.length + '자). 칸 내용을 조금 줄이면 보기 좋아집니다.');
    }
  }

  function resetShare() {
    state.warned = false;
    el.makeBtn.textContent = '공유 링크 만들기';
    el.shareBox.style.display = 'none';
    hideNotice();
  }

  function onCopy() {
    Share.copyText(el.shareUrl.textContent).then(function (ok) {
      showToast(ok ? '링크를 복사했어요!' : '복사가 안 돼요. 주소를 길게 눌러 복사해 주세요.');
    });
  }

  function onKakao() {
    Share.sendKakao({
      title: state.title.trim(),
      description: '몇 개나 해당되는지 체크해 보세요!',
      link: el.shareUrl.textContent
    }).catch(function (err) {
      showToast('카카오톡 공유에 실패했어요.');
      console.error(err);
    });
  }

  /* ---------- 작은 알림들 ---------- */

  function showNotice(text) {
    el.notice.textContent = text;
    el.notice.style.display = '';
  }

  function hideNotice() {
    el.notice.style.display = 'none';
  }

  var toastTimer = null;
  function showToast(text) {
    el.toast.textContent = text;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 1600);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
