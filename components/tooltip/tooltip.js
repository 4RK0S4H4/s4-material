/* Tooltips.
   Plain: [data-tooltip="text"]. Hover (after 500ms), keyboard focus, or a long press (shown for 1.5s). Hoverable and
   dismissible with Escape (WCAG 1.4.13). The tip is linked with aria-describedby, added to (not replacing) any existing ids.
   Rich: [data-rich-tooltip="id"] opens <div class="s4-rich-tooltip" id popover>: hover or focus shows it, click pins it
   (light dismiss closes it). */
(function () {
  var S4 = window.S4, tip = null, owner = null, showTimer = null, hideTimer = null, uid = 0;
  var DELAY = 500, LONG_PRESS = 1500;
  function ensureTip() {
    if (tip && tip.isConnected) return tip;
    tip = document.createElement('div'); tip.className = 's4-tooltip'; tip.id = 's4-tooltip'; tip.setAttribute('role', 'tooltip'); tip.hidden = true; tip.setAttribute('data-s4-skip', '');
    document.body.appendChild(tip);
    tip.addEventListener('pointerenter', function () { clearTimeout(hideTimer); });
    tip.addEventListener('pointerleave', function () { hide(); });
    return tip;
  }
  function describe(el, on) {
    var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).filter(function (x) { return x !== 's4-tooltip'; });
    if (on) ids.push('s4-tooltip');
    ids.length ? el.setAttribute('aria-describedby', ids.join(' ')) : el.removeAttribute('aria-describedby');
  }
  function show(el) {
    var t = ensureTip(); clearTimeout(hideTimer);
    if (owner && owner !== el) describe(owner, false);
    owner = el; t.textContent = el.getAttribute('data-tooltip'); t.hidden = false; describe(el, true);
    var a = el.getBoundingClientRect(), r = t.getBoundingClientRect(), m = 8, gap = 4;
    var top = a.top - gap - r.height < m ? a.bottom + gap : a.top - gap - r.height;
    var left = Math.max(m, Math.min(a.left + a.width / 2 - r.width / 2, document.documentElement.clientWidth - m - r.width));
    t.style.top = top + 'px'; t.style.left = left + 'px';
    S4.motion.animate(t, [{ opacity: 0 }, { opacity: 1 }], 'fast-effects');
  }
  function hide(now) {
    clearTimeout(showTimer); clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { if (tip) tip.hidden = true; if (owner) { describe(owner, false); owner = null; } }, now ? 0 : 100);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && tip && !tip.hidden) hide(true); });

  S4.register('tooltip', function (scope) {
    S4.util.all(scope, '[data-tooltip]').forEach(function (el) {
      if (!S4.util.once(el, 'tooltip')) return;
      var press = null;
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { clearTimeout(showTimer); showTimer = setTimeout(function () { show(el); }, DELAY); } });
      el.addEventListener('pointerleave', function () { hide(); });
      el.addEventListener('focus', function () { if (el.matches(':focus-visible')) show(el); });
      el.addEventListener('blur', function () { hide(true); });
      el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') press = setTimeout(function () { show(el); setTimeout(function () { hide(true); }, LONG_PRESS); }, DELAY); });
      el.addEventListener('pointerup', function () { clearTimeout(press); });
      el.addEventListener('click', function () { hide(true); });
    });
    S4.util.all(scope, '[data-rich-tooltip]').forEach(function (anchor) {
      if (!S4.util.once(anchor, 'richTip')) return;
      var rt = document.getElementById(anchor.dataset.richTooltip); if (!rt) return;
      if (!rt.hasAttribute('popover')) rt.setAttribute('popover', '');
      anchor.setAttribute('aria-expanded', 'false'); anchor.setAttribute('aria-controls', rt.id);
      var pinned = false, t = null;
      function open() { if (rt.matches(':popover-open')) return; rt.showPopover(); S4.position(rt, anchor, { gap: 4 }); anchor.setAttribute('aria-expanded', 'true'); S4.motion.animate(rt, [{ opacity: 0 }, { opacity: 1 }], 'effects'); }
      function close() { if (!rt.matches(':popover-open')) return; rt.hidePopover(); anchor.setAttribute('aria-expanded', 'false'); pinned = false; }
      anchor.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { clearTimeout(t); t = setTimeout(open, DELAY); } });
      anchor.addEventListener('pointerleave', function () { clearTimeout(t); if (!pinned) t = setTimeout(close, 300); });
      rt.addEventListener('pointerenter', function () { clearTimeout(t); });
      rt.addEventListener('pointerleave', function () { if (!pinned) t = setTimeout(close, 300); });
      anchor.addEventListener('focus', function () { if (anchor.matches(':focus-visible')) open(); });
      anchor.addEventListener('click', function (e) { e.preventDefault(); pinned = !pinned; pinned ? open() : close(); });
      rt.addEventListener('toggle', function (e) { if (e.newState === 'closed') { anchor.setAttribute('aria-expanded', 'false'); pinned = false; } });
    });
  });
})();
