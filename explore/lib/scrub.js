/* Animation scrubber for review labs. Include before the page's own scripts: <script src="lib/scrub.js"></script>.
   A blue bar at the bottom freezes an animation the page starts so you can step through it and screenshot exact moments.
     1. Tap Freeze (it turns On).      2. Open or close the menu / dialog / sheet: it stops at 0%.
     3. Tap a stop (0 20 40 60 80 100), nudge with - and +, or drag the slider.      4. Play runs it on from there; tap Freeze again to release.
   Works on animations made with element.animate (all Orion motion).
   Built to be hard to break on a phone: taps and drags are handled at window level with our own hit-testing (an open menu closes on any outside
   tap and a modal dialog makes the rest of the page inert, so the bar's own controls could never receive them), the page can't scroll under the
   bar, only animations started by a real tap on the page are captured (never stray ones from touching the bar), and once an animation has run
   out the bar lets go of it instead of poking a finished one. */
(function () {
  'use strict';
  var on = false, playing = false, list = [], native = Element.prototype.animate, lastTap = -1e9, batchAt = -1e9, frac = 0;
  var bar, track, fill, knob, readout, toggle, play, stops = [], dragging = false;
  var now = function () { return performance.now(); };
  function end() { return list.reduce(function (m, a) { try { return Math.max(m, a.effect.getComputedTiming().endTime); } catch (e) { return m; } }, 0); }
  function alive() { return list.filter(function (a) { return a.playState !== 'idle'; }); }
  function show() {
    var t = frac * end();
    knob.style.left = (frac * 100) + '%'; fill.style.width = (frac * 100) + '%';
    readout.textContent = list.length ? Math.round(frac * 100) + '%  ·  ' + Math.round(t) + ' of ' + Math.round(end()) + ' ms' : (on ? 'Now open the menu or dialog: it freezes at 0%' : 'Tap Freeze, then open the menu or dialog (⇅ moves this bar if it covers something)');
    stops.forEach(function (b) { b.setAttribute('aria-pressed', list.length && Math.abs(+b.dataset.f / 100 - frac) < 0.026 ? 'true' : 'false'); });
  }
  function setAt(f) {
    if (!list.length) return;
    frac = Math.max(0, Math.min(1, f));
    var t = frac * end();
    list = alive();
    list.forEach(function (a) { try { a.pause(); a.currentTime = t; } catch (e) {} });
    show();
  }
  function release() { var l = alive(); list = []; frac = 0; l.forEach(function (a) { try { a.play(); } catch (e) {} }); show(); }
  Element.prototype.animate = function () {
    var a = native.apply(this, arguments);
    if (on && now() - lastTap < 500 && !(bar && bar.contains(this))) {   /* only what a real tap on the page started */
      if (now() - batchAt > 120) { list = []; frac = 0; playing = false; }
      batchAt = now(); list.push(a); a.pause(); a.currentTime = 0;
      show();
      a.finished.then(function () { /* ran out after Play: let go of the whole set */ if (playing && list.indexOf(a) >= 0 && alive().every(function (x) { return x.playState === 'finished' || x.playState === 'idle'; })) { playing = false; list = []; frac = 0; show(); readout.textContent = 'Done. Open it again to scrub again.'; } }, function () {});
    }
    return a;
  };
  function build() {
    bar = document.createElement('div'); bar.className = 'rv rv-scrub'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Animation scrubber');
    bar.innerHTML = '<style>' +
      '.rv-scrub{position:fixed;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483000;width:min(96vw,540px);box-sizing:border-box;padding:10px;border-radius:18px;background:#0b57d0;color:#fff;font:600 13px/16px Inter,system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;display:flex;flex-direction:column;gap:8px}' +
      '.rv-scrub *{box-sizing:border-box}.rv-scrub .r{display:flex;gap:6px;align-items:center}' +
      '.rv-scrub button{flex:1 1 0;min-width:0;height:40px;border:0;border-radius:12px;background:#fff;color:#0b57d0;font:inherit;padding:0 4px;cursor:pointer}' +
      '.rv-scrub button[aria-pressed=true]{background:#a8c7fa}.rv-scrub button.on{background:#d3e3fd}.rv-scrub button:disabled{opacity:.45}' +
      '.rv-scrub .tr{position:relative;flex:1;height:40px;border-radius:12px;background:rgba(255,255,255,.22);overflow:hidden}.rv-scrub .fl{position:absolute;left:0;top:0;bottom:0;width:0;background:rgba(255,255,255,.35)}' +
      '.rv-scrub .kn{position:absolute;top:4px;bottom:4px;width:18px;margin-left:-9px;border-radius:9px;background:#fff;left:0}' +
      '.rv-scrub .ro{text-align:center;font-weight:500;opacity:.95;min-height:16px}</style>' +
      '<div class="r"><button type="button" data-a="freeze" style="flex:1.4">Freeze Off</button><div class="tr" data-a="track"><div class="fl"></div><div class="kn"></div></div><button type="button" data-a="play">Play</button></div>' +
      '<div class="r"><button type="button" data-a="minus">−5</button>' + [0, 20, 40, 60, 80, 100].map(function (n) { return '<button type="button" data-a="stop" data-f="' + n + '" aria-pressed="false">' + n + '</button>'; }).join('') + '<button type="button" data-a="plus">+5</button></div>' +
      '<div class="r"><div class="ro" style="flex:1"></div><button type="button" data-a="flip" aria-label="Move the bar to the top or bottom" style="flex:0 0 76px;height:30px">⇅ Top</button></div>';
    document.body.appendChild(bar);
    toggle = bar.querySelector('[data-a=freeze]'); play = bar.querySelector('[data-a=play]'); track = bar.querySelector('[data-a=track]'); fill = bar.querySelector('.fl'); knob = bar.querySelector('.kn'); readout = bar.querySelector('.ro');
    stops = [].slice.call(bar.querySelectorAll('[data-a=stop]'));
    show();
    var rectOf = function (el) { return el.getBoundingClientRect(); };
    var pt = function (e) { var t = e.changedTouches && e.changedTouches[0] || e.touches && e.touches[0] || e; return { x: t.clientX, y: t.clientY }; };
    var inside = function (el, p) { var r = rectOf(el); return p.x >= r.left && p.x <= r.right && p.y >= r.top && p.y <= r.bottom; };
    var swallow = function (e) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); };
    var fromX = function (x) { var r = rectOf(track); setAt((x - r.left) / r.width); };
    var act = function (b) {
      var a = b.dataset.a;
      if (a === 'freeze') { on = !on; toggle.textContent = on ? 'Freeze On' : 'Freeze Off'; toggle.classList.toggle('on', on); if (!on) release(); else show(); }
      else if (a === 'play') { if (!list.length) return; var from = frac * end(); list = alive(); playing = true; list.forEach(function (x) { try { x.currentTime = from; x.play(); } catch (e) {} }); readout.textContent = 'Playing…'; }
      else if (a === 'stop') setAt(+b.dataset.f / 100);
      else if (a === 'flip') { var top = bar.dataset.at !== 'top'; bar.dataset.at = top ? 'top' : 'bottom'; bar.style.bottom = top ? 'auto' : ''; bar.style.top = top ? 'calc(10px + env(safe-area-inset-top,0px))' : 'auto'; b.textContent = top ? '⇅ Bottom' : '⇅ Top'; }
      else if (a === 'minus') setAt(frac - 0.05);
      else if (a === 'plus') setAt(frac + 0.05);
    };
    var down = function (e) {
      var p = pt(e); if (!inside(bar, p)) return;
      swallow(e);
      if (e.type === 'touchstart' && e.touches && e.touches.length > 1) return;
      if (dragging || e.type === 'pointerdown' && e.pointerType === 'touch' && false) return;
      if (inside(track, p)) { dragging = true; fromX(p.x); return; }
      var b = [].slice.call(bar.querySelectorAll('button')).filter(function (x) { return inside(x, p); })[0];
      if (b && !b.disabled) act(b);
    };
    var move = function (e) { if (!dragging) return; swallow(e); fromX(pt(e).x); };
    var up = function (e) { if (dragging) { dragging = false; swallow(e); } else if (inside(bar, pt(e))) swallow(e); };
    /* one gesture arrives as touch events AND pointer events: act on pointer events when they exist, and still block the touch events (scrolling, zoom, ghost clicks) */
    var hasPointer = 'PointerEvent' in window, opt = { capture: true, passive: false };
    if (hasPointer) { window.addEventListener('pointerdown', down, opt); window.addEventListener('pointermove', move, opt); window.addEventListener('pointerup', up, opt); window.addEventListener('pointercancel', up, opt); }
    else { window.addEventListener('touchstart', down, opt); window.addEventListener('touchmove', move, opt); window.addEventListener('touchend', up, opt); window.addEventListener('mousedown', down, opt); window.addEventListener('mousemove', move, opt); window.addEventListener('mouseup', up, opt); }
    ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mouseup', 'click'].forEach(function (t) {
      window.addEventListener(t, function (e) { if (inside(bar, pt(e))) swallow(e); else if (t === 'click' || t === 'touchend') lastTap = now(); }, opt);
    });
    /* a real tap on the page starts the capture window (the animation it triggers is created on pointerup or click) */
    window.addEventListener('pointerdown', function (e) { if (!inside(bar, pt(e))) lastTap = now(); }, { capture: true, passive: true });
    window.addEventListener('pointerup', function (e) { if (!inside(bar, pt(e))) lastTap = now(); }, { capture: true, passive: true });
    window.addEventListener('keydown', function () { lastTap = now(); }, true);
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
