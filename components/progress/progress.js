/* Progress behaviour: <div class="s4-progress" [data-type="circular"] [data-value="0.6"] aria-label="…">
   Sets role="progressbar", aria-valuemin/max/now (0–100) and --_value from data-value (0–1, clamped); removes
   aria-valuenow when there's no data-value (indeterminate). Draws the SVG for circular indicators. Changing data-value
   later (el.dataset.value = 0.8) updates everything and animates the indicator. */
S4.register('progress', function (scope) {
  var SVG = '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">' +
    '<circle class="s4-progress-track" cx="20" cy="20" r="18" pathLength="100"></circle>' +
    '<circle class="s4-progress-indicator" cx="20" cy="20" r="18" pathLength="100"></circle></svg>';

  function sync(el) {
    if (el.dataset.type === 'circular' && !el.querySelector(':scope > svg')) el.insertAdjacentHTML('afterbegin', SVG);
    el.setAttribute('role', 'progressbar');
    el.setAttribute('aria-valuemin', '0');
    el.setAttribute('aria-valuemax', '100');
    var raw = el.getAttribute('data-value');
    if (raw === null || raw === '' || isNaN(+raw)) {
      el.removeAttribute('aria-valuenow');
      el.style.removeProperty('--_value');
      return;
    }
    var v = Math.min(1, Math.max(0, +raw));
    el.style.setProperty('--_value', String(v));
    el.setAttribute('aria-valuenow', String(Math.round(v * 100)));
  }

  S4.util.all(scope, '.s4-progress').forEach(function (el) {
    if (!S4.util.once(el, 'progress')) return;
    sync(el);
    new MutationObserver(function () { sync(el); }).observe(el, { attributes: true, attributeFilter: ['data-value', 'data-type'] });
  });
});
