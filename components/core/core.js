/* S4 Orion runtime core: window.S4.
   - S4.register(name, init): components register an init(root) that wires up every instance inside root. Inits run on
     DOMContentLoaded and again for anything added to the page later, so markup works without any app code.
   - S4.motion: springs read from the tokens (so reduced motion is respected automatically) and an animate helper.
   - S4.icon: draws <span class="s4-icon" data-icon="name"> from the registry in assets/icons.js.
   - S4.theme: seed color, light/dark, contrast; optional saving.
   Components never hard-code durations, easings, colors or sizes: they read tokens. */
(function () {
  'use strict';
  if (window.S4 && window.S4.version) return;
  var root = document.documentElement;
  var S4 = window.S4 = { version: '1.0.0' };
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';

  /* ---------- registry and auto-init ---------- */
  var inits = [];
  S4.register = function (name, init) { inits.push({ name: name, init: init }); if (ready) init(document); };
  S4.init = function (scope) { inits.forEach(function (c) { try { c.init(scope || document); } catch (e) { console.error('S4 ' + c.name, e); } }); drawIcons(scope || document); };
  var ready = false;
  function boot() {
    ready = true; S4.init(document);
    new MutationObserver(function (list) {
      list.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1 && !n.closest('[data-s4-skip]')) S4.init(n); }); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot);

  /* ---------- small utilities ---------- */
  S4.util = {
    emit: function (el, name, detail) { el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); },
    css: function (name, el) { return getComputedStyle(el || root).getPropertyValue(name).trim(); },
    /* each component instance is wired once */
    once: function (el, key) { var k = 's4' + key; if (el.dataset[k]) return false; el.dataset[k] = '1'; return true; },
    all: function (scope, sel) { var out = Array.prototype.slice.call(scope.querySelectorAll ? scope.querySelectorAll(sel) : []); if (scope.matches && scope.matches(sel)) out.unshift(scope); return out; }
  };

  /* ---------- motion ---------- */
  var reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var SPRING_TOKEN = function (name) { return /-calm$/.test(name) ? '--s4-motion-spring-' + name : '--md-sys-motion-spring-' + name; };
  S4.motion = {
    /* { duration (ms), easing } for a spring name: fast-spatial, spatial, slow-spatial, fast-effects, effects, slow-effects, *-calm */
    spring: function (name) {
      var t = SPRING_TOKEN(name), d = parseFloat(S4.util.css(t + '-duration')) || 0;
      var spatial = /spatial/.test(name);
      if (spatial && (reduce.matches || root.dataset.motion === 'reduced')) d = 0;
      return { duration: d, easing: S4.util.css(t) || 'ease' };
    },
    reduced: function () { return reduce.matches || root.dataset.motion === 'reduced'; },
    /* el.animate with a spring; resolves when done. opts may override fill, delay, direction. */
    animate: function (el, keyframes, name, opts) {
      var s = S4.motion.spring(name), o = { duration: s.duration, easing: s.easing, fill: 'both' };
      for (var k in opts) o[k] = opts[k];
      if (!o.duration) { o.duration = 0; }
      return el.animate(keyframes, o);
    }
  };

  /* ---------- icons ---------- */
  function drawIcons(scope) {
    var reg = window.S4_ICONS; if (!reg) return;
    S4.util.all(scope, '.s4-icon[data-icon]').forEach(function (el) {
      var name = el.getAttribute('data-icon');
      if (el.dataset.s4Drawn === name) return;
      var body = reg.icons[name];
      if (!body) { console.warn('S4: unknown icon "' + name + '"'); return; }
      el.innerHTML = '<svg viewBox="' + reg.viewBox + '" aria-hidden="true" focusable="false">' + body + '</svg>';
      el.dataset.s4Drawn = name;
      if (!el.hasAttribute('aria-label')) el.setAttribute('aria-hidden', 'true');
    });
  }
  S4.icon = {
    set: function (el, name) { el.setAttribute('data-icon', name); drawIcons(el); },
    add: function (map) { window.S4_ICONS = window.S4_ICONS || { viewBox: '0 0 24 24', icons: {} }; for (var k in map) window.S4_ICONS.icons[k] = map[k]; drawIcons(document); },
    names: function () { return Object.keys((window.S4_ICONS || {}).icons || {}); }
  };

  /* ---------- theme ----------
     S4.theme({ seed: '#0b57d0', variant: 'vibrant', mode: 'system'|'light'|'dark', contrast: 0|0.5|1, save: 'app-key' })
     Monochrome (no seed) uses the roles already in tokens.css. A seed generates every M3 role with Material Color
     Utilities (m3color.js, loaded on demand) for light and dark, written in the same zero-specificity blocks as
     tokens.css, so device dark mode and high contrast keep working. */
  var state = { seed: null, variant: 'vibrant', mode: 'system', contrast: 0 };
  /* m3color.js sits next to orion.js (skill assets) or in components/assets/ (repo); <script data-m3color="..."> overrides. */
  var m3src = (document.currentScript && document.currentScript.dataset.m3color) ||
    (scriptSrc.indexOf('/components/') >= 0 ? scriptSrc.slice(0, scriptSrc.indexOf('/components/')) + '/components/assets/m3color.js'
                                           : scriptSrc.replace(/[^/]*$/, '') + 'm3color.js');
  function loadColor(cb) {
    if (window.M3Color) return cb();
    var s = document.createElement('script'); s.src = m3src; s.onload = cb;
    s.onerror = function () { console.error('S4: could not load ' + m3src + ' (set data-m3color on the orion.js script tag)'); };
    document.head.appendChild(s);
  }
  function rolesCss(scheme) { return Object.keys(scheme).map(function (k) { return '--md-sys-color-' + k + ':' + scheme[k]; }).join(';'); }
  function writeColor() {
    var el = document.getElementById('s4-dynamic-color');
    if (!state.seed) { if (el) el.remove(); return; }
    loadColor(function () {
      var M = window.M3Color, c = state.contrast >= 1 ? 1 : state.contrast;
      var L = M.scheme(state.seed, state.variant, false, c), D = M.scheme(state.seed, state.variant, true, c);
      var LH = M.scheme(state.seed, state.variant, false, 1), DH = M.scheme(state.seed, state.variant, true, 1);
      var W = function (s) { return ':where(' + s + ')'; };
      var css = '@layer s4.tokens{' +
        W(':root') + '{' + rolesCss(L) + '}' +
        '@media (prefers-color-scheme: dark){' + W(':root:not([data-theme="light"])') + '{' + rolesCss(D) + '}}' +
        W(':root[data-theme="dark"]') + '{' + rolesCss(D) + '}' +
        '@media (prefers-contrast: more){' + W(':root:not([data-contrast])') + '{' + rolesCss(LH) + '}}' +
        W(':root[data-contrast="high"]') + '{' + rolesCss(LH) + '}' +
        '@media (prefers-color-scheme: dark) and (prefers-contrast: more){' + W(':root:not([data-theme="light"]):not([data-contrast])') + '{' + rolesCss(DH) + '}}' +
        '@media (prefers-color-scheme: dark){' + W(':root:not([data-theme="light"])[data-contrast="high"]') + '{' + rolesCss(DH) + '}}' +
        W(':root[data-theme="dark"][data-contrast="high"]') + '{' + rolesCss(DH) + '}}';
      if (!el) { el = document.createElement('style'); el.id = 's4-dynamic-color'; document.head.appendChild(el); }
      el.textContent = css;
      metaThemeColor();
      S4.util.emit(document, 's4-theme', S4.theme());
    });
  }
  function metaThemeColor() {
    requestAnimationFrame(function () {
      var m = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
      m.content = S4.util.css('--md-sys-color-surface');
    });
  }
  S4.theme = function (opts) {
    if (!opts) return { seed: state.seed, variant: state.variant, mode: state.mode, contrast: state.contrast };
    var colorChanged = false;
    if ('seed' in opts) { state.seed = opts.seed && String(opts.seed).toLowerCase() !== '#000000' ? opts.seed : null; colorChanged = true; }
    if (opts.variant) { state.variant = opts.variant; colorChanged = true; }
    if (opts.mode) { state.mode = opts.mode; if (opts.mode === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', opts.mode); }
    if ('contrast' in opts) {
      state.contrast = +opts.contrast || 0; colorChanged = true;
      if (state.contrast >= 1) root.setAttribute('data-contrast', 'high');
      else if (state.contrast >= 0.5) root.setAttribute('data-contrast', 'medium');
      else root.setAttribute('data-contrast', 'standard');
    }
    if (colorChanged) writeColor(); else { metaThemeColor(); S4.util.emit(document, 's4-theme', S4.theme()); }
    var key = opts.save || S4.theme.key;
    if (key) { S4.theme.key = key; try { localStorage.setItem(key, JSON.stringify(S4.theme())); } catch (e) {} }
    return S4.theme();
  };
  /* Apply a saved theme (or the defaults on a first visit) and keep saving changes under key. Returns true if one was saved. */
  S4.theme.restore = function (key, defaults) {
    var saved = null; try { saved = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    S4.theme.key = key;
    var t = saved || defaults || {};
    var o = {}; for (var k in t) o[k] = t[k];
    S4.theme(o);
    return !!saved;
  };
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', metaThemeColor);
})();
