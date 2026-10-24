/* =========================================================
   플레이 화면 동작
   - 칸을 누르면 도장이 찍히고
   - 빙고 줄 수와 결과 문구가 바로 바뀌고
   - 결과 이미지를 만들어 저장 / 공유합니다.
   ========================================================= */
(function () {

  var state = {
    template: null,
    theme: null,
    size: 5,
    boardCells: [],   // 칸 위치 순서대로의 글자 (FREE 자리는 null)
    centerIdx: -1,
    checked: {},      // { 칸번호: true }
    lineCount: 0,
    imageBlob: null,
    imageUrl: null
  };

  var el = {};

  /* ---------- 준비 ---------- */

  function init() {
    el.title = document.getElementById('bingoTitle');
    el.board = document.getElementById('board');
    el.lineValue = document.getElementById('lineValue');
    el.checkValue = document.getElementById('checkValue');
    el.totalValue = document.getElementById('totalValue');
    el.resultTitle = document.getElementById('resultTitle');
    el.resultDesc = document.getElementById('resultDesc');
    el.saveBtn = document.getElementById('saveBtn');
    el.kakaoBtn = document.getElementById('kakaoBtn');
    el.toast = document.getElementById('toast');
    el.modal = document.getElementById('imageModal');
    el.modalBody = document.getElementById('modalBody');
    el.canvas = document.getElementById('cardCanvas');

    // 1순위: 공유 링크(#뒤 압축 데이터), 2순위: ?t=템플릿id, 3순위: 첫 템플릿
    var shared = BingoCodec.decode(location.hash.replace(/^#/, ''));
    var params = new URLSearchParams(location.search);
    state.template = shared || findTemplate(params.get('t'));
    state.theme = Themes.apply(state.template.theme || 'peach');
    state.size = state.template.size;
    state.centerIdx = state.template.freeCenter
      ? BingoCore.centerIndex(state.size)
      : -1;

    buildBoardCells();
    renderBoard();
    update();

    el.saveBtn.addEventListener('click', onSave);

    // 카카오 키가 있을 때만 카카오톡 버튼을 보여 줍니다.
    if (Share.kakaoAvailable()) {
      el.kakaoBtn.style.display = '';
      el.kakaoBtn.addEventListener('click', onKakao);
    }

    document.getElementById('closeModal').addEventListener('click', closeModal);
    el.modal.addEventListener('click', function (e) {
      if (e.target === el.modal) { closeModal(); }
    });

    document.title = state.template.title + ' | ' + CONFIG.SITE_NAME;
    el.title.textContent = state.template.title;

    // 결과 이미지에 쓸 글자들의 폰트를 미리 받아둡니다. (저장 버튼이 빨라집니다)
    CardImage.preload(resultSampleText());
  }

  // 결과 이미지에 등장할 수 있는 모든 글자
  function resultSampleText() {
    var table = state.template.results || ResultText.DEFAULT_TABLE;
    var texts = state.template.cells.concat([
      state.template.title, CONFIG.SITE_NAME, CONFIG.siteHost(),
      'FREE0123456789줄 빙고체크'
    ]);
    table.forEach(function (row) { texts.push(row.title, row.desc); });
    return texts.join('');
  }

  // 템플릿의 cells 는 FREE 칸을 뺀 목록이라, 판 위치에 맞게 끼워 넣습니다.
  function buildBoardCells() {
    var total = state.size * state.size;
    var source = state.template.cells.slice();
    var out = [];
    for (var i = 0; i < total; i++) {
      if (i === state.centerIdx) {
        out.push(null);              // FREE 칸
      } else {
        out.push(source.shift() || '');
      }
    }
    state.boardCells = out;
    if (state.centerIdx >= 0) { state.checked[state.centerIdx] = true; }
  }

  /* ---------- 빙고판 그리기 ---------- */

  function renderBoard() {
    el.board.className = 'board size-' + state.size;
    el.board.innerHTML = '';

    state.boardCells.forEach(function (text, i) {
      var isFree = (text === null);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell' + (isFree ? ' free checked' : '');
      cell.dataset.index = i;

      var span = document.createElement('span');
      span.className = 'cell-text';
      span.textContent = isFree ? 'FREE' : text;
      cell.appendChild(span);

      var stamp = document.createElement('span');
      stamp.className = 'stamp';
      cell.appendChild(stamp);

      if (isFree) {
        cell.disabled = true;
        cell.setAttribute('aria-label', '자유 칸');
      } else {
        cell.addEventListener('click', function () { toggle(i, cell); });
      }

      el.board.appendChild(cell);
    });
  }

  function toggle(index, cell) {
    if (state.checked[index]) {
      delete state.checked[index];
      cell.classList.remove('checked', 'just-checked');
    } else {
      state.checked[index] = true;
      cell.classList.add('checked', 'just-checked');
      if (navigator.vibrate) { navigator.vibrate(12); }
      setTimeout(function () { cell.classList.remove('just-checked'); }, 420);
    }
    update();
  }

  /* ---------- 점수 / 결과 ---------- */

  function checkedCount() {
    var count = 0;
    for (var key in state.checked) {
      if (Number(key) !== state.centerIdx) { count++; }
    }
    return count;
  }

  function totalCount() {
    return state.size * state.size - (state.centerIdx >= 0 ? 1 : 0);
  }

  function update() {
    var done = BingoCore.completed(state.size, state.checked);

    // 완성된 줄에 포함된 칸 표시
    var cells = el.board.querySelectorAll('.cell');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.toggle('in-line', !!done.cells[i]);
    }

    if (done.count > state.lineCount) { showToast(done.count + '줄 빙고!'); }
    state.lineCount = done.count;

    var checked = checkedCount();
    var total = totalCount();
    var result = ResultText.pick(checked, total, state.template.results);

    el.lineValue.textContent = done.count;
    el.checkValue.textContent = checked;
    el.totalValue.textContent = total;
    el.resultTitle.textContent = result.title;
    el.resultDesc.textContent = result.desc;
  }

  var toastTimer = null;
  function showToast(text) {
    el.toast.textContent = text;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('show');
    }, 1400);
  }

  /* ---------- 결과 이미지 ---------- */

  function onSave() {
    openModal();
    el.modalBody.innerHTML = '<p class="loading">결과 이미지를 만드는 중...</p>';

    var checked = checkedCount();
    var total = totalCount();

    var data = {
      title: state.template.title,
      size: state.size,
      cells: state.boardCells.map(function (t) { return t === null ? '' : t; }),
      checked: state.checked,
      freeCenter: state.centerIdx >= 0,
      lineCount: state.lineCount,
      checkedCount: checked,
      totalCount: total,
      result: ResultText.pick(checked, total, state.template.results),
      theme: state.theme
    };

    CardImage.create(el.canvas, data).then(function (blob) {
      if (state.imageUrl) { URL.revokeObjectURL(state.imageUrl); }
      state.imageBlob = blob;
      state.imageUrl = URL.createObjectURL(blob);
      showImage();
    }).catch(function (err) {
      el.modalBody.innerHTML = '<p class="loading">이미지를 만들지 못했어요. 다시 시도해 주세요.</p>';
      console.error(err);
    });
  }

  function showImage() {
    var fileName = state.template.title.replace(/\s+/g, '_') + '_결과.png';

    el.modalBody.innerHTML = '';

    var img = document.createElement('img');
    img.src = state.imageUrl;
    img.alt = '빙고 결과 이미지';
    el.modalBody.appendChild(img);

    var hint = document.createElement('p');
    hint.className = 'modal-hint';
    hint.textContent = '저장이 안 되면 이미지를 길게 눌러 저장하세요.';
    el.modalBody.appendChild(hint);

    var actions = document.createElement('div');
    actions.className = 'actions';

    // 휴대폰에서는 바로 인스타/카톡으로 보낼 수 있습니다.
    var file = new File([state.imageBlob], fileName, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      var shareBtn = document.createElement('button');
      shareBtn.type = 'button';
      shareBtn.className = 'btn primary';
      shareBtn.textContent = '이미지 공유하기';
      shareBtn.addEventListener('click', function () {
        navigator.share({
          files: [file],
          title: state.template.title
        }).catch(function () {});
      });
      actions.appendChild(shareBtn);
    }

    var saveLink = document.createElement('a');
    saveLink.className = 'btn ' + (actions.children.length ? 'ghost' : 'primary');
    saveLink.href = state.imageUrl;
    saveLink.download = fileName;
    saveLink.textContent = '이미지 저장';
    actions.appendChild(saveLink);

    el.modalBody.appendChild(actions);
  }

  // 지금 보고 있는 빙고를 그대로 카카오톡으로 보냅니다.
  function onKakao() {
    Share.sendKakao({
      title: state.template.title,
      description: '몇 개나 해당되는지 체크해 보세요!',
      link: location.href
    }).catch(function (err) {
      showToast('카카오톡 공유에 실패했어요.');
      console.error(err);
    });
  }

  function openModal() { el.modal.classList.add('show'); }
  function closeModal() { el.modal.classList.remove('show'); }

  document.addEventListener('DOMContentLoaded', init);
})();
