/* Slider behaviour: draws the handle, value label and stops for .s4-slider > input[type=range], keeps --_value (0..1)
   and --_steps in sync, and fires s4-change { value } on the slider for every change (the native input and change
   events still fire as usual). data-prefix / data-suffix format the value label and aria-valuetext. */
S4.register('slider', function (scope) {
  S4.util.all(scope, '.s4-slider').forEach(function (s) {
    if (!S4.util.once(s, 'slider')) return;
    var input = s.querySelector(':scope > input[type="range"]');
    if (!input) return;
    var mk = function (cls, parent) { var e = document.createElement('span'); e.className = cls; e.setAttribute('aria-hidden', 'true'); (parent || s).appendChild(e); return e; };
    var stops = mk('s4-slider-stops');
    var handle = mk('s4-slider-handle');
    var label = mk('s4-slider-label', handle);
    s.insertBefore(stops, input); s.insertBefore(handle, input);   /* the input stays last, on top */
    var fmt = function (v) {
      var n = Number(v), dec = (String(input.step).split('.')[1] || '').length;
      var txt = n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return (s.dataset.prefix || '') + txt + (s.dataset.suffix || '');
    };
    var sync = function () {
      var min = parseFloat(input.min || 0), max = parseFloat(input.max || 100), step = parseFloat(input.step) || 1;
      var v = parseFloat(input.value);
      s.style.setProperty('--_value', max > min ? (v - min) / (max - min) : 0);
      s.style.setProperty('--_steps', Math.max(1, Math.round((max - min) / step)));
      label.textContent = fmt(v);
      if (s.dataset.prefix || s.dataset.suffix) input.setAttribute('aria-valuetext', fmt(v));
    };
    input.addEventListener('input', function () { sync(); S4.util.emit(s, 's4-change', { value: input.valueAsNumber }); });
    /* keep the label up while a touch drag is in progress (no :active on some touch browsers) */
    input.addEventListener('pointerdown', function () { s.setAttribute('data-dragging', ''); });
    ['pointerup', 'pointercancel', 'blur'].forEach(function (t) { input.addEventListener(t, function () { s.removeAttribute('data-dragging'); }); });
    sync();
  });
});
