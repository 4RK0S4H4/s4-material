/* Theme controls for component reference pages: builds a bar of connected button groups for theme, contrast and seed. */
(function () {
  var bar = document.querySelector('.ex-bar'); if (!bar) return;
  function group(label, key, opts) {
    var w = document.createElement('div'); w.className = 'ex-ctl'; w.textContent = label;
    var g = document.createElement('div'); g.className = 's4-button-group'; g.setAttribute('data-connected', ''); g.setAttribute('aria-label', label);
    opts.forEach(function (o, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 's4-button'; b.dataset.size = 'xs'; b.dataset.variant = 'tonal';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); b.textContent = o[0];
      b.addEventListener('click', function () { g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); var t = {}; t[key] = o[1]; S4.theme(t); });
      g.appendChild(b);
    });
    w.appendChild(g); bar.appendChild(w);
  }
  group('Theme', 'mode', [['Device', 'system'], ['Light', 'light'], ['Dark', 'dark']]);
  group('Contrast', 'contrast', [['Standard', 0], ['Medium', 0.5], ['High', 1]]);
  group('Color', 'seed', [['Mono', null], ['Indigo', '#4f46e5'], ['Teal', '#00796b']]);
})();
