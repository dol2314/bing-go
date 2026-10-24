/* =========================================================
   결과 이미지 만들기 (Canvas 2D)
   인스타 스토리 비율(1080 x 1920) 세로형으로 그립니다.
   웹폰트가 모두 준비된 뒤에 그리도록 되어 있습니다.
   ========================================================= */
var CardImage = (function () {

  var W = 1080;
  var H = 1920;
  var PAD = 72;
  var FONT = '"Pretendard Variable", Pretendard, sans-serif';

  /* ---------- 작은 도구들 ---------- */

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }
  }

  // 한글은 글자 단위로, 영어는 되도록 단어 단위로 줄바꿈합니다.
  function wrapText(ctx, text, maxWidth) {
    var tokens = String(text).split(/(\s+)/);
    var lines = [];
    var line = '';

    function pushLine() {
      lines.push(line.trim());
      line = '';
    }

    tokens.forEach(function (token) {
      if (!token) return;
      if (ctx.measureText(line + token).width <= maxWidth) {
        line += token;
        return;
      }
      if (/^\s+$/.test(token)) { if (line) { pushLine(); } return; }
      if (line) { pushLine(); }

      if (ctx.measureText(token).width <= maxWidth) {
        line = token;
        return;
      }
      // 한 덩어리가 너무 길면 글자 단위로 쪼갭니다.
      for (var i = 0; i < token.length; i++) {
        if (line && ctx.measureText(line + token[i]).width > maxWidth) { pushLine(); }
        line += token[i];
      }
    });

    if (line) { pushLine(); }
    return lines.length ? lines : [''];
  }

  // 주어진 네모 안에 들어갈 때까지 글자 크기를 줄여가며 맞춥니다.
  function fitText(ctx, text, maxWidth, maxHeight, startSize, minSize, weight) {
    var size = startSize;
    while (size >= minSize) {
      ctx.font = weight + ' ' + size + 'px ' + FONT;
      var lineHeight = size * 1.22;
      var lines = wrapText(ctx, text, maxWidth);
      if (lines.length * lineHeight <= maxHeight) {
        return { lines: lines, size: size, lineHeight: lineHeight };
      }
      size -= 2;
    }
    ctx.font = weight + ' ' + minSize + 'px ' + FONT;
    var lh = minSize * 1.22;
    return {
      lines: wrapText(ctx, text, maxWidth).slice(0, Math.max(1, Math.floor(maxHeight / lh))),
      size: minSize,
      lineHeight: lh
    };
  }

  function drawLines(ctx, lines, cx, top, lineHeight) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    lines.forEach(function (line, i) {
      ctx.fillText(line, cx, top + lineHeight * (i + 0.5));
    });
    return top + lineHeight * lines.length;
  }

  function drawPill(ctx, text, centerX, centerY, bg, fg) {
    ctx.font = '800 34px ' + FONT;
    var w = ctx.measureText(text).width + 56;
    var h = 68;
    ctx.fillStyle = bg;
    roundRect(ctx, centerX - w / 2, centerY - h / 2, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX, centerY + 2);
  }

  /* ---------- 웹폰트 준비 ---------- */

  // 한 번 확인이 끝나면 다시 기다리지 않습니다. (저장 버튼이 느려지는 걸 막아줍니다)
  var fontsReady = false;

  // 캔버스는 DOM이 아니라서, 쓸 글자를 알려주며 폰트를 미리 불러와야 합니다.
  function ensureFonts(sampleText) {
    if (fontsReady) { return Promise.resolve(); }
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    var specs = ['400 40px ' + FONT, '600 40px ' + FONT, '800 40px ' + FONT];
    var jobs = specs.map(function (spec) {
      return document.fonts.load(spec, sampleText).catch(function () {});
    });
    return Promise.all(jobs)
      .then(function () { return document.fonts.ready; })
      .then(function () { fontsReady = true; })
      .catch(function () {});
  }

  /* ---------- 본 그리기 ----------
     data = {
       title, size, cells[], checked{}, freeCenter,
       lineCount, checkedCount, totalCount,
       result: { title, desc }, theme
     }
  */
  function render(canvas, data) {
    var theme = data.theme;
    var ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    /* 배경 */
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = theme.soft;
    ctx.beginPath(); ctx.arc(-60, 180, 280, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W + 70, H - 260, 320, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    var cx = W / 2;
    var contentW = W - PAD * 2;
    var y = 132;

    /* 제목 */
    ctx.fillStyle = theme.title;
    var title = fitText(ctx, data.title || '공감 빙고', contentW, 180, 66, 40, '800');
    ctx.font = '800 ' + title.size + 'px ' + FONT;
    y = drawLines(ctx, title.lines, cx, y, title.lineHeight);

    /* 배지 (줄 수 / 체크 수) */
    y += 34;
    var pillGap = 18;
    ctx.font = '800 34px ' + FONT;
    var t1 = data.lineCount + '줄 빙고';
    var t2 = '체크 ' + data.checkedCount + '/' + data.totalCount;
    var w1 = ctx.measureText(t1).width + 56;
    var w2 = ctx.measureText(t2).width + 56;
    var startX = cx - (w1 + w2 + pillGap) / 2;
    drawPill(ctx, t1, startX + w1 / 2, y + 34, theme.accent, theme.accentText);
    drawPill(ctx, t2, startX + w1 + pillGap + w2 / 2, y + 34, theme.soft, theme.accent);
    y += 68;

    /* 빙고판 */
    y += 56;
    var boardSize = contentW;
    var boardX = PAD;
    var boardY = y;
    var innerPad = 18;
    var gap = 14;
    var n = data.size;
    var cellSize = (boardSize - innerPad * 2 - gap * (n - 1)) / n;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.10)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = theme.board;
    roundRect(ctx, boardX, boardY, boardSize, boardSize, 36);
    ctx.fill();
    ctx.restore();

    var centerIdx = data.freeCenter ? BingoCore.centerIndex(n) : -1;

    for (var i = 0; i < n * n; i++) {
      var row = Math.floor(i / n);
      var col = i % n;
      var x = boardX + innerPad + col * (cellSize + gap);
      var cellY = boardY + innerPad + row * (cellSize + gap);
      var isFree = (i === centerIdx);
      var isChecked = !!data.checked[i];

      if (isFree) {
        ctx.fillStyle = theme.soft;
      } else if (isChecked) {
        ctx.fillStyle = theme.accent;
      } else {
        ctx.fillStyle = theme.cell;
      }
      roundRect(ctx, x, cellY, cellSize, cellSize, 18);
      ctx.fill();

      /* 체크된 칸에 도장 느낌의 원 */
      if (isChecked && !isFree) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = theme.accentText;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x + cellSize / 2, cellY + cellSize / 2, cellSize * 0.36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      /* 칸 글자 */
      var text = isFree ? 'FREE' : (data.cells[i] || '');
      if (!text) { continue; }
      ctx.fillStyle = isFree ? theme.accent : (isChecked ? theme.accentText : theme.cellText);
      var weight = (isFree || isChecked) ? '800' : '600';
      var fit = fitText(ctx, text, cellSize - 22, cellSize - 18,
                        Math.round(cellSize * 0.2), 14, weight);
      ctx.font = weight + ' ' + fit.size + 'px ' + FONT;
      var textTop = cellY + (cellSize - fit.lines.length * fit.lineHeight) / 2;
      drawLines(ctx, fit.lines, x + cellSize / 2, textTop, fit.lineHeight);
    }

    y = boardY + boardSize;

    /* 결과 문구 */
    y += 62;
    ctx.fillStyle = theme.accent;
    var rTitle = fitText(ctx, data.result.title, contentW, 170, 78, 46, '800');
    ctx.font = '800 ' + rTitle.size + 'px ' + FONT;
    y = drawLines(ctx, rTitle.lines, cx, y, rTitle.lineHeight);

    y += 18;
    ctx.fillStyle = theme.muted;
    var rDesc = fitText(ctx, data.result.desc, contentW - 40, 140, 36, 26, '600');
    ctx.font = '600 ' + rDesc.size + 'px ' + FONT;
    drawLines(ctx, rDesc.lines, cx, y, rDesc.lineHeight);

    /* 하단 사이트 주소 (홍보) */
    ctx.fillStyle = theme.muted;
    ctx.font = '700 30px ' + FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(CONFIG.SITE_NAME + '  ·  ' + CONFIG.siteHost(), cx, H - 78);

    return canvas;
  }

  /* 폰트를 먼저 준비한 뒤 그리고, PNG 파일(Blob)로 돌려줍니다. */
  function create(canvas, data) {
    var sample = [
      data.title, data.result.title, data.result.desc,
      CONFIG.SITE_NAME, CONFIG.siteHost(), 'FREE0123456789줄 빙고체크'
    ].concat(data.cells).join('');

    return ensureFonts(sample).then(function () {
      render(canvas, data);
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
      });
    });
  }

  return {
    create: create,
    render: render,
    preload: ensureFonts,   // 화면이 열릴 때 미리 폰트를 받아두면 저장이 빨라집니다
    WIDTH: W,
    HEIGHT: H
  };
})();
