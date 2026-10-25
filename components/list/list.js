/* List behaviour: selectable lists (WAI-ARIA listbox).
   <ul class="s4-list" role="listbox" aria-label="Pay From" [aria-multiselectable="true"]>
     <li role="none"><div class="s4-list-item" role="option" aria-selected="true" data-value="checking">…</div></li>
   </ul>
   One option is in the tab order (roving tabindex). Up/Down/Home/End move focus; click, Enter or Space selects.
   Single select moves aria-selected; multi select toggles it. Fires s4-select { item, value, selected } on the item and
   s4-change { value } on the list (value is an array for multi select). Plain lists of links need no script. */
S4.register('list', function (scope) {
  S4.util.all(scope, '.s4-list[role="listbox"]').forEach(function (list) {
    if (!S4.util.once(list, 'list')) return;
    var multi = list.getAttribute('aria-multiselectable') === 'true';
    var options = function () { return Array.prototype.slice.call(list.querySelectorAll('.s4-list-item[role="option"]')); };
    var enabled = function () { return options().filter(function (o) { return o.getAttribute('aria-disabled') !== 'true'; }); };

    var opts = options();
    opts.forEach(function (o) { if (!o.hasAttribute('aria-selected')) o.setAttribute('aria-selected', 'false'); });
    var start = opts.filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })[0] || enabled()[0];
    opts.forEach(function (o) { o.tabIndex = o === start ? 0 : -1; });

    function focus(o) {
      if (!o) return;
      options().forEach(function (x) { x.tabIndex = x === o ? 0 : -1; });
      o.focus();
    }
    function value() {
      var sel = options().filter(function (o) { return o.getAttribute('aria-selected') === 'true'; })
        .map(function (o) { return o.dataset.value || o.textContent.trim(); });
      return multi ? sel : sel[0] || null;
    }
    function select(o) {
      if (!o || o.getAttribute('aria-disabled') === 'true') return;
      var on = multi ? o.getAttribute('aria-selected') !== 'true' : true;
      if (!multi) {
        if (o.getAttribute('aria-selected') === 'true') return;
        options().forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      }
      o.setAttribute('aria-selected', String(on));
      focus(o);
      S4.util.emit(o, 's4-select', { item: o, value: o.dataset.value || o.textContent.trim(), selected: on });
      S4.util.emit(list, 's4-change', { value: value() });
    }

    list.addEventListener('click', function (e) {
      var o = e.target.closest('.s4-list-item[role="option"]');
      if (o && list.contains(o)) select(o);
    });
    list.addEventListener('keydown', function (e) {
      var o = e.target.closest('.s4-list-item[role="option"]'); if (!o) return;
      var all = enabled(), i = all.indexOf(o), next = null;
      switch (e.key) {
        case 'ArrowDown': next = all[Math.min(i + 1, all.length - 1)]; break;
        case 'ArrowUp': next = all[Math.max(i - 1, 0)]; break;
        case 'Home': next = all[0]; break;
        case 'End': next = all[all.length - 1]; break;
        case 'Enter': case ' ': e.preventDefault(); select(o); return;
        default: return;
      }
      e.preventDefault();
      focus(next);
    });
  });
});
