/* Navigation bar behaviour: activating an item makes it current (aria-current="page" moves to it, the CSS expands its
   indicator) and fires s4-change { item, index, value } on the bar. value is the item's data-view, else its href.
   Links that load another page simply navigate; buttons and in-page links stay on the page. Call preventDefault() on the
   click to veto the change. Inside .s4-app, app.js mirrors the change to the nav rail and switches .s4-view sections. */
S4.register('nav-bar', function (scope) {
  S4.util.all(scope, '.s4-nav-bar').forEach(function (bar) {
    if (!S4.util.once(bar, 'navbar')) return;
    S4.navPill(bar);
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

/* S4.navPill(container): adds the sliding highlight to a nav bar or a rail's item list. It covers the current item's icon
   and label, follows layout changes (the rail expanding) without animating, and slides + resizes when aria-current moves. */
S4.navPill = function (box) {
  if (!box || box.querySelector(':scope > .s4-nav-pill')) return;
  var pill = document.createElement('span'); pill.className = 's4-nav-pill'; pill.setAttribute('aria-hidden', 'true');
  box.insertBefore(pill, box.firstChild);
  var padY = 6, padX = 8;
  function place(animate) {
    var cur = box.querySelector('.s4-nav-item[aria-current]:not([aria-current="false"])');
    if (!cur || !cur.getClientRects().length) { pill.style.setProperty('--_w', '0px'); return; }
    var b = box.getBoundingClientRect(), r = cur.getBoundingClientRect();
    var vertical = getComputedStyle(cur).flexDirection === 'column';
    var x = r.left - b.left - box.clientLeft, y = r.top - b.top - box.clientTop, w = r.width, h = r.height;
    if (vertical) { x += padX / 2; w -= padX; y += padY; h -= padY * 2; }
    pill.toggleAttribute('data-animate', !!animate && !S4.motion.reduced());
    pill.style.setProperty('--_x', x + 'px'); pill.style.setProperty('--_y', y + 'px');
    pill.style.setProperty('--_w', w + 'px'); pill.style.setProperty('--_h', h + 'px');
  }
  new MutationObserver(function () { place(true); }).observe(box, { attributes: true, attributeFilter: ['aria-current'], subtree: true });
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { place(false); }); ro.observe(box); box.querySelectorAll('.s4-nav-item').forEach(function (i) { ro.observe(i); }); }
  window.addEventListener('resize', function () { place(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(false); });
  place(false);
};
