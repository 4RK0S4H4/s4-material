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
    if (!opts.keepSource) source.style.visibility = 'hidden';   /* keepSource: the real button stays put under the copy that detaches from it */
    var shape = surface.animate(open ? [{ clipPath: from, transform: moved }, { clipPath: to, transform: 'none' }] : [{ clipPath: to, transform: 'none' }, { clipPath: from, transform: moved }], geo);
    /* color on the same timeline, linear so it can't overshoot either color; solid (no blur, no elevation) while the shape moves */
    var k = function (bg, edge, offset) { var f = { backgroundColor: bg, boxShadow: paint(edge), backdropFilter: 'none', webkitBackdropFilter: 'none' }; if (offset != null) f.offset = offset; return f; };
    surface.animate(open ? [k(bgFrom, bgFrom), k(solid, solid, 0.5), glassy ? { backgroundColor: bgTo, boxShadow: shadow, backdropFilter: blur, webkitBackdropFilter: blur } : k(solid, solid)]
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
        var o = { duration: M.spring('fast-effects').duration, easing: 'linear' };
        if (shadow && shadow !== 'none' && !glassy) surface.animate([{ boxShadow: 'none' }, { boxShadow: shadow }], o);
      }
      else { surface.style.visibility = 'hidden'; if (!opts.keepSource) source.style.visibility = ''; }
    });
  }
  function fadeOnly(el, open) {
    return done(M.animate(el, open !== false ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], open !== false ? 'effects' : 'fast-effects'))
      .then(function () { el.getAnimations().forEach(function (a) { a.cancel(); }); if (open === false) el.style.visibility = 'hidden'; });
  }
  /* call after the surface is hidden/closed so the next open starts clean */
  function restore(surface, source) { surface.style.visibility = ''; if (source) source.style.visibility = ''; }

  /* ---------- unfold: a menu settles in from its anchor, quietly ----------
     The menu is revealed from the edge that faces its anchor (about half of its height shows at the start), rises 6px and
     fades in; the items fade in a little after. On the spatial spring, so it feels like the container transforms, but
     with far less travel, so nothing seems to come from nowhere. Closing is the same on the calm spring, shorter.
     opts: open, from ('top'|'bottom'), anchor, align */
  /* ---------- emerge: the menu's shape grows out from a layer BELOW its button ----------
     The owner's "D, but from underneath": the container transform with the button staying, except the moving shape sits in a lower
     layer than the button instead of a higher one. A menu is in the browser's top layer, which always paints above the page, so the real
     menu cannot be below the button. Instead a plain layer (a div, not in the top layer) is put in the button's own stacking context
     just behind it (the button is lifted one step above it for the duration); that layer starts as exactly the button's rectangle,
     color and corners and grows into the menu's final box. The real menu stays hidden until the layer has landed, then takes over
     at the same place, still solid, the options fade in and the color fades to glass. Closing is the same backwards.
     The button is never copied, moved or covered (its label stays put), and the layer has no backdrop-filter, so WebKit's
     "clip-path does not clip backdrop-filter" problem cannot happen. Blur is never animated: it comes on under the solid menu. */
  function emerge(surface, source, opts) {
    var open = opts.open !== false;
    if (!source || !source.isConnected || M.reduced()) return fadeOnly(surface, open);
    var sp = M.spring(open ? 'spatial' : 'spatial-calm'), geo = { duration: sp.duration, easing: landing(sp.easing), fill: 'both' };
    var fx = { duration: M.spring('fast-effects').duration, easing: 'linear', fill: 'both' };
    if (open) {   /* never narrower than the button */
      surface.style.minWidth = Math.max(rect(source).width, parseFloat(getComputedStyle(surface).minWidth) || 0) + 'px';
      if (S4.position) S4.position(surface, source, { align: opts.align });
    }
    var s = rect(source), e = rect(surface), cs = getComputedStyle(source), ce = getComputedStyle(surface);
    var glass = rgba(ce.backgroundColor) || [0, 0, 0, 1], bgTo = ce.backgroundColor, solid = rgb(glass), glassy = glass[3] < 0.999;
    /* what the layer starts as: the button's own fill; a button with none (a plain icon button) starts as its hover circle, the faint
       tint of its own color over what is behind it, so it is the hover shape that grows into the menu */
    var own = rgba(cs.backgroundColor), page = rgba(visibleBg(source)) || [255, 255, 255, 1], fg = rgba(cs.color) || [0, 0, 0, 1];
    var bgFrom = own && own[3] > 0.5 ? cs.backgroundColor : rgb([0, 1, 2].map(function (i) { return page[i] * 0.88 + fg[i] * 0.12; }));
    var content = Array.prototype.slice.call(surface.children);
    /* the layer, right behind the button */
    var layer = document.createElement('div'); layer.setAttribute('aria-hidden', 'true'); layer.className = 's4-emerge-layer';
    var box = function (r, radius) { return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: radius }; };
    /* the layer starts a hair INSIDE the button, as a pill: a button squares off while pressed and springs back, and anything of the layer outside that
       moving edge would show as a glitch; a pill 2px smaller always stays hidden behind it */
    var IN = 2, sIn = { left: s.left + IN, top: s.top + IN, width: Math.max(2, s.width - 2 * IN), height: Math.max(2, s.height - 2 * IN) };
    var rBtn = Math.min(sIn.width, sIn.height) / 2 + 'px', rMenu = ce.borderTopLeftRadius;
    Object.assign(layer.style, { position: 'fixed', margin: '0', padding: '0', border: '0', pointerEvents: 'none', zIndex: '0', boxShadow: 'none' }, box(open ? sIn : e, open ? rBtn : rMenu));
    var posBefore = source.style.position, zBefore = source.style.zIndex, cpos = cs.position;
    if (cpos === 'static') source.style.position = 'relative';
    source.style.zIndex = String((parseInt(cs.zIndex, 10) || 0) + 1);
    layer.style.zIndex = String(parseInt(cs.zIndex, 10) || 0);
    source.parentNode.insertBefore(layer, source);
    var restore = function () { layer.remove(); source.style.position = posBefore; source.style.zIndex = zBefore; };
    var hideMenu = function () { surface.style.visibility = 'hidden'; }, showMenu = function () { surface.style.visibility = ''; };
    var flat = { backdropFilter: 'none', webkitBackdropFilter: 'none' };
    var D = geo.duration, F = fx.duration, glassIn = function () {
      /* a short hold before the fade: the first frames with the blur on are the expensive ones (the browser builds the blur layer), and the surface is solid and unchanging while it does */
      return glassy ? done(surface.animate([{ backgroundColor: solid }, { backgroundColor: bgTo }], { duration: fx.duration, delay: 80, easing: 'linear', fill: 'both' })).then(function () { surface.getAnimations().forEach(function (a) { a.cancel(); }); }) : Promise.resolve();
    };
    if (open) {
      hideMenu();
      var grow = layer.animate([box(sIn, rBtn), box(e, rMenu)], geo);
      layer.animate([{ backgroundColor: bgFrom }, { backgroundColor: solid }], { duration: D, easing: 'linear', fill: 'both' });
      layer.animate([{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1 }], { duration: D, easing: 'linear', fill: 'both' });
      return done(grow).then(function () {
        /* hand over: the menu appears exactly where the layer is, solid; same task, so there is no frame without a shape */
        var hold = surface.animate([{ backgroundColor: solid, backdropFilter: 'none', webkitBackdropFilter: 'none' }, { backgroundColor: solid, backdropFilter: 'none', webkitBackdropFilter: 'none' }], { duration: 1, fill: 'forwards' });
        showMenu();
        var first = surface.querySelector('.s4-menu-item[aria-checked="true"]') || surface.querySelector('.s4-menu-item:not(:disabled)');   /* the menu was hidden when it opened, so focus could not move into it then */
        if (first && first !== document.activeElement) first.focus({ preventScroll: true });
        content.forEach(function (c) { c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: F, easing: 'linear', fill: 'backwards' }); });
        restore();
        hold.cancel();   /* the blur comes on here, under a surface that is still solid */
        return glassIn();
      });
    }
    /* close: color to solid, then the layer takes over from the menu and folds back into the button */
    var toSolid = glassy ? surface.animate([{ backgroundColor: bgTo }, { backgroundColor: solid }], fx) : null;
    layer.style.visibility = 'hidden';
    return (toSolid ? done(toSolid) : Promise.resolve()).then(function () {
      content.forEach(function (c) { c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: F, easing: 'linear', fill: 'both' }); });
      layer.style.backgroundColor = solid; layer.style.visibility = '';
      var shrink = layer.animate([box(e, rMenu), box(sIn, rBtn)], geo);
      layer.animate([{ backgroundColor: solid }, { backgroundColor: bgFrom }], { duration: D, easing: 'linear', fill: 'both' });
      layer.animate([{ opacity: 1 }, { opacity: 1, offset: 0.9 }, { opacity: 0 }], { duration: D, easing: 'linear', fill: 'both' });
      hideMenu();
      if (toSolid) toSolid.cancel();
      return done(shrink).then(function () { restore(); surface.getAnimations().forEach(function (a) { a.cancel(); }); content.forEach(function (c) { c.getAnimations().forEach(function (a) { a.cancel(); }); }); surface.style.minWidth = ''; });
    });
  }

  /* ---------- expand in place: the button's shape grows into the menu, one solid piece ----------
     The menu is placed ON its button (same top-start corner, or the bottom edge when there is no room below), so the
     surface starts exactly as the button (rect, corners, color) and grows into the menu. The button's label stays where
     it is as the first row (a copy rides in the menu, the real button is hidden under it); the options fade in below.
     Color goes from the button's to the menu's, solid while the shape moves, glass after landing. Closing folds back. */
  function expandMenu(el, anchor, opts) {
    var open = opts.open !== false;
    if (!anchor || M.reduced()) return done(M.animate(el, open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], open ? 'effects' : 'fast-effects'));
    var sp = M.spring(open ? 'spatial' : 'spatial-calm'), geo = { duration: sp.duration, easing: landing(sp.easing), fill: 'both' }, lin = { duration: sp.duration, easing: 'linear', fill: 'both' };
    var a = rect(anchor), cs = getComputedStyle(anchor), ce, e, up = false, ghost = el._s4ghost, reset = function () { el.style.minWidth = el.style.paddingTop = el.style.paddingBottom = ''; };
    if (open) {
      reset(); el.style.minWidth = Math.max(a.width, parseFloat(getComputedStyle(el).minWidth) || 0) + 'px';
      var pad = parseFloat(getComputedStyle(el).paddingTop) || 0;
      el.style.paddingTop = (a.height + pad) + 'px';
      e = rect(el);
      up = a.top + e.height > innerHeight - 8 && a.bottom - e.height > 8;
      if (up) { el.style.paddingTop = ''; el.style.paddingBottom = (a.height + pad) + 'px'; e = rect(el); }
      var end = opts.align === 'end' || (a.left + e.width > innerWidth - 8);
      var left = Math.max(8, Math.min(end ? a.right - e.width : a.left, innerWidth - e.width - 8)), top = up ? a.bottom - e.height : Math.max(8, Math.min(a.top, innerHeight - e.height - 8));
      el.style.left = left + 'px'; el.style.top = top + 'px'; e = rect(el);
      el._s4up = up;
      ghost = el._s4ghost = anchor.cloneNode(true);
      ghost.removeAttribute('id'); ghost.removeAttribute('data-menu'); ghost.className = anchor.className + ' s4-ct-ghost'; ghost.setAttribute('aria-hidden', 'true'); ghost.tabIndex = -1;
      Object.assign(ghost.style, { left: (a.left - e.left) + 'px', top: (a.top - e.top) + 'px', width: a.width + 'px', height: a.height + 'px', visibility: 'visible', background: 'transparent', boxShadow: 'none', transition: 'none', animation: 'none',
        transform: 'none', translate: 'none', scale: 'none', minWidth: '0', maxWidth: 'none', margin: '0', padding: cs.padding, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing, color: cs.color, justifyContent: cs.justifyContent, gap: cs.gap, border: '0', pointerEvents: 'auto', cursor: 'pointer' });
      ghost.addEventListener('click', function (ev) { ev.stopPropagation(); anchor.click(); });
      el.appendChild(ghost);
      el._s4bgFrom = visibleBg(anchor);
    } else { e = rect(el); up = !!el._s4up; }
    ce = getComputedStyle(el);
    var glass = rgba(ce.backgroundColor) || [0, 0, 0, 1], bgTo = ce.backgroundColor, solid = rgb(glass), blur = ce.backdropFilter || ce.webkitBackdropFilter, glassy = glass[3] < 0.999, bgFrom = el._s4bgFrom || solid;
    var from = 'inset(' + (a.top - e.top) + 'px ' + (e.right - a.right) + 'px ' + (e.bottom - a.bottom) + 'px ' + (a.left - e.left) + 'px round ' + corners(cs, a) + ')', to = 'inset(0px round ' + corners(ce, e) + ')';
    var content = Array.prototype.filter.call(el.children, function (c) { return c !== ghost; });
    if (open) anchor.style.visibility = 'hidden';
    var shape = el.animate(open ? [{ clipPath: from }, { clipPath: to }] : [{ clipPath: to }, { clipPath: from }], geo);
    var k = function (bg, offset) { var f = { backgroundColor: bg, backdropFilter: 'none', webkitBackdropFilter: 'none' }; if (offset != null) f.offset = offset; return f; };
    el.animate(open ? [k(bgFrom), k(solid, 0.5), glassy ? { backgroundColor: bgTo, backdropFilter: blur, webkitBackdropFilter: blur } : k(solid)]
      : [{ backgroundColor: bgTo, backdropFilter: blur, webkitBackdropFilter: blur }, { backgroundColor: solid, backdropFilter: blur, webkitBackdropFilter: blur, offset: 0.15 }, k(solid, 0.1501), k(solid, 0.5), k(bgFrom)], lin);
    content.forEach(function (c) {
      c.animate(open ? [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.25 }, { opacity: 0 }], lin);
    });
    return done(shape).then(function () {
      el.getAnimations().forEach(function (x) { x.cancel(); });
      content.forEach(function (c) { c.getAnimations().forEach(function (x) { x.cancel(); }); });
      if (!open) { if (ghost) ghost.remove(); el._s4ghost = null; anchor.style.visibility = ''; reset(); }
    });
  }

  /* the 0008 way, kept as an option (opts.style = 'grow'): the menu's shape starts at the anchor's size and position and grows to the menu */
  function grow(el, opts) {
    var open = opts.open !== false, up = opts.from === 'bottom', anchor = opts.anchor;
    if (!anchor || M.reduced()) return done(M.animate(el, open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], open ? 'effects' : 'fast-effects'));
    var e = rect(el), a = rect(anchor), ca = getComputedStyle(anchor), ce = getComputedStyle(el);
    var w = Math.min(a.width, e.width), h = opts.strip ? Math.min(10, e.height) : Math.min(a.height, e.height);
    var end = opts.align === 'end' || (e.right - a.right < a.left - e.left && Math.abs((e.right - a.right)) < 2);
    var r = Math.min(parseFloat(ca.borderTopLeftRadius) || 0, h / 2, w / 2) + 'px', rEnd = ce.borderTopLeftRadius;
    var top = up ? e.height - h : 0, left = end ? e.width - w : 0;
    var from = 'inset(' + top + 'px ' + (e.width - w - left) + 'px ' + (e.height - h - top) + 'px ' + left + 'px round ' + r + ')';
    var to = 'inset(0px round ' + rEnd + ')';
    var sp = M.spring(open ? 'spatial' : 'spatial-calm'), lin = { duration: sp.duration, easing: 'linear', fill: 'both' };
    var shape = el.animate(open ? [{ clipPath: from }, { clipPath: to }] : [{ clipPath: to }, { clipPath: from }], { duration: sp.duration, easing: landing(sp.easing), fill: 'both' });
    el.animate(open ? [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], lin);
    Array.prototype.forEach.call(el.children, function (c) {
      c.animate(open ? [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.25 }, { opacity: 0 }], lin);
    });
    return done(shape).then(function () {
      el.getAnimations().forEach(function (x) { x.cancel(); });
      Array.prototype.forEach.call(el.children, function (c) { c.getAnimations().forEach(function (x) { x.cancel(); }); });
    });
  }

  function unfold(el, opts) {
    opts = opts || {};
    var style = opts.style || 'emerge';
    if (style === 'emerge') return emerge(el, opts.anchor, opts);
    if (style === 'grow') return grow(el, opts);
    if (style === 'inplace' && opts.anchor) return expandMenu(el, opts.anchor, opts);
    if (style === 'edge') return grow(el, Object.assign({}, opts, { strip: true }));
    if (style === 'transform' && opts.anchor) return containerTransform(el, opts.anchor, { open: opts.open !== false });
    if (style === 'transform-keep' && opts.anchor) return containerTransform(el, opts.anchor, { open: opts.open !== false, keepSource: true });
    var open = opts.open !== false, up = opts.from === 'bottom';
    if (M.reduced()) return done(M.animate(el, open ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], open ? 'effects' : 'fast-effects'));
    var r = getComputedStyle(el).borderTopLeftRadius, dy = up ? 6 : -6;
    var part = up ? 'inset(50% -48px -48px -48px round ' + r + ')' : 'inset(-48px -48px 50% -48px round ' + r + ')';
    var full = 'inset(-48px round ' + r + ')';
    var sp = M.spring(open ? 'spatial' : 'spatial-calm'), lin = { duration: sp.duration, easing: 'linear', fill: 'both' };
    var ease = { duration: sp.duration, easing: landing(sp.easing), fill: 'both' };
    var shape = el.animate(open ? [{ clipPath: part, transform: 'translateY(' + dy + 'px)' }, { clipPath: full, transform: 'none' }] : [{ clipPath: full, transform: 'none' }, { clipPath: part, transform: 'translateY(' + dy + 'px)' }], ease);
    el.animate(open ? [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], lin);
    Array.prototype.forEach.call(el.children, function (c) {
      c.animate(open ? [{ opacity: 0 }, { opacity: 0, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0, offset: 0.4 }, { opacity: 0 }], lin);
    });
    return done(shape).then(function () {
      el.getAnimations().forEach(function (x) { x.cancel(); });
      Array.prototype.forEach.call(el.children, function (c) { c.getAnimations().forEach(function (x) { x.cancel(); }); });
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

  /* ---------- rise: a small, quiet arrival for snackbars: a few pixels up and a fade ---------- */
  function rise(el, opts) {
    var open = !opts || opts.open !== false, dy = M.reduced() ? 0 : 10;
    var a = [{ opacity: open ? 0 : 1, transform: open ? 'translateY(' + dy + 'px) scale(0.97)' : 'none' }, { opacity: open ? 1 : 0, transform: open ? 'none' : 'translateY(' + dy + 'px) scale(0.97)' }];
    var fade = M.animate(el, [{ opacity: a[0].opacity }, { opacity: a[1].opacity }], open ? 'effects' : 'fast-effects');
    var move = M.animate(el, [{ transform: a[0].transform }, { transform: a[1].transform }], open ? 'spatial' : 'fast-effects');
    return Promise.all([done(fade), done(move)]).then(function () { if (open) { fade.cancel(); move.cancel(); } });
  }

  S4.transition = { rise: rise, containerTransform: containerTransform, unfold: unfold, sharedAxis: sharedAxis, slide: slide, fade: fadeOnly, restore: restore };
})();
