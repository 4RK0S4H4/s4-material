/* Top app bar behaviour: watches the bar's scroll container (the nearest scrolling ancestor, else the window).
   - data-scrolled is set while content is under the bar (for medium/large: once the headline has collapsed).
   - medium/large: sets --_offset (px the 64dp row follows the scroll) and --_p (collapse progress 0..1), and keeps a
     small copy of the title (aria-hidden) that fades into the 64dp row when collapsed.
   A zero-height sentinel is inserted just before the bar to measure how far it has scrolled. */
S4.register('top-app-bar', function (scope) {
  function scroller(el) {
    for (var p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var o = getComputedStyle(p).overflowY;
      if (o === 'auto' || o === 'scroll' || o === 'overlay') return p;
    }
    return window;
  }
  S4.util.all(scope, '.s4-top-app-bar').forEach(function (bar) {
    if (!S4.util.once(bar, 'appbar')) return;
    var sentinel = document.createElement('div');
    sentinel.className = 's4-app-bar-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'display:block;height:0;margin:0;padding:0;border:0;flex:none';
    bar.parentNode.insertBefore(sentinel, bar);

    var title = bar.querySelector('.s4-app-bar-title'), small = null;
    function ensureSmall() {
      if (!title) return;
      if (!small) {
        small = document.createElement('div');
        small.className = 's4-app-bar-collapsed-title';
        small.setAttribute('aria-hidden', 'true');
        var group = bar.querySelector('.s4-app-bar-title-group');
        bar.insertBefore(small, group ? group.nextSibling : null);
        new MutationObserver(function () { small.textContent = title.textContent; })
          .observe(title, { childList: true, characterData: true, subtree: true });
      }
      if (small.textContent !== title.textContent) small.textContent = title.textContent;
    }

    var root = scroller(bar), queued = false;
    function update() {
      queued = false;
      var top = sentinel.getBoundingClientRect().top;
      var viewTop = root === window ? 0 : root.getBoundingClientRect().top + root.clientTop;
      var past = Math.max(0, viewTop - top);                       /* how far the bar's natural spot has scrolled up */
      var range = Math.max(0, -parseFloat(getComputedStyle(bar).top) || 0);   /* headline height that collapses */
      var collapsing = bar.dataset.size === 'medium' || bar.dataset.size === 'large';
      if (collapsing) {
        ensureSmall();
        var off = Math.min(past, range);
        bar.style.setProperty('--_offset', off + 'px');
        bar.style.setProperty('--_p', range ? (off / range).toFixed(3) : '1');
      } else {
        bar.style.removeProperty('--_offset');
        bar.style.removeProperty('--_p');
      }
      bar.toggleAttribute('data-scrolled', past > range + 0.5);
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    (root === window ? window : root).addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    new MutationObserver(queue).observe(bar, { attributes: true, attributeFilter: ['data-size'] });
    update();
  });
});
