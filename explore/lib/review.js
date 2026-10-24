/* S4 Orion review questionnaire.
   One shared store in localStorage, so answers from every demo page (and every open tab) end up together.
   Questions live in questions.js (window.S4_REVIEW_DEMOS).
   Page:  S4Review.page(id, { capture: { 'qid:v': () => 'text saved with the answer' } })
   Hub:   S4Review.hub(containerEl)
   Store shape: { pages: { [id]: { title, url, answers: { [qid]: { v, label, extra? } }, note, updated } }, history: [{ at, text }] } */
(function () {
  var KEY = 's4-orion-review', HISTORY_MAX = 20;
  /* Some browsers (in-app viewers, private modes, sandboxed frames) block localStorage. Answers then live in memory
     for this tab: everything still works and copies, it just isn't kept after the tab closes. */
  var mem = { pages: {}, history: [] }, persistent = true;
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.pages) { s.history = s.history || []; mem = s; } return JSON.parse(JSON.stringify(mem)); }
    catch (e) { persistent = false; return JSON.parse(JSON.stringify(mem)); }
  }
  function save(s) { mem = JSON.parse(JSON.stringify(s)); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { persistent = false; } }
  var NOT_SAVED = 'This browser blocks saving, so answers last only while this tab is open. Copy them before you leave.';
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var REGISTRY = {};   /* question definitions for pages loaded in this tab, so counts are exact */

  function pageText(id, p) {
    var lines = [p.title + ':'];
    var qs = (REGISTRY[id] && REGISTRY[id].questions) || null;
    var ids = qs ? qs.map(function (q) { return q.id; }) : Object.keys(p.answers || {});
    ids.forEach(function (qid) {
      var a = (p.answers || {})[qid], q = qs && qs.filter(function (x) { return x.id === qid; })[0];
      var label = q ? q.label : qid;
      lines.push('- ' + label + ': ' + (a ? a.v + (a.label ? ' (' + a.label + ')' : '') + (a.extra ? '; ' + a.extra : '') : 'not answered'));
    });
    if (p.note && p.note.trim()) lines.push('- Notes: ' + p.note.trim().replace(/\s*\n\s*/g, ' / '));
    return lines.join('\n');
  }
  function allText(s) {
    var ids = Object.keys(s.pages).filter(function (id) { var p = s.pages[id]; return Object.keys(p.answers || {}).length || (p.note || '').trim(); });
    if (!ids.length) return '';
    return 'S4 Orion review answers (' + new Date().toISOString().slice(0, 10) + ')\n\n' + ids.map(function (id) { return pageText(id, s.pages[id]); }).join('\n\n');
  }
  function copy(text, btn, done) {
    function ok() { var t = btn.textContent; btn.textContent = 'Copied'; btn.dataset.done = ''; setTimeout(function () { btn.textContent = t; delete btn.dataset.done; }, 1600); if (done) done(); }
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { prompt('Copy your answers:', text); } ta.remove(); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }
  function remember(s, text) { if (!text) return; if (s.history[0] && s.history[0].text === text) return; s.history.unshift({ at: new Date().toISOString(), text: text }); s.history = s.history.slice(0, HISTORY_MAX); save(s); }

  var CSS = '\
.rv{--rv-bg:var(--md-sys-color-surface-container-low);--rv-card:var(--md-sys-color-surface-container-lowest);--rv-fg:var(--md-sys-color-on-surface);--rv-fg2:var(--md-sys-color-on-surface-variant);--rv-line:var(--md-sys-color-outline-variant);--rv-sel:var(--md-sys-color-secondary-container);--rv-sel-fg:var(--md-sys-color-on-secondary-container);--rv-pri:var(--md-sys-color-primary);--rv-on-pri:var(--md-sys-color-on-primary);color:var(--rv-fg);font-family:Inter,system-ui,sans-serif}\
:root[data-theme=dark] .rv{--rv-card:var(--md-sys-color-surface-container-high)}\
.rv-sec{scroll-margin-top:80px;max-width:1500px;margin:0 auto 40px;padding:0 24px}\
.rv-box{background:var(--rv-bg);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:20px}\
.rv-box h2{margin:0;font-size:28px;line-height:36px;font-weight:500}\
.rv-box > p{margin:0;color:var(--rv-fg2);max-width:80ch}\
.rv-q{display:flex;flex-direction:column;gap:10px;border:0;margin:0;padding:0}\
.rv-q legend{padding:0;margin-bottom:10px;font-size:16px;line-height:24px;font-weight:600}\
.rv-q .rv-help{margin:-6px 0 4px;color:var(--rv-fg2);font-size:13px;line-height:18px}\
.rv-opts{display:flex;flex-wrap:wrap;gap:8px}\
.rv-opt{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:8px 16px;border:0;border-radius:999px;background:var(--rv-card);color:var(--rv-fg);font:inherit;font-weight:500;cursor:pointer;box-shadow:inset 0 0 0 1px var(--rv-line);text-align:left}\
.rv-opt b{font-weight:700}\
.rv-opt:hover{background:color-mix(in srgb,var(--rv-fg) 8%,var(--rv-card))}\
.rv-opt[aria-checked=true]{background:var(--rv-sel);color:var(--rv-sel-fg);box-shadow:none}\
.rv-opt:focus-visible,.rv-btn:focus-visible,.rv-note:focus-visible,.rv-fab:focus-visible{outline:2px solid var(--rv-fg);outline-offset:2px}\
.rv-extra{font-size:13px;color:var(--rv-fg2);font-variant-numeric:tabular-nums}\
.rv-note{width:100%;min-height:88px;padding:12px 16px;border:0;border-radius:12px;background:var(--rv-card);color:var(--rv-fg);font:inherit;font-size:16px;line-height:24px;box-shadow:inset 0 0 0 1px var(--rv-line);resize:vertical}\
.rv-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\
.rv-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 20px;border:0;border-radius:999px;font:inherit;font-weight:500;cursor:pointer;background:var(--rv-sel);color:var(--rv-sel-fg)}\
.rv-btn.pri{background:var(--rv-pri);color:var(--rv-on-pri)}\
.rv-btn.txt{background:transparent;color:var(--rv-fg2)}\
.rv-btn[data-done]{background:var(--rv-sel);color:var(--rv-sel-fg)}\
.rv-status{font-size:13px;color:var(--rv-fg2)}\
.rv-fab{position:fixed;z-index:90;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));display:inline-flex;align-items:center;gap:10px;height:56px;padding:0 20px;border:0;border-radius:16px;background:var(--rv-pri);color:var(--rv-on-pri);font:inherit;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgb(0 0 0/.24)}\
.rv-fab span{display:inline-grid;place-items:center;min-width:28px;height:22px;padding:0 8px;border-radius:999px;background:color-mix(in srgb,var(--rv-on-pri) 22%,transparent);font-size:12px;font-variant-numeric:tabular-nums}\
.rv-list{display:flex;flex-direction:column;gap:8px}\
.rv-item{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:12px 16px;border-radius:12px;background:var(--rv-card)}\
.rv-item a{color:inherit;font-weight:600;text-decoration:none} .rv-item a:hover{text-decoration:underline}\
.rv-item .rv-status{margin-left:auto}\
.rv-pre{margin:0;padding:12px 16px;border-radius:12px;background:var(--rv-card);font:13px/18px ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap;color:var(--rv-fg2);max-height:240px;overflow:auto}\
.rv-hist summary{cursor:pointer;font-weight:600;padding:6px 0}\
.rv-hist .rv-item{flex-direction:column;align-items:stretch}\
@media (max-width:600px){.rv-box{padding:16px}.rv-fab{height:48px;padding:0 16px}}';
  function injectCSS() { if (document.getElementById('rv-css')) return; var st = document.createElement('style'); st.id = 'rv-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ---------- demo page ---------- */
  function page(id, hooks) {
    var demo = (window.S4_REVIEW_DEMOS || []).filter(function (d) { return d.id === id; })[0];
    if (!demo) throw new Error('S4Review: no demo "' + id + '" in questions.js');
    var caps = (hooks && hooks.capture) || {};
    var cfg = { id: demo.id, title: demo.title, questions: demo.questions.map(function (q) { return { id: q.id, label: q.label, help: q.help, options: q.options.map(function (o) { return { v: o.v, label: o.label, capture: caps[q.id + ':' + o.v] }; }) }; }) };
    injectCSS(); REGISTRY[cfg.id] = cfg;
    var s = load(); var p = s.pages[cfg.id] || { answers: {}, note: '' };
    p.title = cfg.title; p.url = location.pathname.split('/').pop(); s.pages[cfg.id] = p; save(s);
    var sec = document.createElement('section'); sec.className = 'rv rv-sec'; sec.id = 'answers'; sec.setAttribute('aria-labelledby', 'rv-h');
    sec.innerHTML = '<div class="rv-box"><h2 id="rv-h">Your Answers</h2><p>Pick one option per question. Answers save in this browser as you go, together with your answers from the other demos. Copy them here or from the hub, then paste them to Claude.</p><div class="rv-qs"></div>' +
      '<label><div class="rv-q"><legend>Notes</legend></div><textarea class="rv-note" placeholder="Anything else: what you liked, what to change, a combination of options…"></textarea></label>' +
      '<div class="rv-acts"><button class="rv-btn pri" type="button" data-copy-page>Copy Answers</button><button class="rv-btn" type="button" data-copy-all>Copy All Demos</button><a class="rv-btn txt" href="./../">Back to Hub</a><button class="rv-btn txt" type="button" data-clear>Clear This Page</button><span class="rv-status" aria-live="polite"></span></div></div>';
    var qsBox = sec.querySelector('.rv-qs');
    cfg.questions.forEach(function (q) {
      var fs = document.createElement('fieldset'); fs.className = 'rv-q';
      fs.innerHTML = '<legend>' + esc(q.label) + '</legend>' + (q.help ? '<p class="rv-help">' + esc(q.help) + '</p>' : '') + '<div class="rv-opts" role="radiogroup" aria-label="' + esc(q.label) + '"></div><div class="rv-extra"></div>';
      var box = fs.querySelector('.rv-opts');
      q.options.forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-opt'; b.setAttribute('role', 'radio'); b.dataset.v = o.v;
        b.innerHTML = '<b>' + esc(o.v) + '</b>' + (o.label ? '<span>' + esc(o.label) + '</span>' : '');
        b.onclick = function () {
          var st = load(), pg = st.pages[cfg.id], cur = pg.answers[q.id];
          if (cur && cur.v === o.v && !o.capture) delete pg.answers[q.id];   /* click again to unselect */
          else pg.answers[q.id] = { v: o.v, label: o.label || '', extra: o.capture ? o.capture() : '' };
          pg.updated = new Date().toISOString(); save(st); render();
        };
        box.appendChild(b);
      });
      qsBox.appendChild(fs);
    });
    var note = sec.querySelector('.rv-note'), status = sec.querySelector('.rv-status');
    note.addEventListener('input', function () { var st = load(); st.pages[cfg.id].note = note.value; st.pages[cfg.id].updated = new Date().toISOString(); save(st); renderFab(); });
    sec.querySelector('[data-copy-page]').onclick = function (e) { var st = load(); var t = 'S4 Orion review answers (' + new Date().toISOString().slice(0, 10) + ')\n\n' + pageText(cfg.id, st.pages[cfg.id]); copy(t, e.currentTarget, function () { remember(st, t); }); };
    sec.querySelector('[data-copy-all]').onclick = function (e) { var st = load(), t = allText(st); if (!t) { status.textContent = 'Nothing answered yet.'; return; } copy(t, e.currentTarget, function () { remember(st, t); }); };
    sec.querySelector('[data-clear]').onclick = function () { var st = load(); st.pages[cfg.id].answers = {}; st.pages[cfg.id].note = ''; save(st); note.value = ''; render(); };
    var footer = document.querySelector('body > footer'); document.body.insertBefore(sec, footer || null);
    var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'rv rv-fab'; fab.onclick = function () { sec.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); sec.querySelector('.rv-opt').focus({ preventScroll: true }); };
    document.body.appendChild(fab);
    function renderFab() { var st = load(), n = Object.keys(st.pages[cfg.id].answers).length; fab.innerHTML = 'Your Answers <span>' + n + '/' + cfg.questions.length + '</span>'; fab.setAttribute('aria-label', 'Your answers, ' + n + ' of ' + cfg.questions.length + ' answered'); }
    function render() {
      var st = load(), pg = st.pages[cfg.id];
      cfg.questions.forEach(function (q, i) {
        var fs = qsBox.children[i], a = pg.answers[q.id];
        fs.querySelectorAll('.rv-opt').forEach(function (b) { b.setAttribute('aria-checked', !!(a && a.v === b.dataset.v)); });
        fs.querySelector('.rv-extra').textContent = a && a.extra ? a.extra : '';
      });
      if (document.activeElement !== note) note.value = pg.note || '';
      var n = Object.keys(pg.answers).length; status.textContent = n + ' of ' + cfg.questions.length + ' answered' + (persistent ? (pg.updated ? ' · saved' : '') : '. ' + NOT_SAVED);
      renderFab();
    }
    window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
    render();
    return { answer: function (qid, v) { var b = qsBox.querySelector('.rv-q:nth-child(' + (cfg.questions.map(function (q) { return q.id; }).indexOf(qid) + 1) + ') .rv-opt[data-v="' + v + '"]'); if (b) b.click(); } };
  }

  /* ---------- hub ---------- */
  function hub(el) {
    var demos = window.S4_REVIEW_DEMOS || [];
    injectCSS();
    demos.forEach(function (d) { REGISTRY[d.id] = REGISTRY[d.id] || { questions: d.questions }; });
    el.classList.add('rv');
    el.innerHTML = '<div class="rv-box"><h2>Your Answers</h2><p>Everything you pick in the demos is saved in this browser. Work through them in any order, in several tabs if you like, then copy everything at once and paste it to Claude.</p><div class="rv-list"></div><div class="rv-acts"><button class="rv-btn pri" type="button" data-copy-all>Copy All Answers</button><button class="rv-btn txt" type="button" data-clear-all>Clear All</button><span class="rv-status" aria-live="polite"></span></div><pre class="rv-pre" hidden></pre><details class="rv-hist"><summary>Previous Copies</summary><div class="rv-list"></div></details></div>';
    var list = el.querySelector('.rv-list'), pre = el.querySelector('.rv-pre'), hist = el.querySelector('.rv-hist .rv-list'), status = el.querySelector('.rv-status');
    function render() {
      var s = load();
      list.innerHTML = demos.map(function (d) {
        var p = s.pages[d.id], n = p ? Object.keys(p.answers || {}).length : 0;
        return '<div class="rv-item"><a href="' + esc(d.href) + '">' + esc(d.title) + '</a><span class="rv-status">' + (n ? n + ' of ' + d.questions.length + ' answered' : 'Not started') + '</span></div>';
      }).join('');
      var t = allText(s); pre.hidden = !t; pre.textContent = t; if (!persistent) status.textContent = 'This browser blocks saving, so answers can’t carry over between demo pages here. Open the site in Safari or Chrome to keep them.';
      hist.innerHTML = s.history.length ? s.history.map(function (h, i) { return '<div class="rv-item"><span class="rv-status" style="margin:0">' + new Date(h.at).toLocaleString() + '</span><pre class="rv-pre">' + esc(h.text) + '</pre><div class="rv-acts"><button class="rv-btn" type="button" data-h="' + i + '">Copy Again</button></div></div>'; }).join('') : '<p class="rv-status">Nothing copied yet.</p>';
      hist.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { copy(load().history[+b.dataset.h].text, b); }; });
    }
    el.querySelector('[data-copy-all]').onclick = function (e) { var s = load(), t = allText(s); if (!t) { status.textContent = 'Nothing answered yet.'; return; } copy(t, e.currentTarget, function () { remember(s, t); render(); }); };
    el.querySelector('[data-clear-all]').onclick = function () { if (!confirm('Clear every answer? Previous copies stay in the history.')) return; var s = load(); Object.keys(s.pages).forEach(function (k) { s.pages[k].answers = {}; s.pages[k].note = ''; }); save(s); render(); };
    window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
    window.addEventListener('pageshow', render);
    render();
  }
  window.S4Review = { page: page, hub: hub, load: load };
})();
