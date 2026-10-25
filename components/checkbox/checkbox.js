/* Checkbox behaviour: data-indeterminate on .s4-checkbox sets input.indeterminate (HTML has no attribute for it).
   The first click clears it, as with the native property. Everything else is the native checkbox. */
S4.register('checkbox', function (scope) {
  S4.util.all(scope, '.s4-checkbox[data-indeterminate]').forEach(function (l) {
    if (!S4.util.once(l, 'checkbox')) return;
    var input = l.querySelector(':scope > input');
    if (!input) return;
    input.indeterminate = true;
    input.addEventListener('change', function () { l.removeAttribute('data-indeterminate'); }, { once: true });
  });
});
