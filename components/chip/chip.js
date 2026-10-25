/* Chip behaviour.
   Filter chips (data-type="filter"): click toggles aria-pressed and fires s4-change { pressed } on the chip. In a
   .s4-chip-set[data-select="single"] exactly one can be pressed (radio-like). A .s4-chip-check is added for the check.
   Input chips: .s4-chip-remove gets a close icon if empty; click (or Delete / Backspace on it) fires a cancelable
   s4-remove { chip } on the chip, then the chip collapses and is removed, and focus moves to a neighbour. */
S4.register('chip', function (scope) {
  S4.util.all(scope, '.s4-chip[data-type="filter"]').forEach(function (c) {
    if (!S4.util.once(c, 'chip')) return;
    if (!c.hasAttribute('aria-pressed')) c.setAttribute('aria-pressed', 'false');
    if (!c.querySelector(':scope > .s4-chip-check')) {
      var k = document.createElement('span'); k.className = 's4-chip-check'; k.setAttribute('aria-hidden', 'true');
      c.insertBefore(k, c.firstChild);
    }
    c.addEventListener('click', function () {
      if (c.disabled || c.getAttribute('aria-disabled') === 'true') return;
      var set = c.closest('.s4-chip-set');
      var single = set && set.dataset.select === 'single';
      var on = c.getAttribute('aria-pressed') === 'true';
      if (single) {
        if (on) return;
        S4.util.all(set, '.s4-chip[data-type="filter"][aria-pressed="true"]').forEach(function (o) {
          if (o.closest('.s4-chip-set') !== set) return;
          o.setAttribute('aria-pressed', 'false');
          S4.util.emit(o, 's4-change', { pressed: false });
        });
      }
      c.setAttribute('aria-pressed', on ? 'false' : 'true');
      S4.util.emit(c, 's4-change', { pressed: !on });
    });
  });

  S4.util.all(scope, '.s4-chip-remove').forEach(function (b) {
    if (!S4.util.once(b, 'chipRemove')) return;
    if (!b.querySelector('.s4-icon')) {
      var i = document.createElement('span'); i.className = 's4-icon'; b.appendChild(i); S4.icon.set(i, 'close');
    }
    var remove = function () {
      var chip = b.closest('.s4-chip'); if (!chip) return;
      var ev = new CustomEvent('s4-remove', { bubbles: true, cancelable: true, detail: { chip: chip } });
      if (!chip.dispatchEvent(ev)) return;
      /* move focus to the next chip's remove button (or the previous one) */
      var set = chip.parentElement, chips = set ? Array.prototype.slice.call(set.querySelectorAll(':scope > .s4-chip')) : [];
      var i = chips.indexOf(chip), next = chips[i + 1] || chips[i - 1];
      var target = next && (next.querySelector('.s4-chip-remove') || (next.matches('button, a') ? next : null));
      var cs = getComputedStyle(chip);
      var gap = set ? parseFloat(getComputedStyle(set).columnGap) || 0 : 0;
      chip.style.overflow = 'hidden';
      var a = S4.motion.animate(chip, [
        { width: chip.offsetWidth + 'px', paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight, opacity: 1, marginInlineEnd: '0px' },
        { width: '0px', paddingLeft: '0px', paddingRight: '0px', opacity: 0, marginInlineEnd: -gap + 'px' }
      ], 'fast-spatial-calm');
      var done = function () { chip.remove(); if (target) target.focus(); };
      if (a && a.finished) a.finished.then(done, done); else done();
    };
    b.addEventListener('click', function (e) { e.stopPropagation(); remove(); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(); } });
  });
});
