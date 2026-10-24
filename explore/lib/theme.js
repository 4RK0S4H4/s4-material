/* Color themes for the review demos.
   'mono'      Material Color Utilities SchemeMonochrome (black and white)
   'mono-red'  monochrome everywhere, with the primary family taken from a red seed (fidelity, so the red stays true)
   '#rrggbb'   any seed, vibrant scheme
   Needs m3color.js (window.M3Color). */
window.S4Theme = (function () {
  var RED = '#d32f2f';
  var PRIMARY_ROLES = ['primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary',
    'primary-fixed', 'primary-fixed-dim', 'on-primary-fixed', 'on-primary-fixed-variant'];
  var NAMES = { 'mono': 'Mono', 'mono-red': 'Mono + Red' };
  function roles(seed, dark) {
    if (seed === 'mono' || seed === '#000000') return M3Color.scheme('#000000', 'monochrome', dark, 0);
    if (seed === 'mono-red') {
      var base = M3Color.scheme('#000000', 'monochrome', dark, 0), red = M3Color.scheme(RED, 'fidelity', dark, 0);
      PRIMARY_ROLES.forEach(function (k) { base[k] = red[k]; });
      return base;
    }
    return M3Color.scheme(seed, 'vibrant', dark, 0);
  }
  function apply(seed, mode) {
    var s = roles(seed, mode === 'dark'), css = ':root{';
    for (var k in s) css += '--md-sys-color-' + k + ':' + s[k] + ';';
    var el = document.getElementById('dyn'); if (!el) { el = document.createElement('style'); el.id = 'dyn'; document.head.appendChild(el); }
    el.textContent = css + '}'; document.documentElement.dataset.theme = mode;
  }
  return { roles: roles, apply: apply, names: NAMES, red: RED };
})();
