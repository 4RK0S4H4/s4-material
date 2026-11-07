/* Animation scrubber for review labs. Include before the page's own scripts: <script src="lib/scrub.js"></script>.
   A small bar at the bottom lets you freeze any animation the page starts and drag through it, so you can send screenshots of
   exact moments. Turn "Scrub" on, then trigger the animation (open a menu, a dialog...): it starts paused at 0; drag the slider
   to move through it, "Play" lets it run on from there. Works on animations made with element.animate (all Orion motion). */
(function () {
  'use strict';
  var on = false, list = [], lastAt = 0, native = Element.prototype.animate;
  var bar = null, range, readout, toggle, play;
  function end() { return list.reduce(function (m, a) { try { return Math.max(m, a.effect.getComputedTiming().endTime); } catch (e) { return m; } }, 0); }
  function setAt(frac) { var t = frac * end(); list.forEach(function (a) { try { a.pause(); a.currentTime = t; } catch (e) {} }); readout.textContent = Math.round(frac * 100) + '%  ·  ' + Math.round(t) + ' ms of ' + Math.round(end()); }
  Element.prototype.animate = function () {
    var a = native.apply(this, arguments);
    if (on) {
      var now = performance.now();
      if (now - lastAt > 120) { list = []; range.value = 0; }   /* a new interaction starts a new set */
      lastAt = now; list.push(a); a.pause(); a.currentTime = 0;
      range.disabled = false; play.disabled = false; setAt(+range.value / 1000);
    }
    return a;
  };
  function build() {
    bar = document.createElement('div'); bar.className = 'rv rv-scrub';
    bar.innerHTML = '<style>.rv-scrub{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:2147483000;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;justify-content:center;width:min(94vw,520px);padding:8px 12px;border-radius:16px;background:#0b57d0;color:#fff;font:600 12px/16px Inter,system-ui,sans-serif;box-shadow:none}' +
      '.rv-scrub button{font:inherit;border:0;border-radius:999px;padding:6px 12px;background:#fff;color:#0b57d0;cursor:pointer}.rv-scrub button[aria-pressed=true]{background:#d3e3fd}.rv-scrub button:disabled{opacity:.5}' +
      '.rv-scrub input{flex:1 1 160px;min-width:120px;accent-color:#fff}.rv-scrub .ro{flex:1 0 100%;text-align:center;font-weight:500;opacity:.9}</style>' +
      '<button type="button" aria-pressed="false" data-t>Scrub Off</button><input type="range" min="0" max="1000" value="0" disabled aria-label="Animation moment"><button type="button" disabled data-p>Play</button><div class="ro">Turn Scrub on, then open the menu or dialog</div>';
    document.body.appendChild(bar);
    toggle = bar.querySelector('[data-t]'); range = bar.querySelector('input'); play = bar.querySelector('[data-p]'); readout = bar.querySelector('.ro');
    toggle.onclick = function () {
      on = !on; toggle.setAttribute('aria-pressed', on); toggle.textContent = on ? 'Scrub On' : 'Scrub Off';
      if (!on) { list.forEach(function (a) { try { a.play(); } catch (e) {} }); list = []; range.disabled = play.disabled = true; range.value = 0; readout.textContent = 'Turn Scrub on, then open the menu or dialog'; }
      else readout.textContent = 'Now open the menu or dialog: it will freeze at 0%';
    };
    range.oninput = function () { setAt(+range.value / 1000); };
    play.onclick = function () { var from = +range.value / 1000 * end(); list.forEach(function (a) { try { a.currentTime = from; a.play(); } catch (e) {} }); readout.textContent = 'Playing…'; };
    /* The bar is driven by window-level listeners that do their own hit-testing, because (1) an open menu closes on any outside tap
       (a capture listener on document), and (2) a modal dialog makes everything outside it inert, so the bar's own controls would
       never receive a tap. Any pointer inside the bar's rectangle is handled here and never reaches the page. */
    var dragging = false;
    var inside = function (el, x, y) { var r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
    var fromX = function (x) { var r = range.getBoundingClientRect(), f = Math.max(0, Math.min(1, (x - r.left) / r.width)); range.value = Math.round(f * 1000); setAt(f); };
    var swallow = function (e) { e.stopPropagation(); e.preventDefault(); };
    window.addEventListener('pointerdown', function (e) {
      if (!inside(bar, e.clientX, e.clientY)) return;
      swallow(e);
      if (inside(toggle, e.clientX, e.clientY)) toggle.onclick();
      else if (inside(play, e.clientX, e.clientY) && !play.disabled) play.onclick();
      else if (inside(range, e.clientX, e.clientY) && !range.disabled) { dragging = true; fromX(e.clientX); }
    }, true);
    window.addEventListener('pointermove', function (e) { if (dragging) { swallow(e); fromX(e.clientX); } }, true);
    ['pointerup', 'pointercancel'].forEach(function (t) { window.addEventListener(t, function (e) { if (dragging) { dragging = false; swallow(e); } }, true); });
    ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'].forEach(function (t) { window.addEventListener(t, function (e) { if (inside(bar, e.clientX != null ? e.clientX : (e.changedTouches && e.changedTouches[0].clientX), e.clientY != null ? e.clientY : (e.changedTouches && e.changedTouches[0].clientY))) swallow(e); }, { capture: true, passive: false });});
    bar.style.touchAction = 'none';
  }
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
