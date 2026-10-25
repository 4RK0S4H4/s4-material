/* Icon button behaviour: toggle icon buttons.
   <button class="s4-icon-button" data-toggle aria-pressed="false" aria-label="Favorite" data-icon-on="favorite">
   Click flips aria-pressed and fires s4-toggle { pressed }. Optional data-icon-on / data-icon-off swap the icon and
   data-label-on / data-label-off swap the aria-label. Icon buttons in a selecting button group are handled by
   button-group.js. */
S4.register('icon-button', function (scope) {
  S4.util.all(scope, '.s4-icon-button[data-toggle]').forEach(function (b) {
    if (!S4.util.once(b, 'iconButton')) return;
    if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    var icon = b.querySelector('.s4-icon');
    var iconOff = b.dataset.iconOff || (icon && icon.dataset.icon);
    var labelOff = b.dataset.labelOff || b.getAttribute('aria-label');
    var sync = function () {
      var on = b.getAttribute('aria-pressed') === 'true';
      if (icon && b.dataset.iconOn) S4.icon.set(icon, on ? b.dataset.iconOn : iconOff);
      if (b.dataset.labelOn) b.setAttribute('aria-label', on ? b.dataset.labelOn : labelOff);
    };
    b.addEventListener('click', function () {
      var g = b.closest('.s4-button-group[data-select]');
      if (g) { setTimeout(sync); return; }
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
      sync();
      S4.util.emit(b, 's4-toggle', { pressed: b.getAttribute('aria-pressed') === 'true' });
    });
    sync();
  });
});
