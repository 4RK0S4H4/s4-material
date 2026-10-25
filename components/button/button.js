/* Button behaviour: toggle buttons. <button class="s4-button" data-toggle aria-pressed="false">
   Click flips aria-pressed and fires s4-toggle { pressed }. Optional data-label-on / data-label-off swap the text label;
   data-icon-on / data-icon-off swap the icon. Buttons in a connected group are handled by button-group.js. */
S4.register('button', function (scope) {
  S4.util.all(scope, '.s4-button[data-toggle]').forEach(function (b) {
    if (!S4.util.once(b, 'button')) return;
    if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', 'false');
    var sync = function () {
      var on = b.getAttribute('aria-pressed') === 'true';
      var icon = b.querySelector('.s4-icon'), label = b.querySelector('.s4-button-label');
      if (icon && b.dataset.iconOn) S4.icon.set(icon, on ? b.dataset.iconOn : b.dataset.iconOff || icon.dataset.icon);
      if (label && b.dataset.labelOn) label.textContent = on ? b.dataset.labelOn : b.dataset.labelOff || label.textContent;
    };
    b.addEventListener('click', function () {
      if (b.closest('.s4-button-group')) return;
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
      sync();
      S4.util.emit(b, 's4-toggle', { pressed: b.getAttribute('aria-pressed') === 'true' });
    });
    sync();
  });
});
