/* Bottom sheet drag to dismiss: drag the handle (or the sheet's top area) down; past a third of its height, or with a quick
   flick, it closes (S4.sheet.close fires s4-close with value "drag"); otherwise it springs back. Opening and closing
   themselves are in dialog.js, shared with dialogs. */
S4.register('sheet', function (scope) {
  S4.util.all(scope, 'dialog.s4-bottom-sheet').forEach(function (sheet) {
    if (!S4.util.once(sheet, 'sheetDrag')) return;
    var startY = 0, lastY = 0, lastT = 0, v = 0, dragging = false;
    sheet.addEventListener('pointerdown', function (e) {
      var onHandle = e.target.closest('.s4-sheet-handle');
      var nearTop = e.clientY - sheet.getBoundingClientRect().top < 56 && !e.target.closest('button, input, select, textarea, a');
      if (!onHandle && !nearTop) return;
      dragging = true; startY = lastY = e.clientY; lastT = performance.now(); v = 0;
      sheet.setPointerCapture(e.pointerId);
      sheet.getAnimations().forEach(function (a) { a.cancel(); });
    });
    sheet.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dy = Math.max(0, e.clientY - startY), now = performance.now();
      v = (e.clientY - lastY) / Math.max(1, now - lastT); lastY = e.clientY; lastT = now;
      sheet.style.transform = 'translateY(' + dy + 'px)';
    });
    function end() {
      if (!dragging) return; dragging = false;
      var dy = Math.max(0, lastY - startY), h = sheet.offsetHeight;
      if (dy > h / 3 || v > 0.6) {
        sheet.style.transform = '';
        S4.motion.animate(sheet, [{ transform: 'translateY(' + dy + 'px)' }, { transform: 'translateY(100%)' }], 'spatial-calm').finished.then(function () {
          if (sheet._s4transform) sheet._s4transform.style.visibility = '';   /* a FAB hidden by the container transform comes back */
          sheet._s4from = sheet._s4transform = null; sheet.close('drag'); sheet.getAnimations().forEach(function (a) { a.cancel(); });
          S4.util.emit(sheet, 's4-close', { value: 'drag' });
        });
      } else {
        S4.motion.animate(sheet, [{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], 'spatial').finished.then(function () { sheet.getAnimations().forEach(function (a) { a.cancel(); }); });
        sheet.style.transform = '';
      }
    }
    sheet.addEventListener('pointerup', end);
    sheet.addEventListener('pointercancel', end);
  });
});
