/* Tabs behaviour (WAI-ARIA tabs, automatic activation).
   - One indicator per tab list slides to the selected tab on the spatial spring: content width for primary tabs,
     full tab width for secondary.
   - Panels (aria-controls) switch with the shared axis pattern: the old panel slides 30px away and fades out, the new
     one slides in from the side of the newly selected tab. Movement on the spatial spring, fades on effects.
   - Keys: Left / Right move and select (wrapping), Home / End go to the first / last tab. Roving tabindex.
   - Fires s4-change { tab, index, panel } on the tab list. Select from code with tab.click(). */
S4.register('tabs', function (scope) {
  function panelOf(tab) { var id = tab.getAttribute('aria-controls'); return id ? document.getElementById(id) : null; }
  var uid = 0;

  S4.util.all(scope, '.s4-tabs').forEach(function (list) {
    if (!S4.util.once(list, 'tabs')) return;
    var tabs = function () { return Array.prototype.slice.call(list.querySelectorAll('.s4-tab')); };
    var indicator = document.createElement('span');
    indicator.className = 's4-tabs-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    list.appendChild(indicator);
    var anims = [];

    /* ---------- indicator ---------- */
    function place(animate) {
      var tab = list.querySelector('.s4-tab[aria-selected="true"]');
      if (!tab) { indicator.style.setProperty('--_w', '0px'); return; }
      var lr = list.getBoundingClientRect(), x, w;
      var base = lr.left + list.clientLeft - list.scrollLeft;
      if (list.dataset.variant === 'secondary') {
        var tr = tab.getBoundingClientRect(); x = tr.left - base; w = tr.width;
      } else {
        var range = document.createRange(); range.selectNodeContents(tab);
        var cr = range.getBoundingClientRect(); x = cr.left - base; w = cr.width;
      }
      indicator.toggleAttribute('data-animate', !!animate);
      indicator.style.setProperty('--_x', x + 'px');
      indicator.style.setProperty('--_w', w + 'px');
    }

    /* ---------- panels: shared axis ---------- */
    var axisState = {};
    function swap(from, to, dir) {   /* shared axis from motion/motion.js */
      if (!to) { if (from) from.hidden = true; return; }
      S4.transition.sharedAxis(from, to, dir, axisState);
    }

    function reveal(tab, smooth) {
      if (!list.hasAttribute('data-scrollable')) return;
      var lr = list.getBoundingClientRect(), tr = tab.getBoundingClientRect();
      var pad = parseFloat(getComputedStyle(list).scrollPaddingInlineStart) || 0, dx = 0;
      if (tr.left < lr.left + pad) dx = tr.left - lr.left - pad;
      else if (tr.right > lr.right - pad) dx = tr.right - lr.right + pad;
      if (dx) list.scrollTo({ left: list.scrollLeft + dx, behavior: smooth && !S4.motion.reduced() ? 'smooth' : 'auto' });
    }

    function select(tab, focus) {
      if (!tab || tab.matches(':disabled, [aria-disabled="true"]')) return;
      var all = tabs(), old = list.querySelector('.s4-tab[aria-selected="true"]');
      if (focus) tab.focus({ preventScroll: list.hasAttribute('data-scrollable') });
      if (old === tab) return;
      var dir = all.indexOf(tab) >= all.indexOf(old) ? 1 : -1;
      if (getComputedStyle(list).direction === 'rtl') dir = -dir;
      all.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      /* hide any panel left over from an interrupted switch */
      all.forEach(function (t) { var p = panelOf(t); if (p && t !== tab && t !== old) p.hidden = true; });
      swap(old ? panelOf(old) : null, panelOf(tab), dir);
      place(true);
      reveal(tab, true);
      S4.util.emit(list, 's4-change', { tab: tab, index: all.indexOf(tab), panel: panelOf(tab) });
    }

    /* ---------- setup ---------- */
    var all = tabs();
    var selected = all.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || all[0];
    all.forEach(function (t) {
      if (!t.id) t.id = 's4-tab-' + (++uid);
      if (!t.hasAttribute('role')) t.setAttribute('role', 'tab');
      if (t.tagName === 'BUTTON' && !t.hasAttribute('type')) t.type = 'button';
      t.setAttribute('aria-selected', t === selected ? 'true' : 'false');
      t.tabIndex = t === selected ? 0 : -1;
      var p = panelOf(t);
      if (p) {
        if (!p.hasAttribute('role')) p.setAttribute('role', 'tabpanel');
        if (!p.hasAttribute('aria-labelledby')) p.setAttribute('aria-labelledby', t.id);
        if (!p.hasAttribute('tabindex')) p.tabIndex = 0;
        p.hidden = t !== selected;
      }
    });
    if (!list.hasAttribute('role')) list.setAttribute('role', 'tablist');

    list.addEventListener('click', function (e) {
      var t = e.target.closest('.s4-tab');
      if (t && list.contains(t)) { e.preventDefault(); select(t); }
    });
    list.addEventListener('keydown', function (e) {
      var t = e.target.closest('.s4-tab'); if (!t) return;
      var enabled = tabs().filter(function (x) { return !x.matches(':disabled, [aria-disabled="true"]'); });
      var i = enabled.indexOf(t), rtl = getComputedStyle(list).direction === 'rtl', next = null;
      var fwd = rtl ? 'ArrowLeft' : 'ArrowRight', back = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (e.key === fwd) next = enabled[(i + 1) % enabled.length];
      else if (e.key === back) next = enabled[(i - 1 + enabled.length) % enabled.length];
      else if (e.key === 'Home') next = enabled[0];
      else if (e.key === 'End') next = enabled[enabled.length - 1];
      if (!next) return;
      e.preventDefault();
      select(next, true);
    });

    reveal(selected, false);
    place(false);
    if ('ResizeObserver' in window) new ResizeObserver(function () { place(false); }).observe(list);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(false); });
  });
});
