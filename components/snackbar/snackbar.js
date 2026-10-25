/* S4.snackbar({ text, action, onAction, closable, multiline, duration }) -> { dismiss }
   One at a time: a new snackbar replaces the one showing. Slides up from the bottom edge; sits above a nav bar, a docked
   toolbar or a FAB in the corner. Announced politely to screen readers. Stays while hovered or focused.
   Default duration: 4s, or 6s when it has an action; 0 keeps it until dismissed. */
(function () {
  var S4 = window.S4, host = null, current = null;
  function ensureHost() {
    if (host && host.isConnected) return host;
    host = document.createElement('div'); host.className = 's4-snackbar-host'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite');
    host.setAttribute('data-s4-skip', '');
    document.body.appendChild(host);
    return host;
  }
  function offset() {   /* lift above anything fixed at the bottom */
    var lift = 0, vh = window.innerHeight;
    document.querySelectorAll('.s4-nav-bar, .s4-toolbar[data-type="docked"], .s4-app-fab').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.height && getComputedStyle(el).display !== 'none' && r.bottom >= vh - 2) lift = Math.max(lift, vh - r.top);
    });
    ensureHost().style.setProperty('--s4-snackbar-offset', lift + 'px');
  }
  S4.snackbar = function (o) {
    o = typeof o === 'string' ? { text: o } : (o || {});
    if (current) current.dismiss(true);
    offset();
    var el = document.createElement('div'); el.className = 's4-snackbar';
    if (o.multiline) el.setAttribute('data-multiline', '');
    var t = document.createElement('span'); t.className = 's4-snackbar-text'; t.textContent = o.text || ''; el.appendChild(t);
    if (o.action) {
      var a = document.createElement('button'); a.type = 'button'; a.className = 's4-button s4-snackbar-action'; a.dataset.variant = 'text'; a.textContent = o.action;
      a.addEventListener('click', function () { if (o.onAction) o.onAction(); api.dismiss(); });
      el.appendChild(a);
    }
    if (o.closable) {
      var c = document.createElement('button'); c.type = 'button'; c.className = 's4-icon-button'; c.setAttribute('aria-label', 'Dismiss');
      c.innerHTML = '<span class="s4-icon" data-icon="close"></span>'; c.addEventListener('click', function () { api.dismiss(); });
      el.appendChild(c); S4.init(c);
    }
    ensureHost().appendChild(el);
    S4.transition.slide(el, { open: true, edge: 'bottom', gap: 'var(--s4-space-6)', spring: 'spatial' });
    var ms = o.duration != null ? o.duration : (o.action ? 6000 : 4000), timer = null, held = false;
    function arm() { clearTimeout(timer); if (ms && !held) timer = setTimeout(function () { api.dismiss(); }, ms); }
    el.addEventListener('pointerenter', function () { held = true; clearTimeout(timer); });
    el.addEventListener('pointerleave', function () { held = false; arm(); });
    el.addEventListener('focusin', function () { held = true; clearTimeout(timer); });
    el.addEventListener('focusout', function () { held = false; arm(); });
    var gone = false;
    var api = {
      element: el,
      dismiss: function (instant) {
        if (gone) return; gone = true; clearTimeout(timer); if (current === api) current = null;
        if (instant) { el.remove(); return; }
        S4.motion.animate(el, [{ opacity: 1 }, { opacity: 0 }], 'fast-effects');
        S4.transition.slide(el, { open: false, edge: 'bottom', gap: 'var(--s4-space-6)' }).then(function () { el.remove(); });
      }
    };
    current = api; arm();
    return api;
  };
  window.addEventListener('resize', function () { if (current) offset(); });
})();
