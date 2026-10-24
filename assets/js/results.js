/* =========================================================
   체크 개수에 따른 결과 문구
   ★ 문구를 바꾸고 싶으면 이 파일만 고치면 됩니다.
   - ratio 는 "체크한 칸 ÷ 체크할 수 있는 칸" 비율입니다. (0 ~ 1)
   - 위에서부터 차례로 확인해서 처음 걸리는 문구가 나옵니다.
   - 템플릿(data/templates.js)에 results 를 따로 적어두면 그게 우선합니다.
   ========================================================= */
var ResultText = (function () {

  var DEFAULT_TABLE = [
    { upTo: 0,    title: '이 구역의 이방인',   desc: '하나도 공감 안 되셨다고요? 그것도 재능입니다.' },
    { upTo: 0.15, title: '아직 새내기',        desc: '이제 막 발을 들이셨군요. 곧 늘어납니다.' },
    { upTo: 0.35, title: '슬슬 물드는 중',     desc: '적당히 겪어보셨네요. 아직 돌아갈 수 있습니다.' },
    { upTo: 0.60, title: '어디 가도 평균은 함', desc: '딱 중간. 가장 무난하고 가장 흔한 유형입니다.' },
    { upTo: 0.85, title: '거의 다 겪어본 사람', desc: '이쯤 되면 할 말이 많으시겠는데요.' },
    { upTo: 0.99, title: '이 구역의 고인물',   desc: '본인 얘기 아니냐는 소리 자주 들으시죠.' },
    { upTo: 1,    title: '전설의 완전체',      desc: '전부 체크… 이 분야 명예의 전당에 올리겠습니다.' }
  ];

  function pick(checkedCount, totalCount, customTable) {
    var table = (customTable && customTable.length) ? customTable : DEFAULT_TABLE;
    var ratio = totalCount > 0 ? checkedCount / totalCount : 0;

    for (var i = 0; i < table.length; i++) {
      if (ratio <= table[i].upTo) return table[i];
    }
    return table[table.length - 1];
  }

  return { pick: pick, DEFAULT_TABLE: DEFAULT_TABLE };
})();
