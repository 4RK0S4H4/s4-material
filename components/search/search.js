/* Search bar behaviour.
   - Shows .s4-search-clear while there is text; clicking it (or Escape) clears, refocuses the input and fires s4-change.
   - Fires s4-change { value, matches } on the .s4-search on every edit (a live filter: no submit needed).
   - data-filter="<selector>": hides the target's child elements whose text doesn't contain the query (case and accent
     insensitive); matches is how many stay visible. data-filter-empty="<selector>" shows an element when none match.
   - Clicking the bar's empty space focuses the input. */
S4.register('search', function (scope) {
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  S4.util.all(scope, '.s4-search').forEach(function (box) {
    if (!S4.util.once(box, 'search')) return;
    var input = box.querySelector('.s4-search-input, input');
    if (!input) return;
    var clear = box.querySelector('.s4-search-clear');

    function filter(q) {
      var target = box.dataset.filter && document.querySelector(box.dataset.filter);
      if (!target) return null;
      var n = 0;
      Array.prototype.forEach.call(target.children, function (el) {
        if (el.hasAttribute('data-filter-skip')) return;
        var hit = !q || norm(el.textContent).indexOf(q) >= 0;
        el.hidden = !hit;
        if (hit) n++;
      });
      var empty = box.dataset.filterEmpty && document.querySelector(box.dataset.filterEmpty);
      if (empty) empty.hidden = n > 0;
      return n;
    }
    function changed() {
      if (clear) clear.hidden = !input.value;
      var matches = filter(norm(input.value));
      S4.util.emit(box, 's4-change', { value: input.value, matches: matches });
    }
    function reset() {
      if (!input.value) return;
      input.value = '';
      changed();
      input.focus();
    }

    input.addEventListener('input', changed);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && input.value) { e.preventDefault(); reset(); }
    });
    if (clear) clear.addEventListener('click', reset);
    box.addEventListener('mousedown', function (e) {
      if (e.target === box || (e.target.closest('.s4-icon') && !e.target.closest('button, a'))) { e.preventDefault(); input.focus(); }
    });
    if (clear) clear.hidden = !input.value;
    if (input.value) filter(norm(input.value));
  });
});
