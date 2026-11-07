/* Animation scrubber for review labs. Include before the page's own scripts: <script src="lib/scrub.js"></script>.
   One slim bar: [Freeze] and a slider. Tap Freeze, open or close the menu / dialog / sheet (it stops at 0%), drag or tap the slider to any moment
   and screenshot it. Tap Freeze again to let the animation run on. Works on animations made with element.animate (all Orion motion).
   The bar does its own hit-testing at window level, because an open menu closes on any outside tap and a modal dialog makes the rest of the page
   inert; and it only captures animations started by a real tap on the page. */
(function () {
  'use strict';
  var on = false, list = [], native = Element.prototype.animate, lastTap = -1e9, batchAt = -1e9, frac = 0, dragging = false;
  var bar, toggle, track, fill, label;
  var now = function () { return performance.now(); };
  var alive = function () { return list.filter(function (a) { return a.playState !== 'idle'; }); };
  var end = function () { return list.reduce(function (m, a) { try { return Math.max(m, a.effect.getComputedTiming().endTime); } catch (e) { return m; } }, 0); };
  function show() {
    fill.style.width = (frac * 100) + '%';
    label.textContent = !on ? 'Freeze, then open the menu' : !list.length ? 'Now open it' : Math.round(frac * 100) + '%  ·  ' + Math.round(frac * end()) + ' ms';
  }
  function setAt(f) {
    if (!list.length) return;
    frac = Math.max(0, Math.min(1, f)); list = alive();
    var t = frac * end(); list.forEach(function (a) { try { a.pause(); a.currentTime = t; } catch (e) {} });
    show();
  }
  Element.prototype.animate = function () {
    var a = native.apply(this, arguments);
    if (on && now() - lastTap < 500 && !(bar && bar.contains(this))) {
      if (now() - batchAt > 120) { list = []; frac = 0; }
      batchAt = now(); list.push(a); a.pause(); a.currentTime = 0; show();
    }
    return a;
  };
  function build() {
    bar = document.createElement('div'); bar.className = 'rv rv-scrub';
    bar.innerHTML = '<style>.rv-scrub{position:fixed;left:50%;bottom:calc(var(--rv-scrub-bottom,10px) + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483000;width:min(96vw,520px);box-sizing:border-box;padding:6px;border-radius:14px;background:#0b57d0;color:#fff;font:600 13px/16px Inter,system-ui,sans-serif;display:flex;gap:6px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}' +
      '.rv-scrub button{flex:0 0 auto;height:40px;border:0;border-radius:10px;background:#fff;color:#0b57d0;font:inherit;padding:0 14px}.rv-scrub button.on{background:#a8c7fa}' +
      '.rv-scrub .tr{position:relative;flex:1;height:40px;border-radius:10px;background:rgba(255,255,255,.25);overflow:hidden}.rv-scrub .fl{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,255,255,.4)}' +
      '.rv-scrub .tx{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:500;pointer-events:none}</style>' +
      '<button type="button">Freeze</button><div class="tr"><div class="fl"></div><div class="tx"></div></div>';
    document.body.appendChild(bar);
    var nav = document.querySelector('.s4-nav-bar'); if (nav) bar.style.setProperty('--rv-scrub-bottom', (nav.getBoundingClientRect().height + 8) + 'px');   /* sit above a bottom nav, never on it */
    toggle = bar.querySelector('button'); track = bar.querySelector('.tr'); fill = bar.querySelector('.fl'); label = bar.querySelector('.tx'); show();
    var pt = function (e) { var t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]) || e; return { x: t.clientX, y: t.clientY }; };
    var inside = function (el, p) { var r = el.getBoundingClientRect(); return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom; };
    var swallow = function (e) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); };
    var fromX = function (x) { var r = track.getBoundingClientRect(); setAt((x - r.left) / r.width); };
    var down = function (e) {
      var p = pt(e); if (!inside(bar, p)) return; swallow(e);
      if (inside(toggle, p)) {
        on = !on; toggle.classList.toggle('on', on); toggle.textContent = on ? 'Frozen' : 'Freeze';
        if (!on) { var l = alive(); list = []; frac = 0; l.forEach(function (a) { try { a.play(); } catch (x) {} }); }
        show();
      } else if (inside(track, p)) { dragging = true; fromX(p.x); }
    };
    var move = function (e) { if (dragging) { swallow(e); fromX(pt(e).x); } };
    var up = function (e) { if (dragging) { dragging = false; swallow(e); } else if (inside(bar, pt(e))) swallow(e); };
    var opt = { capture: true, passive: false };
    if ('PointerEvent' in window) { window.addEventListener('pointerdown', down, opt); window.addEventListener('pointermove', move, opt); window.addEventListener('pointerup', up, opt); window.addEventListener('pointercancel', up, opt); }
    else { window.addEventListener('touchstart', down, opt); window.addEventListener('touchmove', move, opt); window.addEventListener('touchend', up, opt); window.addEventListener('mousedown', down, opt); window.addEventListener('mousemove', move, opt); window.addEventListener('mouseup', up, opt); }
    ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'click'].forEach(function (t) { window.addEventListener(t, function (e) { if (inside(bar, pt(e))) swallow(e); }, opt); });
    ['pointerdown', 'pointerup', 'click', 'keydown'].forEach(function (t) { window.addEventListener(t, function (e) { if (t === 'keydown' || !inside(bar, pt(e))) lastTap = now(); }, { capture: true, passive: true }); });
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
