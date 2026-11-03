/* Theme controls for component reference pages: builds a bar of connected button groups for theme, contrast and seed. */
(function () {
  var bar = document.querySelector('.ex-bar'); if (!bar) return;
  function group(label, key, opts) {
    var w = document.createElement('div'); w.className = 'ex-ctl'; w.textContent = label;
    var g = document.createElement('div'); g.className = 's4-button-group'; g.setAttribute('data-connected', ''); g.setAttribute('aria-label', label);
    opts.forEach(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 's4-button'; b.dataset.size = 'xs'; b.dataset.variant = 'tonal';
      b.textContent = o[0];
      b.addEventListener('click', function () { var t = {}; t[key] = o[1]; S4.theme(t); sync(); });
      g.appendChild(b);
    });
    /* pressed state follows the theme, whoever changed it (a swatch on the page, a saved theme) */
    function norm(v) { return v == null || v === '' ? 'none' : String(v).toLowerCase(); }
    function sync() {
      var cur = norm((S4.theme() || {})[key]);
      Array.prototype.forEach.call(g.children, function (x, i) { x.setAttribute('aria-pressed', String(norm(opts[i][1]) === cur)); });
    }
    sync();
    document.addEventListener('s4-theme', sync);
    w.appendChild(g); bar.appendChild(w);
  }
  group('Theme', 'mode', [['Device', 'system'], ['Light', 'light'], ['Dark', 'dark']]);
  group('Contrast', 'contrast', [['Standard', 0], ['Medium', 0.5], ['High', 1]]);
  group('Color', 'seed', [['Mono', null], ['Indigo', '#4f46e5'], ['Teal', '#00796b']]);
})();
