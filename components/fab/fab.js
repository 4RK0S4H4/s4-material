/* Extended FAB: the label folds with data-collapsed by animating max-width. A fixed cap (20em) made the fold wait while
   the cap shrank down to the label's real width and then snap shut (and open the same way backwards), so the real width
   is measured and handed to the CSS as --_label-w. Re-measured when fonts load, when the label's text changes, and when a label first measured hidden is shown. */
S4.register('fab', function (scope) {
  S4.util.all(scope, '.s4-fab-label').forEach(function (label) {
    if (!S4.util.once(label, 'fabLabel')) return;
    function measure() {
      label.style.setProperty('--_label-w', 'none');
      var w = label.scrollWidth;
      if (w) label.style.setProperty('--_label-w', Math.ceil(w) + 'px'); else label.style.removeProperty('--_label-w');
    }
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    new MutationObserver(measure).observe(label, { childList: true, characterData: true, subtree: true });
    if (window.ResizeObserver) new ResizeObserver(function () { if (!label.style.getPropertyValue('--_label-w')) measure(); }).observe(label);   /* first shown (it was in a hidden view) */
  });
});
