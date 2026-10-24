/* =========================================================
   빙고 줄 계산 (가로 · 세로 · 대각선)
   화면과 결과 이미지가 같은 계산을 쓰도록 여기 한 곳에만 둡니다.
   ========================================================= */
var BingoCore = (function () {

  // size x size 판에서 만들 수 있는 모든 줄을 칸 번호 배열로 돌려줍니다.
  function allLines(size) {
    var lines = [];
    var i, j, row, col;

    for (i = 0; i < size; i++) {          // 가로
      row = [];
      for (j = 0; j < size; j++) row.push(i * size + j);
      lines.push(row);
    }
    for (i = 0; i < size; i++) {          // 세로
      col = [];
      for (j = 0; j < size; j++) col.push(j * size + i);
      lines.push(col);
    }
    var d1 = [], d2 = [];                 // 대각선 2개
    for (i = 0; i < size; i++) {
      d1.push(i * size + i);
      d2.push(i * size + (size - 1 - i));
    }
    lines.push(d1, d2);
    return lines;
  }

  // 완성된 줄의 칸 번호들과 줄 개수를 돌려줍니다.
  function completed(size, checked) {
    var lines = allLines(size);
    var done = [];
    var cells = {};

    lines.forEach(function (line) {
      var full = line.every(function (idx) { return !!checked[idx]; });
      if (full) {
        done.push(line);
        line.forEach(function (idx) { cells[idx] = true; });
      }
    });
    return { count: done.length, lines: done, cells: cells };
  }

  // 가운데 칸 번호 (3x3, 5x5 처럼 홀수 판에서만 FREE 칸이 생깁니다)
  function centerIndex(size) {
    if (size % 2 === 0) return -1;
    var mid = (size - 1) / 2;
    return mid * size + mid;
  }

  return { allLines: allLines, completed: completed, centerIndex: centerIndex };
})();
