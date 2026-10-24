/* =========================================================
   메인 화면 동작
   data/templates.js 에 있는 템플릿을 카드로 보여 줍니다.
   (템플릿을 추가하면 여기도 저절로 늘어납니다)
   ========================================================= */
(function () {

  function init() {
    Themes.apply('peach');

    var list = document.getElementById('tplList');
    list.innerHTML = '';

    TEMPLATES.forEach(function (tpl) {
      var card = document.createElement('a');
      card.className = 'tpl-card';
      card.href = 'play.html?t=' + encodeURIComponent(tpl.id);

      var emoji = document.createElement('span');
      emoji.className = 'tpl-emoji';
      emoji.textContent = tpl.emoji || '🎲';

      var box = document.createElement('span');

      var name = document.createElement('span');
      name.className = 'tpl-name';
      name.textContent = tpl.title;

      var meta = document.createElement('span');
      meta.className = 'tpl-meta';
      meta.textContent = tpl.size + ' x ' + tpl.size + ' · ' +
                         (tpl.size * tpl.size - (tpl.freeCenter ? 1 : 0)) + '칸';

      box.appendChild(name);
      box.appendChild(document.createElement('br'));
      box.appendChild(meta);

      var go = document.createElement('span');
      go.className = 'tpl-go';
      go.textContent = '해보기';

      card.appendChild(emoji);
      card.appendChild(box);
      card.appendChild(go);
      list.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
