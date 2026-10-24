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

  /* review.css sits next to this script */
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/review\.js.*$/, '');
  function injectCSS() { if (document.getElementById('rv-css')) return; var l = document.createElement('link'); l.id = 'rv-css'; l.rel = 'stylesheet'; l.href = BASE + 'review.css?v=7'; document.head.appendChild(l); }
  injectCSS();

  /* An option card: the whole card is the answer. o = { pick:'qid:v', letter, title, desc, tag?, preview?: Element, side?: Element } */
  function card(o) {
    var el = document.createElement('div'); el.className = 'rv-card'; el.setAttribute('role', 'radio'); el.setAttribute('aria-checked', 'false'); el.tabIndex = 0; el.dataset.pick = o.pick;
    el.innerHTML = '<div class="rv-head"><span class="rv-radio" aria-hidden="true"></span><div class="rv-titles">' + (o.tag ? '<span class="rv-tag">' + esc(o.tag) + '</span>' : '') +
      '<b>' + esc(o.letter) + '. ' + esc(o.title) + '</b>' + (o.desc ? '<small>' + esc(o.desc) + '</small>' : '') + '</div><span class="rv-badge">Selected</span></div>';
    el.setAttribute('aria-label', o.letter + '. ' + o.title);
    if (o.side) { var acts = document.createElement('div'); acts.className = 'rv-actions'; acts.setAttribute('data-no-pick', ''); acts.appendChild(o.side); el.appendChild(acts); }
    if (o.preview) { o.preview.classList.add('rv-preview'); el.appendChild(o.preview); }
    return el;
  }

  /* ---------- demo page ---------- */
  function page(id, hooks) {
    var demo = (window.S4_REVIEW_DEMOS || []).filter(function (d) { return d.id === id; })[0];
    if (!demo) throw new Error('S4Review: no demo "' + id + '" in questions.js');
    var caps = (hooks && hooks.capture) || {};
    var cfg = { id: demo.id, title: demo.title, questions: demo.questions.map(function (q) { return { id: q.id, label: q.label, help: q.help, options: q.options.map(function (o) { return { v: o.v, label: o.label, capture: caps[q.id + ':' + o.v] }; }) }; }) };
    REGISTRY[cfg.id] = cfg;
    var s = load(); var p = s.pages[cfg.id] || { answers: {}, note: '' };
    p.title = cfg.title; p.url = location.pathname.split('/').pop(); s.pages[cfg.id] = p; save(s);
    var sec = document.createElement('section'); sec.className = 'rv rv-sec'; sec.id = 'answers'; sec.setAttribute('aria-labelledby', 'rv-h');
    sec.innerHTML = '<div class="rv-box"><h2 id="rv-h">Your Answers</h2><p>Pick one option per question. Answers save in this browser as you go, together with your answers from the other demos. Copy them here or from the hub, then paste them to Claude.</p><div class="rv-qs"></div>' +
      '<label><div class="rv-q"><legend>Notes</legend></div><textarea class="rv-note" placeholder="Anything else: what you liked, what to change, a combination of options…"></textarea></label>' +
      '<div class="rv-acts"><button class="rv-btn pri" type="button" data-copy-page>Copy Answers</button><button class="rv-btn" type="button" data-copy-all>Copy All Demos</button><a class="rv-btn txt" href="./../">Back to Hub</a><button class="rv-btn txt" type="button" data-clear>Clear This Page</button><span class="rv-status" aria-live="polite"></span></div></div>';
    var qsBox = sec.querySelector('.rv-qs');
    function choose(q, o, keep) {
      var st = load(), pg = st.pages[cfg.id], cur = pg.answers[q.id];
      if (cur && cur.v === o.v && !o.capture && !keep) delete pg.answers[q.id];   /* chips: click again to unselect; cards stay picked */
      else pg.answers[q.id] = { v: o.v, label: o.label || '', extra: o.capture ? o.capture() : '' };
      pg.updated = new Date().toISOString(); save(st); render();
    }
    function findOpt(spec) {   /* "qid:v" -> [q, o] */
      var i = spec.indexOf(':'), qid = spec.slice(0, i), v = spec.slice(i + 1);
      var q = cfg.questions.filter(function (x) { return x.id === qid; })[0], o = q && q.options.filter(function (x) { return x.v === v; })[0];
      return q && o ? [q, o] : null;
    }
    /* Inline pick buttons anywhere on the page: <button class="rv-pick" data-pick="qid:v">Pick A</button> */
    function pickFrom(e) {
      var b = e.target.closest && e.target.closest('[data-pick]'); if (!b) return;
      if (b.classList.contains('rv-card')) {
        if (e.target.closest('[data-no-pick]')) return;
        if (e.target.closest('.rv-preview')) return;   /* the preview is the demo: taps there run the demo, never answer */
      }
      var f = findOpt(b.dataset.pick); if (f) choose(f[0], f[1], b.classList.contains('rv-card'));
    }
    document.addEventListener('click', pickFrom);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('rv-card')) { e.preventDefault(); pickFrom(e); }
    });
    cfg.questions.forEach(function (q) {
      var fs = document.createElement('fieldset'); fs.className = 'rv-q';
      fs.innerHTML = '<legend>' + esc(q.label) + '</legend>' + (q.help ? '<p class="rv-help">' + esc(q.help) + '</p>' : '') + '<div class="rv-opts" role="radiogroup" aria-label="' + esc(q.label) + '"></div><div class="rv-extra"></div>';
      var box = fs.querySelector('.rv-opts');
      q.options.forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-opt'; b.setAttribute('role', 'radio'); b.dataset.v = o.v;
        b.innerHTML = '<b>' + esc(o.v) + '</b>' + (o.label ? '<span>' + esc(o.label) + '</span>' : '');
        b.onclick = function () { choose(q, o); };
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
      document.querySelectorAll('[data-pick]').forEach(function (b) {
        var f = findOpt(b.dataset.pick), a = f && pg.answers[f[0].id], on = !!(a && a.v === f[1].v);
        if (b.classList.contains('rv-card')) { b.setAttribute('aria-checked', on); return; }
        if (!b.dataset.base) b.dataset.base = b.textContent.trim();
        b.setAttribute('aria-pressed', on); b.textContent = on ? '✓ ' + b.dataset.base.replace(/^Pick\b/, 'Picked') : b.dataset.base;
      });
      var n = Object.keys(pg.answers).length; status.textContent = n + ' of ' + cfg.questions.length + ' answered' + (persistent ? (pg.updated ? ' · saved' : '') : '. ' + NOT_SAVED);
      renderFab();
    }
    window.addEventListener('storage', function (e) { if (e.key === KEY) render(); });
    render();
    window.S4ReviewPage = { refresh: render };
    return { refresh: render, answer: function (qid, v) { var b = qsBox.querySelector('.rv-q:nth-child(' + (cfg.questions.map(function (q) { return q.id; }).indexOf(qid) + 1) + ') .rv-opt[data-v="' + v + '"]'); if (b) b.click(); } };
  }

  /* ---------- hub ---------- */
  function hub(el) {
    var demos = window.S4_REVIEW_DEMOS || [];
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
  window.S4Review = { page: page, hub: hub, card: card, load: load };
})();
