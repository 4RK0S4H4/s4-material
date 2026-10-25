/* Navigation bar behaviour: activating an item makes it current (aria-current="page" moves to it, the CSS expands its
   indicator) and fires s4-change { item, index, value } on the bar. value is the item's data-view, else its href.
   Links that load another page simply navigate; buttons and in-page links stay on the page. Call preventDefault() on the
   click to veto the change. Inside .s4-app, app.js mirrors the change to the nav rail and switches .s4-view sections. */
S4.register('nav-bar', function (scope) {
  S4.util.all(scope, '.s4-nav-bar').forEach(function (bar) {
    if (!S4.util.once(bar, 'navbar')) return;
    bar.addEventListener('click', function (e) {
      var item = e.target.closest('.s4-nav-item');
      if (!item || !bar.contains(item) || e.defaultPrevented) return;
      if (item.matches(':disabled, [aria-disabled="true"]')) return;
      var items = Array.prototype.slice.call(bar.querySelectorAll('.s4-nav-item'));
      var current = item.getAttribute('aria-current');
      if (current && current !== 'false') return;
      items.forEach(function (x) { if (x !== item) x.removeAttribute('aria-current'); });
      item.setAttribute('aria-current', 'page');
      S4.util.emit(bar, 's4-change', { item: item, index: items.indexOf(item), value: item.dataset.view || item.getAttribute('href') });
    });
  });
});
