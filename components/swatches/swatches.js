/* Swatches behaviour.
   Single choice: a click presses one swatch (aria-pressed) and fires s4-change { seed } on the group (seed null for
   the mono swatch, data-seed="#000000" or empty). One tab stop with arrow keys, Home and End (roving tabindex).
   data-theme-seed: the click also calls S4.theme({ seed, variant: 'vibrant' }), and the group follows S4.theme() via the
   s4-theme event, so it stays right when the theme changes elsewhere. */
S4.register('swatches', function (scope) {
  var norm = function (s) { return !s || String(s).toLowerCase() === '#000000' ? null : String(s).toLowerCase(); };
  S4.util.all(scope, '.s4-swatches').forEach(function (g) {
    if (!S4.util.once(g, 'swatches')) return;
    if (!g.hasAttribute('role')) g.setAttribute('role', 'group');
    var items = function () { return Array.prototype.slice.call(g.querySelectorAll('.s4-swatch')); };
    var enabled = function () { return items().filter(function (b) { return !b.disabled; }); };
    items().forEach(function (b) {
      var seed = b.getAttribute('data-seed') || '#000000';
      if (!b.style.getPropertyValue('--s4-swatch-color')) b.style.setProperty('--s4-swatch-color', seed);
      if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
      if (!b.querySelector('.s4-swatch-check')) { var k = document.createElement('span'); k.className = 's4-swatch-check'; k.setAttribute('aria-hidden', 'true'); b.appendChild(k); }
    });
    var stop = function (current) {
      var list = enabled();
      var t = current && list.indexOf(current) >= 0 ? current : (list.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0] || list[0]);
      items().forEach(function (b) { b.tabIndex = b === t ? 0 : -1; });
    };
    var select = function (seed) {
      var hit = null;
      items().forEach(function (b) { var on = norm(b.getAttribute('data-seed')) === norm(seed); if (on && !hit) hit = b; });
      items().forEach(function (b) { b.setAttribute('aria-pressed', b === hit ? 'true' : 'false'); });
      if (document.activeElement && g.contains(document.activeElement)) stop(document.activeElement); else stop();
    };
    var theme = g.hasAttribute('data-theme-seed');
    if (theme) {
      select(S4.theme().seed);
      document.addEventListener('s4-theme', function (e) { select((e.detail || S4.theme()).seed); });
    } else stop();

    g.addEventListener('click', function (e) {
      var b = e.target.closest('.s4-swatch');
      if (!b || !g.contains(b) || b.disabled) return;
      var seed = norm(b.getAttribute('data-seed'));
      var was = b.getAttribute('aria-pressed') === 'true';
      select(seed); stop(b);
      if (was) return;
      S4.util.emit(g, 's4-change', { seed: seed, swatch: b });
      if (theme) S4.theme({ seed: seed, variant: g.dataset.variant || 'vibrant' });
    });
    g.addEventListener('focusin', function (e) { var b = e.target.closest('.s4-swatch'); if (b) stop(b); });
    g.addEventListener('keydown', function (e) {
      var list = enabled(), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      var rtl = getComputedStyle(g).direction === 'rtl';
      var d = { ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 }[e.key];
      var to = d ? list[(i + d + list.length) % list.length] : e.key === 'Home' ? list[0] : e.key === 'End' ? list[list.length - 1] : null;
      if (!to) return;
      e.preventDefault(); stop(to); to.focus();
    });
  });
});
