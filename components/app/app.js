/* App shell behaviour.
   - The nav bar and nav rail of one .s4-app show the same destinations: when one changes, the other follows (same index).
   - Views: if the chosen item has data-view="bills" and the app has <section class="s4-view" data-view="bills">, that
     view replaces the current one with the shared axis pattern (old slides 30px out and fades, new slides in from the
     side you're heading; movement on the spatial spring, fades on effects), the page scrolls to the top, and the top app
     bar title takes the view's data-title. Fires s4-change { view, previous } on the .s4-app after the switch starts.
   - S4.app.go(app, name) switches views from code (e.g. a "See All" link). */
(function () {
  /* shared axis lives in motion/motion.js (S4.transition.sharedAxis) */
  function sharedAxis(from, to, dir, state, onSwap) { return S4.transition.sharedAxis(from, to, dir, state, onSwap); }

  function views(app) { return Array.prototype.slice.call(app.querySelectorAll('.s4-view[data-view]')); }

  function show(app, name, dir) {
    var list = views(app), to = null, from = null;
    list.forEach(function (v) { if (v.dataset.view === name) to = v; else if (!v.hidden) from = v; });
    if (!to) return false;
    var state = app._s4views || (app._s4views = {});
    /* any other view still visible from an interrupted switch goes away now */
    list.forEach(function (v) { if (v !== to && v !== from) v.hidden = true; });
    if (to === from || (!from && !to.hidden)) return true;
    /* the title and the scroll reset wait for the moment of the swap, so the old view doesn't jump while it fades out */
    sharedAxis(from, to, dir || 1, state, function () {
      var title = to.dataset.title, bar = app.querySelector('.s4-top-app-bar .s4-app-bar-title');
      if (title && bar) bar.textContent = title;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    S4.util.emit(app, 's4-change', { view: name, previous: from ? from.dataset.view : null });
    return true;
  }

  function mirror(app, source, index) {
    app.querySelectorAll('.s4-nav-bar, .s4-nav-rail').forEach(function (nav) {
      if (nav === source || nav.closest('.s4-app') !== app) return;
      var items = nav.querySelectorAll('.s4-nav-item');
      items.forEach(function (x, i) { if (i === index) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
    });
  }

  S4.app = {
    go: function (app, name) {
      var nav = app.querySelector('.s4-nav-bar, .s4-nav-rail');
      var items = nav ? Array.prototype.slice.call(nav.querySelectorAll('.s4-nav-item')) : [];
      var target = items.filter(function (x) { return x.dataset.view === name; })[0];
      if (target) { target.click(); return; }
      show(app, name, 1);
    }
  };

  S4.register('app', function (scope) {
    S4.util.all(scope, '.s4-app').forEach(function (app) {
      if (!S4.util.once(app, 'app')) return;
      /* start with only the current destination's view visible */
      var cur = app.querySelector('.s4-nav-item[aria-current="page"][data-view]');
      var list = views(app);
      if (list.length) {
        var name = cur ? cur.dataset.view : list[0].dataset.view;
        list.forEach(function (v) { v.hidden = v.dataset.view !== name; });
      }
      app.addEventListener('s4-change', function (e) {
        var nav = e.target;
        if (!nav.matches || !nav.matches('.s4-nav-bar, .s4-nav-rail') || !e.detail || !e.detail.item) return;
        var items = Array.prototype.slice.call(nav.querySelectorAll('.s4-nav-item'));
        var prev = app._s4lastIndex;
        if (prev == null) {
          var visible = views(app).filter(function (v) { return !v.hidden; })[0];
          items.forEach(function (x, i) { if (visible && x.dataset.view === visible.dataset.view) prev = i; });
        }
        mirror(app, nav, e.detail.index);
        app._s4lastIndex = e.detail.index;
        var view = e.detail.item.dataset.view;
        if (view) show(app, view, prev == null || e.detail.index >= prev ? 1 : -1);
      });
    });
  });
})();
