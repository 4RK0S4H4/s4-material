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
  /* room around a surface that its own shadow needs, so a clip that has "finished" opening doesn't cut the shadow and pop it in */
  var SHADOW_ROOM = 48;
  function parseColor(s) {
    var v, m;
    if (/^color\(srgb/.test(s)) { v = s.replace(/^color\(srgb\s*|\)$/g, '').split(/[\s/]+/).map(parseFloat); return [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1]; }
    m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    v = m[1].split(/[\s,/]+/).map(parseFloat);
    return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
  }
  /* what the eye sees at an element: its own background laid over its ancestors' until something is opaque. A transparent
     source (outlined or text button, list row) otherwise makes the morphing surface see-through. */
  function visibleBg(el, fallback) {
    var layers = [], n, c, out = parseColor(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255, 1];
    for (n = el; n; n = n.parentElement) {
      c = parseColor(getComputedStyle(n).backgroundColor);
      if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    if (!layers.length) return fallback;
    out = [out[0], out[1], out[2]];
    for (var i = layers.length - 1; i >= 0; i--) { c = layers[i]; out = [c[0] * c[3] + out[0] * (1 - c[3]), c[1] * c[3] + out[1] * (1 - c[3]), c[2] * c[3] + out[2] * (1 - c[3])]; }
    return 'rgb(' + Math.round(out[0]) + ',' + Math.round(out[1]) + ',' + Math.round(out[2]) + ')';
  }

  /* ---------- container transform ----------
     The source becomes the surface at real size (nothing stretches): the surface is clipped to the source's rect, radius and
     color, then opens to its own shape and color while the source's label fades out (by 30%) and the content fades in (from
     35%). Closing runs it backwards on the calm (critically damped) spring, so it lands exactly on the source, then the
     real source is shown again. */
  function containerTransform(surface, source, opts) {
    opts = opts || {};
    if (!source || !source.isConnected || M.reduced()) return fadeOnly(surface, opts.open);
    var s = rect(source), e = rect(surface);
    if (!s.width || !e.width) return fadeOnly(surface, opts.open);
    var cs = getComputedStyle(source), ce = getComputedStyle(surface);
    var radius = opts.radius || ce.borderTopLeftRadius;
    var from = 'inset(' + (s.top - e.top) + 'px ' + (e.right - s.right) + 'px ' + (e.bottom - s.bottom) + 'px ' + (s.left - e.left) + 'px round ' + cs.borderTopLeftRadius + ')';
    var to = 'inset(-' + SHADOW_ROOM + 'px round calc(' + radius + ' + ' + SHADOW_ROOM + 'px))';
    var bgFrom = visibleBg(source, cs.backgroundColor), bgTo = ce.backgroundColor, blur = ce.backdropFilter;
    /* the source's label rides along inside the surface */
    var ghost = source.cloneNode(true);
    ghost.removeAttribute('id'); ghost.className = 's4-ct-ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.removeAttribute('data-dialog'); ghost.removeAttribute('data-sheet');
    Object.assign(ghost.style, { left: (s.left - e.left) + 'px', top: (s.top - e.top) + 'px', width: s.width + 'px', height: s.height + 'px',
      padding: cs.padding, font: cs.font, color: cs.color, justifyContent: cs.justifyContent, gap: cs.gap,
      border: cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor, borderRadius: cs.borderTopLeftRadius });   /* an outlined source keeps its ring until it fades */
    surface.appendChild(ghost);
    var content = Array.prototype.filter.call(surface.children, function (c) { return c !== ghost; });
    var open = opts.open !== false, name = open ? (opts.spring || 'spatial') : 'spatial-calm';
    source.style.visibility = 'hidden';
    var shape = M.animate(surface, open ? [{ clipPath: from }, { clipPath: to }] : [{ clipPath: to }, { clipPath: from }], name);
    /* color crossfade on the same timeline, with a linear easing so it can't overshoot either color */
    var dur = M.spring(name).duration;
    surface.animate(open ? [{ backgroundColor: bgFrom }, { backgroundColor: bgTo, offset: 0.6 }, { backgroundColor: bgTo }]
                         : [{ backgroundColor: bgTo }, { backgroundColor: bgTo, offset: 0.4 }, { backgroundColor: bgFrom }], { duration: dur, easing: 'linear', fill: 'both' });
    /* glass surfaces arrive with their blur: it fades in with the color instead of popping on when the morph ends */
    if (blur && blur !== 'none') {
      var on = { backdropFilter: blur, webkitBackdropFilter: blur }, off = { backdropFilter: 'none', webkitBackdropFilter: 'none' };
      surface.animate(open ? [off, Object.assign({ offset: 0.4 }, off), on] : [on, Object.assign({ offset: 0.6 }, off), off], { duration: dur, easing: 'linear', fill: 'both' });
    }
    ghost.animate(open ? [{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1, offset: 0.8 }, { opacity: 1 }], { duration: dur, easing: 'linear', fill: 'both' });
    content.forEach(function (c) {
      c.animate(open ? [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.35 }, { opacity: 0 }], { duration: dur, easing: 'linear', fill: 'both' });
    });
    return done(shape).then(function () {
      ghost.remove();
      surface.getAnimations().forEach(function (a) { a.cancel(); });
      content.forEach(function (c) { c.getAnimations().forEach(function (a) { a.cancel(); }); });
      if (open) { /* the source stays hidden while the surface "is" the source */ }
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
