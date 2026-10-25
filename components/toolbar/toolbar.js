/* Toolbar behaviour (WAI-ARIA toolbar): only for .s4-toolbar[role="toolbar"].
   One tab stop for the whole toolbar (roving tabindex). Left / Right (Up / Down when data-orientation="vertical") move
   focus between enabled controls, wrapping; Home / End go to the first / last. Text inputs inside keep their own arrows. */
S4.register('toolbar', function (scope) {
  var SEL = 'button, a[href], input, select, [tabindex]:not(.s4-toolbar)';
  S4.util.all(scope, '.s4-toolbar[role="toolbar"]').forEach(function (bar) {
    if (!S4.util.once(bar, 'toolbar')) return;
    var vertical = function () { return bar.dataset.orientation === 'vertical'; };
    if (vertical()) bar.setAttribute('aria-orientation', 'vertical');
    var items = function () {
      return Array.prototype.slice.call(bar.querySelectorAll(SEL)).filter(function (el) {
        return !el.disabled && el.getAttribute('aria-disabled') !== 'true' && !el.closest('[hidden]');
      });
    };
    function rove(active) { items().forEach(function (el) { el.tabIndex = el === active ? 0 : -1; }); }
    var list = items();
    rove(list.filter(function (el) { return el.tabIndex === 0 && el.hasAttribute('tabindex'); })[0] || list[0]);

    bar.addEventListener('focusin', function (e) { if (items().indexOf(e.target) >= 0) rove(e.target); });
    bar.addEventListener('keydown', function (e) {
      var all = items(), i = all.indexOf(document.activeElement);
      if (i < 0) return;
      if (/^(INPUT|SELECT)$/.test(e.target.tagName) && /Arrow(Left|Right)|Home|End/.test(e.key)) return;
      var rtl = getComputedStyle(bar).direction === 'rtl';
      var next = vertical() ? 'ArrowDown' : (rtl ? 'ArrowLeft' : 'ArrowRight');
      var prev = vertical() ? 'ArrowUp' : (rtl ? 'ArrowRight' : 'ArrowLeft');
      var to = null;
      if (e.key === next) to = all[(i + 1) % all.length];
      else if (e.key === prev) to = all[(i - 1 + all.length) % all.length];
      else if (e.key === 'Home') to = all[0];
      else if (e.key === 'End') to = all[all.length - 1];
      if (!to) return;
      e.preventDefault();
      rove(to);
      to.focus();
    });
  });
});
