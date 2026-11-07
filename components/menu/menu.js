/* Menus: [data-menu="id"] opens <div class="s4-menu" id popover role="menu">. Unfold motion (decision 0001), positioning
   against the anchor (flips above when there's no room), keyboard (arrows, Home/End, Escape, typeahead), radio/checkbox
   items, and light dismiss from the popover API. Choosing an item fires s4-select { value, item } on the menu and closes it.
   S4.menu.open(menu, anchor) / S4.menu.close(menu) / S4.position(popup, anchor, { align, gap }). */
(function () {
  var S4 = window.S4;
  function items(menu) { return Array.prototype.filter.call(menu.querySelectorAll('.s4-menu-item'), function (i) { return !i.disabled && i.getAttribute('aria-disabled') !== 'true'; }); }

  /* place popup next to anchor: below (or above if it doesn't fit), start- or end-aligned, kept inside the viewport */
  S4.position = function (popup, anchor, opts) {
    opts = opts || {};
    var gap = opts.gap != null ? opts.gap : 4, m = 8, a = anchor.getBoundingClientRect(), p = popup.getBoundingClientRect();
    var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
    var below = a.bottom + gap + p.height <= vh - m || a.top - gap - p.height < m;
    var top = below ? a.bottom + gap : a.top - gap - p.height;
    var end = opts.align === 'end' || (opts.align !== 'start' && a.left + p.width > vw - m);
    var left = end ? a.right - p.width : a.left;
    left = Math.max(m, Math.min(left, vw - m - p.width));
    top = Math.max(m, Math.min(top, vh - m - p.height));
    popup.style.left = left + 'px'; popup.style.top = top + 'px';
    return below ? 'top' : 'bottom';
  };

  function isOpen(menu) { return menu.matches(':popover-open') || menu.hasAttribute('data-open'); }
  function open(menu, anchor) {
    if (isOpen(menu) && !menu._s4closing) return;
    menu._s4closing = false;
    if (S4.transition && S4.transition.restore) S4.transition.restore(menu, anchor);   /* a container-transform close leaves the menu hidden and its anchor hidden */
    menu._s4anchor = anchor;
    try { menu.showPopover(); } catch (e) { menu.setAttribute('data-open', ''); }
    var from = menu._s4from = S4.position(menu, anchor, { align: menu.dataset.align });
    Array.prototype.forEach.call(document.querySelectorAll('.s4-menu'), function (o) { if (o !== menu && isOpen(o)) close(o, false); });
    if (anchor) anchor.setAttribute('aria-expanded', 'true');
    S4.transition.unfold(menu, { from: from, anchor: anchor, align: menu.dataset.align, style: menu.dataset.motion || S4.menuMotion });
    var first = menu.querySelector('.s4-menu-item[aria-checked="true"]') || items(menu)[0];
    if (first) first.focus({ preventScroll: true });
    S4.util.emit(menu, 's4-open', {});
  }
  function close(menu, restoreFocus) {
    var anchor = menu._s4anchor;
    if (anchor) anchor.setAttribute('aria-expanded', 'false');
    if (!isOpen(menu) || menu._s4closing) return;
    menu._s4closing = true;
    S4.transition.unfold(menu, { open: false, from: menu._s4from, anchor: anchor, align: menu.dataset.align, style: menu.dataset.motion || S4.menuMotion }).then(function () {
      if (!menu._s4closing) return;   /* reopened meanwhile */
      menu._s4closing = false;
      try { menu.hidePopover(); } catch (e) {} menu.removeAttribute('data-open');
      menu.getAnimations().forEach(function (a) { a.cancel(); });
    });
    if (restoreFocus !== false && anchor) anchor.focus({ preventScroll: true });
    S4.util.emit(menu, 's4-close', {});
  }
  S4.menu = { open: open, close: close };

  S4.register('menu', function (scope) {
    S4.util.all(scope, '[data-menu]').forEach(function (anchor) {
      if (!S4.util.once(anchor, 'menuAnchor')) return;
      var menu = document.getElementById(anchor.dataset.menu); if (!menu) return;
      anchor.setAttribute('aria-haspopup', 'menu'); anchor.setAttribute('aria-expanded', 'false'); anchor.setAttribute('aria-controls', menu.id);
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        isOpen(menu) && !menu._s4closing ? close(menu) : open(menu, anchor);
      });
      anchor.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(menu, anchor); } });
    });
    S4.util.all(scope, '.s4-menu').forEach(function (menu) {
      if (!S4.util.once(menu, 'menu')) return;
      /* manual: we close it ourselves (animated), so a click on the open menu's own button toggles instead of reopening */
      menu.setAttribute('popover', 'manual');
      if (!menu.getAttribute('role')) menu.setAttribute('role', 'menu');
      items(menu).forEach(function (i) { if (!i.getAttribute('role')) i.setAttribute('role', 'menuitem'); i.tabIndex = -1; });
      /* light dismiss (click outside) closes through the popover API: keep aria-expanded in sync */
      menu.addEventListener('toggle', function (e) { if (e.newState === 'closed' && menu._s4anchor) menu._s4anchor.setAttribute('aria-expanded', 'false'); });
      menu.addEventListener('click', function (e) {
        var item = e.target.closest('.s4-menu-item'); if (!item || !menu.contains(item)) return;
        var role = item.getAttribute('role');
        if (role === 'menuitemradio') menu.querySelectorAll('[role="menuitemradio"]').forEach(function (r) { r.setAttribute('aria-checked', r === item); });
        if (role === 'menuitemcheckbox') { item.setAttribute('aria-checked', item.getAttribute('aria-checked') !== 'true'); return; }
        S4.util.emit(menu, 's4-select', { value: item.value || item.dataset.value || item.textContent.trim(), item: item });
        close(menu);
      });
      var typed = '', typedAt = 0;
      menu.addEventListener('keydown', function (e) {
        var list = items(menu), i = list.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
        else if (e.key === 'Escape') { e.preventDefault(); close(menu); }
        else if (e.key === 'Tab') { close(menu, false); }
        else if (e.key.length === 1 && /\S/.test(e.key)) {
          typed = (Date.now() - typedAt > 600 ? '' : typed) + e.key.toLowerCase(); typedAt = Date.now();
          var hit = list.find(function (x) { return x.textContent.trim().toLowerCase().indexOf(typed) === 0; }); if (hit) hit.focus();
        }
      });
    });
  });
  document.addEventListener('pointerdown', function (e) {
    document.querySelectorAll('.s4-menu').forEach(function (m) {
      if (!isOpen(m) || m._s4closing || m.contains(e.target)) return;
      if (m._s4anchor && m._s4anchor.contains(e.target)) return;   /* the anchor's own click toggles */
      close(m, false);
    });
  }, true);
  window.addEventListener('resize', function () {
    document.querySelectorAll('.s4-menu:popover-open').forEach(function (m) { if (m._s4anchor) S4.position(m, m._s4anchor, { align: m.dataset.align }); });
  });
})();
