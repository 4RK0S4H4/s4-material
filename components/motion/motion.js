/* S4 Orion transition patterns (decision 0001, Transitions Lab):
     S4.transition.containerTransform(surface, source, { open, radius })  dialogs from buttons, sheets from FABs, details from rows
     S4.transition.unfold(menu, { open, from: 'top'|'bottom' })            menus
     S4.transition.sharedAxis(outView, inView, direction)                   switching sibling views (tabs, destinations, steps)
     S4.transition.slide(el, { open, edge: 'bottom'|'end'|'start' })        sheets and snackbars from the edge where they live
   All timings come from the spring tokens through S4.motion; under reduced motion spatial movement is instant and fades remain.
   Each returns a Promise that resolves when the transition has finished. */
(function () {
  var S4 = window.S4, M = S4.motion;
  var done = function (a) { return a && a.finished ? a.finished.catch(function () {}) : Promise.resolve(); };
  function rect(el) { return el.getBoundingClientRect(); }
  /* room around a menu that its own shadow needs, so a clip that has "finished" opening doesn't cut the shadow and pop it in */
  var SHADOW_ROOM = 48;
  /* any CSS color (rgb, oklab, color-mix results…) -> [r, g, b, a] through a 1px canvas, so every browser's computed
     color syntax is understood */
  var colors = {}, ctx;
  function rgba(str) {
    if (!str) return null;
    if (colors[str]) return colors[str];
    if (!ctx) { var c = document.createElement('canvas'); c.width = c.height = 1; ctx = c.getContext('2d', { willReadFrequently: true }); }
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = 'rgba(0, 0, 0, 0)'; ctx.fillStyle = str; ctx.fillRect(0, 0, 1, 1);
    var d = ctx.getImageData(0, 0, 1, 1).data;
    return (colors[str] = [d[0], d[1], d[2], d[3] / 255]);
  }
  function rgb(c) { return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  /* what the eye sees at an element: its own background laid over its ancestors' until something is opaque. A transparent
     source (outlined or text button, list row) otherwise makes the morphing surface see-through. */
  function visibleBg(el) {
    var layers = [], n, c, out;
    for (n = el; n; n = n.parentElement) {
      c = rgba(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0) { layers.push(c); if (c[3] >= 0.999) break; }
    }
    out = layers.length && layers[layers.length - 1][3] >= 0.999 ? [0, 0, 0] : (rgba(getComputedStyle(document.body).backgroundColor) || [255, 255, 255]).slice(0, 3);
    for (var i = layers.length - 1; i >= 0; i--) { c = layers[i]; out = [c[0] * c[3] + out[0] * (1 - c[3]), c[1] * c[3] + out[1] * (1 - c[3]), c[2] * c[3] + out[2] * (1 - c[3])]; }
    return rgb(out);
  }
  /* the four corner radii of a box as px, for clip-path's "round" (percentages resolved, never more than half the box) */
  function corners(cs, r) {
    var max = Math.min(r.width, r.height) / 2;
    return ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(function (k) {
      var v = String(cs[k]).split(' ')[0], n = parseFloat(v) || 0;
      if (/%$/.test(v)) n = n / 100 * Math.min(r.width, r.height);
      return Math.min(n, max) + 'px';
    }).join(' ');
  }
  /* a spring's easing with its overshoot cut off: a container's edges must land, not bounce past the surface (the
     overshoot would be clipped away anyway, and anything pinned to the edge would wobble) */
  function landing(easing) {
    return /^linear\(/.test(easing) ? easing.replace(/(\(|,)\s*([\d.]+)/g, function (m, sep, v) { return sep + ' ' + Math.min(1, parseFloat(v)); }) : easing;
  }

  /* ---------- container transform ----------
     The source becomes the surface at real size (nothing stretches or reflows). The surface starts moved onto the source
     (its top center on the source's top center) and clipped to the source's rect, corners and color; then it travels
     home while its edges open to its own shape. Everything inside rides on the container: the source's label (carried as
     a copy) and the surface's content move with it, so nothing slides across it while it grows or shrinks. Where the
     source reaches past the surface's box (a wide row opening a narrow dialog), a spread shadow in the container color
     paints the rest. Opening, the label fades out by 30% and the content fades in from 35%; closing, the content is gone
     by 20% and the label is back by 60%. Glass surfaces stay solid (no blur, nothing showing through) while the shape
     moves and turn to glass once it has landed, so nothing behind them is ever seen double; the shadow fades in after
     landing instead of being cut by the clip. Closing runs it backwards on the calm (critically damped) spring, so it
     lands exactly on the source, then the real source is shown again. */
  function containerTransform(surface, source, opts) {
    opts = opts || {};
    if (!source || !source.isConnected || M.reduced()) return fadeOnly(surface, opts.open);
    var s = rect(source), e = rect(surface);
    if (!s.width || !e.width) return fadeOnly(surface, opts.open);
    var cs = getComputedStyle(source), ce = getComputedStyle(surface);
    var open = opts.open !== false, name = open ? (opts.spring || 'spatial') : 'spatial-calm';
    var sp = M.spring(name), dur = sp.duration, geo = { duration: dur, easing: landing(sp.easing), fill: 'both' }, lin = { duration: dur, easing: 'linear', fill: 'both' };
    /* the surface's box moved so its top center sits on the source's top center */
    var dx = (s.left + s.width / 2) - (e.left + e.width / 2), dy = s.top - e.top;
    var at = { top: e.top + dy, left: e.left + dx, right: e.right + dx, bottom: e.bottom + dy };
    var ins = [s.top - at.top, at.right - s.right, at.bottom - s.bottom, s.left - at.left];
    var over = Math.max(0, -Math.min.apply(null, ins));   /* how far the source reaches past the moved box */
    var from = 'inset(' + ins.join('px ') + 'px round ' + corners(cs, s) + ')';
    var to = 'inset(0px 0px 0px 0px round ' + (opts.radius ? [opts.radius, opts.radius, opts.radius, opts.radius].join(' ') : corners(ce, e)) + ')';
    var moved = 'translate(' + dx + 'px, ' + dy + 'px)';
    var bgFrom = visibleBg(source), glass = rgba(ce.backgroundColor) || [0, 0, 0, 1], bgTo = ce.backgroundColor, solid = rgb(glass);
    var blur = ce.backdropFilter || ce.webkitBackdropFilter, glassy = glass[3] < 0.999, shadow = ce.boxShadow;
    var spread = over ? over + parseFloat(corners(ce, e)) + 2 : 0;
    var paint = function (c) { return spread ? '0 0 0 ' + spread + 'px ' + c : 'none'; };
    /* the source's label rides along inside the surface */
    var ghost = source.cloneNode(true);
    ghost.removeAttribute('id'); ghost.className = source.className + ' s4-ct-ghost';   /* keep the source's own classes: its icon sizes, gaps and type must lay out exactly as on the real thing */
    ghost.setAttribute('aria-hidden', 'true'); ghost.removeAttribute('data-dialog'); ghost.removeAttribute('data-sheet');
    Object.assign(ghost.style, { left: (s.left - at.left + surface.scrollLeft) + 'px', top: (s.top - at.top + surface.scrollTop) + 'px', width: s.width + 'px', height: s.height + 'px',
      visibility: 'visible',   /* a closing source is hidden (inline) while its surface is open; the copy must not inherit that */
      background: 'transparent', boxShadow: 'none', transition: 'none', animation: 'none', transform: 'none', translate: 'none', scale: 'none', minWidth: '0', maxWidth: 'none',
      padding: cs.padding, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, fontFeatureSettings: cs.fontFeatureSettings,
      fontVariantNumeric: cs.fontVariantNumeric, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, color: cs.color, justifyContent: cs.justifyContent, gap: cs.gap,
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, borderRadius: cs.borderTopLeftRadius });   /* an outlined source keeps its ring until it fades */
    var overflow = surface.style.overflow, overflowX = surface.style.overflowX;
    if (over) {   /* let the copy show past the box (clipped by the shape) without making the surface scroll sideways */
      if (surface.scrollHeight > surface.clientHeight + 1) surface.style.overflowX = 'hidden'; else surface.style.overflow = 'visible';
    }
    surface.appendChild(ghost);
    /* the copy is laid out outside the source's own container (list, group…): put anything that landed elsewhere back
       exactly where it sits on the source */
    Array.prototype.forEach.call(ghost.children, function (g, i) {   /* parts hidden by the source's context (a collapsed rail hides the FAB's label) stay hidden */
      var o = source.children[i]; if (o && !o.getClientRects().length) g.style.display = 'none';
    });
    var gr = rect(ghost);
    Array.prototype.forEach.call(ghost.children, function (g, i) {
      var o = source.children[i]; if (!o || g.style.display === 'none') return;
      var a = o.getBoundingClientRect(), b = g.getBoundingClientRect(), ox = (a.left - s.left) - (b.left - gr.left), oy = (a.top - s.top) - (b.top - gr.top);
      if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) g.style.translate = ox + 'px ' + oy + 'px';
    });
    var content = Array.prototype.filter.call(surface.children, function (c) { return c !== ghost; });
    source.style.visibility = 'hidden';
    var shape = surface.animate(open ? [{ clipPath: from, transform: moved }, { clipPath: to, transform: 'none' }] : [{ clipPath: to, transform: 'none' }, { clipPath: from, transform: moved }], geo);
    /* color on the same timeline, linear so it can't overshoot either color; solid (no blur, no elevation) while the shape moves */
    var k = function (bg, edge, offset) { var f = { backgroundColor: bg, boxShadow: paint(edge), backdropFilter: 'none', webkitBackdropFilter: 'none' }; if (offset != null) f.offset = offset; return f; };
    surface.animate(open ? [k(bgFrom, bgFrom), k(solid, solid, 0.5), k(solid, solid)]
      : [{ backgroundColor: bgTo, boxShadow: shadow, backdropFilter: blur, webkitBackdropFilter: blur },
         { backgroundColor: solid, boxShadow: shadow, backdropFilter: blur, webkitBackdropFilter: blur, offset: 0.15 }, k(solid, solid, 0.1501), k(solid, solid, 0.5), k(bgFrom, bgFrom)], lin);
    ghost.animate(open ? [{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0, offset: 0.2 }, { opacity: 1, offset: 0.6 }, { opacity: 1 }], lin);
    content.forEach(function (c) {
      c.animate(open ? [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.2 }, { opacity: 0 }], lin);
    });
    return done(shape).then(function () {
      ghost.remove();
      surface.style.overflow = overflow; surface.style.overflowX = overflowX;
      surface.getAnimations().forEach(function (a) { a.cancel(); });
      content.forEach(function (c) { c.getAnimations().forEach(function (a) { a.cancel(); }); });
      if (open) {
        /* the source stays hidden while the surface "is" the source. Landed: the shadow rises and glass turns clear (the
           blur comes on under a still-solid surface, so it never pops) */
        var o = { duration: M.spring('effects').duration, easing: 'linear' };
        if (shadow && shadow !== 'none') surface.animate([{ boxShadow: 'none' }, { boxShadow: shadow }], o);
        if (glassy) surface.animate([{ backgroundColor: solid }, { backgroundColor: bgTo }], o);
      }
      else { surface.style.visibility = 'hidden'; source.style.visibility = ''; }
    });
  }
  function fadeOnly(el, open) {
    return done(M.animate(el, open !== false ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], open !== false ? 'effects' : 'fast-effects'))
      .then(function () { el.getAnimations().forEach(function (a) { a.cancel(); }); if (open === false) el.style.visibility = 'hidden'; });
  }
  /* call after the surface is hidden/closed so the next open starts clean */
  function restore(surface, source) { surface.style.visibility = ''; if (source) source.style.visibility = ''; }

  /* ---------- unfold: a menu's own shape opens from its anchored edge; items don't move ---------- */
  function unfold(el, opts) {
    opts = opts || {};
    var up = opts.from === 'bottom', r = getComputedStyle(el).borderTopLeftRadius;
    if (opts.open === false) return done(M.animate(el, [{ opacity: 1 }, { opacity: 0 }], 'fast-effects'));
    var closed = up ? 'inset(100% 0 0 0 round ' + r + ')' : 'inset(0 0 100% 0 round ' + r + ')';
    var opened = 'inset(-' + SHADOW_ROOM + 'px round calc(' + r + ' + ' + SHADOW_ROOM + 'px))';
    M.animate(el, [{ opacity: 0 }, { opacity: 1 }], 'fast-effects');
    return done(M.animate(el, [{ clipPath: closed }, { clipPath: opened }], 'spatial')).then(function () {
      el.getAnimations().forEach(function (a) { a.cancel(); });
    });
  }

  /* ---------- shared axis: switching sibling views (tabs, destinations, steps) ----------
     The old view slides 30px away and fades out (fast-effects), then the new one is shown, slides in from the side you're
     heading and fades in (spatial / effects). onSwap (optional) runs at the moment of the swap. Views stay in normal page flow: only one is visible at a time (hidden).
     dir 1 = forward (new comes from the end side), -1 = back. state: an object kept per container so an interrupted switch
     is cancelled cleanly. */
  function sharedAxis(from, to, dir, state, onSwap) {
    state = state || {};
    (state.anims || []).forEach(function (a) { a.cancel(); });
    state.anims = [];
    var dist = M.reduced() ? 0 : (parseFloat(S4.util.css('--s4-motion-pattern-shared-axis-distance')) || 0);
    var d = dist * (dir < 0 ? -1 : 1) * (to && getComputedStyle(to).direction === 'rtl' ? -1 : 1);
    return new Promise(function (resolve) {
      var enter = function () {
        if (from && from !== to) from.hidden = true;
        if (onSwap) onSwap();   /* title and scroll position change here, once the old view is gone */
        if (!to) return resolve();
        to.hidden = false;
        var move = M.animate(to, [{ transform: 'translateX(' + d + 'px)' }, { transform: 'none' }], 'spatial');
        var fade = M.animate(to, [{ opacity: 0 }, { opacity: 1 }], 'effects');
        state.anims = [move, fade];
        Promise.all([move.finished, fade.finished]).then(function () { move.cancel(); fade.cancel(); resolve(); }, resolve);
      };
      if (!from || from.hidden || from === to) return enter();
      var out = M.animate(from, [{ transform: 'none' }, { transform: 'translateX(' + (-d) + 'px)' }], 'spatial');
      var fadeOut = M.animate(from, [{ opacity: 1 }, { opacity: 0 }], 'fast-effects');
      state.anims = [out, fadeOut];
      fadeOut.finished.then(function () { out.cancel(); fadeOut.cancel(); enter(); }, resolve);
    });
  }

  /* ---------- slide from edge ---------- */
  function slide(el, opts) {
    opts = opts || {};
    var edge = opts.edge || 'bottom', rtl = getComputedStyle(el).direction === 'rtl';
    var off = edge === 'bottom' ? 'translateY(calc(100% + ' + (opts.gap || '0px') + '))'
      : edge === 'end' ? 'translateX(' + (rtl ? '-' : '') + '100%)' : 'translateX(' + (rtl ? '' : '-') + '100%)';
    var open = opts.open !== false;
    var a = M.animate(el, open ? [{ transform: off }, { transform: 'none' }] : [{ transform: 'none' }, { transform: off }], open ? (opts.spring || 'slow-spatial') : 'spatial-calm');
    return done(a).then(function () { if (open) el.getAnimations().forEach(function (x) { x.cancel(); }); });
  }

  S4.transition = { containerTransform: containerTransform, unfold: unfold, sharedAxis: sharedAxis, slide: slide, fade: fadeOnly, restore: restore };
})();
