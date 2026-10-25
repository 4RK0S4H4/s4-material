/* Button group behaviour.
   data-select="single": exactly one button is pressed (radio-like); data-select="multi": each button toggles.
   Both keep aria-pressed in sync and fire s4-change on the group: { value, values, button } where value is the pressed
   button's value attribute (single) or the array of pressed values (multi).
   Connected and selecting groups are one tab stop with a roving tabindex: arrow keys move focus, Home/End jump to the
   ends, Space/Enter press. */
S4.register('button-group', function (scope) {
  var ITEM = '.s4-button, .s4-icon-button';
  S4.util.all(scope, '.s4-button-group').forEach(function (g) {
    if (!S4.util.once(g, 'buttonGroup')) return;
    if (!g.hasAttribute('role')) g.setAttribute('role', 'group');
    var mode = g.dataset.select;
    var roving = !!mode || g.hasAttribute('data-connected');
    var items = function () {
      return Array.prototype.filter.call(g.children, function (b) { return b.matches(ITEM); });
    };
    var enabled = function () { return items().filter(function (b) { return !b.disabled && b.getAttribute('aria-disabled') !== 'true'; }); };
    var valueOf = function (b) { return b.value || b.getAttribute('value') || b.textContent.trim() || b.getAttribute('aria-label'); };
    var pressed = function () { return items().filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }); };

    if (mode) {
      items().forEach(function (b) { if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false'); });
      if (mode === 'single') {
        var on = pressed();
        if (!on.length && enabled()[0]) enabled()[0].setAttribute('aria-pressed', 'true');
        on.slice(1).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      }
    }

    /* roving tabindex: the tab stop is the focused, else the (first) pressed, else the first enabled button */
    var stop = function (current) {
      if (!roving) return;
      var list = enabled();
      var target = current && list.indexOf(current) >= 0 ? current : (pressed().filter(function (b) { return list.indexOf(b) >= 0; })[0] || list[0]);
      items().forEach(function (b) { b.tabIndex = b === target ? 0 : -1; });
    };
    stop();

    g.addEventListener('click', function (e) {
      var b = e.target.closest(ITEM);
      if (!b || b.parentElement !== g || b.disabled) return;
      if (mode === 'single') {
        if (b.getAttribute('aria-pressed') === 'true') return;
        items().forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        S4.util.emit(g, 's4-change', { value: valueOf(b), values: [valueOf(b)], button: b });
      } else if (mode === 'multi') {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
        var vals = pressed().map(valueOf);
        S4.util.emit(g, 's4-change', { value: vals, values: vals, button: b });
      }
      stop(b);
    });

    if (!roving) return;
    g.addEventListener('focusin', function (e) { var b = e.target.closest(ITEM); if (b && b.parentElement === g) stop(b); });
    g.addEventListener('keydown', function (e) {
      var list = enabled(), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      var rtl = getComputedStyle(g).direction === 'rtl';
      var next = { ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowLeft: rtl ? 1 : -1, ArrowUp: -1 }[e.key];
      var to = null;
      if (next) to = list[(i + next + list.length) % list.length];
      else if (e.key === 'Home') to = list[0];
      else if (e.key === 'End') to = list[list.length - 1];
      if (!to) return;
      e.preventDefault();
      stop(to);
      to.focus();
    });
  });
});
