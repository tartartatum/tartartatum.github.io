// Search box for the guides and the manual: type words, only the matching sections stay, matching answers open.
(function () {
  'use strict';
  var q = document.getElementById('qs-q'); if (!q) return;
  var cards = [].slice.call(document.querySelectorAll('main section.product'));
  var none = document.getElementById('qs-none');
  var norm = function (s) { return String(s || '').toLowerCase().replace(/\s+/g, ' '); };
  function run() {
    var words = norm(q.value).trim().split(' ').filter(Boolean), shown = 0;
    cards.forEach(function (c) {
      var hit = !words.length || words.every(function (w) { return norm(c.textContent).indexOf(w) >= 0; });
      c.hidden = !hit; if (hit) shown++;
      [].forEach.call(c.querySelectorAll('details'), function (d) {
        d.open = !!words.length && words.every(function (w) { return norm(d.textContent).indexOf(w) >= 0; });
      });
    });
    if (none) none.hidden = shown > 0;
  }
  q.addEventListener('input', run);
})();
