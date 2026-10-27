/* Pocket Ledger: app code. Components are wired by orion.js; this file holds data and the glue. */
(function () {
  'use strict';
  var KEY = 'pocket-ledger-data';
  var app = document.querySelector('.s4-app');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var TONES = { paid: '', scheduled: 'primary', review: 'secondary', due: 'tertiary', overdue: 'error' };
  var LABELS = { paid: 'Paid', scheduled: 'Scheduled', review: 'In Review', due: 'Due', overdue: 'Overdue' };
  var SEED = [
    { id: 1, vendor: 'Iron Mountain', amount: 1240, due: '2026-10-24', cat: 'Office', status: 'overdue' },
    { id: 2, vendor: 'Staples', amount: 72.4, due: '2026-10-29', cat: 'Office', status: 'due' },
    { id: 3, vendor: 'Electric Co.', amount: 318.55, due: '2026-10-30', cat: 'Utilities', status: 'due' },
    { id: 4, vendor: 'Comcast Business', amount: 189, due: '2026-11-02', cat: 'Utilities', status: 'scheduled' },
    { id: 5, vendor: 'Acme Insurance', amount: 1820, due: '2026-11-05', cat: 'Insurance', status: 'review' },
    { id: 6, vendor: 'City Water', amount: 94.2, due: '2026-10-20', cat: 'Utilities', status: 'paid' },
    { id: 7, vendor: 'Office Landlord', amount: 3400, due: '2026-10-01', cat: 'Rent', status: 'paid' }
  ];

  var bills = load();
  var filter = 'all';
  var sort = 'due';
  var removed = null;

  function load() {
    try { var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(d)) return d; } catch (e) {}
    return SEED.map(function (b) { return Object.assign({}, b); });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(bills)); } catch (e) {} }

  var money = function (n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var dateLabel = function (iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  var initials = function (v) { return v.split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function status(key, extra) {
    var tone = TONES[key];
    return '<span class="s4-status"' + (tone ? ' data-tone="' + tone + '"' : '') + (key === 'overdue' ? ' data-dot' : '') + '>' + LABELS[key] + (extra || '') + '</span>';
  }

  function sorter(a, b) {
    if (sort === 'amount') return b.amount - a.amount;
    if (sort === 'vendor') return a.vendor.localeCompare(b.vendor);
    return a.due.localeCompare(b.due);
  }

  /* ---------- Bills list ---------- */
  var GROUPS = [
    { title: 'Needs Attention', keys: ['overdue', 'due'] },
    { title: 'Upcoming', keys: ['scheduled', 'review'] },
    { title: 'Paid', keys: ['paid'] }
  ];

  function row(b) {
    return '<li data-status="' + b.status + '"><button class="s4-list-item" type="button" data-id="' + b.id + '">' +
      '<span class="s4-list-leading"><span class="s4-avatar">' + esc(initials(b.vendor)) + '</span></span>' +
      '<span class="s4-list-content"><span class="s4-list-headline">' + esc(b.vendor) + '</span>' +
      '<span class="s4-list-supporting">' + (b.status === 'paid' ? 'Paid ' : 'Due ') + dateLabel(b.due) + ' · ' + esc(b.cat) + '</span></span>' +
      '<span class="s4-list-trailing"><span class="s4-list-amount">' + money(b.amount) + '</span>' + status(b.status) + '</span>' +
      '</button></li>';
  }

  function renderBills() {
    var list = $('#bill-list'), html = '', shown = 0;
    GROUPS.forEach(function (g) {
      var items = bills.filter(function (b) { return g.keys.indexOf(b.status) >= 0 && (filter === 'all' || b.status === filter); }).sort(sorter);
      if (!items.length) return;
      shown += items.length;
      var sum = items.reduce(function (t, b) { return t + b.amount; }, 0);
      html += '<li class="s4-list-subheader">' + g.title + ' <span class="s4-list-subtotal">' + money(sum) + '</span></li>';
      html += items.map(row).join('');
    });
    list.innerHTML = html;
    list.hidden = !shown;
    var empty = $('#bill-empty');
    if (!bills.length) {
      empty.hidden = false;
      $('#empty-title').textContent = 'No Bills Yet';
      $('#empty-text').textContent = 'Bills you add show up here.';
      empty.querySelector('button').hidden = false;
    } else if (!shown) {
      empty.hidden = false;
      $('#empty-title').textContent = 'No Matching Bills';
      $('#empty-text').textContent = 'Nothing is ' + (LABELS[filter] || filter).toLowerCase() + ' right now. Choose All to see every bill.';
      empty.querySelector('button').hidden = true;
    } else {
      empty.hidden = true;
    }
    var open = bills.filter(function (b) { return b.status !== 'paid'; });
    $('#bills-total').textContent = money(open.reduce(function (t, b) { return t + b.amount; }, 0));
    /* re-apply the search text to the new rows */
    var q = $('.s4-search-input');
    if (q && q.value) q.dispatchEvent(new Event('input', { bubbles: true }));
    renderOverview();
  }

  function renderOverview() {
    var soon = bills.filter(function (b) { return b.status === 'due' || b.status === 'overdue'; }).sort(sorter).slice(0, 3);
    $('#due-list').innerHTML = soon.length ? soon.map(function (b) {
      return '<li><button class="s4-list-item" type="button" data-go-bill="' + b.id + '">' +
        '<span class="s4-list-leading"><span class="s4-avatar">' + esc(initials(b.vendor)) + '</span></span>' +
        '<span class="s4-list-content"><span class="s4-list-headline">' + esc(b.vendor) + '</span><span class="s4-list-supporting">Due ' + dateLabel(b.due) + '</span></span>' +
        '<span class="s4-list-trailing"><span class="s4-list-amount">' + money(b.amount) + '</span>' + status(b.status) + '</span></button></li>';
    }).join('') : '<li><div class="s4-list-item"><span class="s4-list-content"><span class="s4-list-headline">Nothing due this week</span></span></div></li>';
    var paid = bills.filter(function (b) { return b.status === 'paid'; }).length;
    $('#stat-bills').textContent = bills.length;
    $('#stat-paid').textContent = paid;
    $('#stat-open').textContent = bills.length - paid;
    var due = bills.filter(function (b) { return b.status === 'due' || b.status === 'overdue'; }).length;
    $$('[data-due-count]').forEach(function (b) { b.textContent = due; b.hidden = !due; });
    $$('.s4-nav-item[data-view="bills"]').forEach(function (n) {
      var lab = $('.s4-nav-label', n).textContent;
      n.setAttribute('aria-label', due ? lab + ', ' + due + ' due' : lab);
    });
  }

  /* ---------- Filters, sort ---------- */
  $('#bill-filters').addEventListener('s4-change', function (e) {
    var chip = e.target.closest('.s4-chip');
    if (!chip || !e.detail.pressed) return;
    filter = chip.dataset.filterValue;
    renderBills();
  });
  $('#sort-menu').addEventListener('s4-select', function (e) {
    sort = e.detail.item.dataset.value;
    renderBills();
  });

  /* ---------- Detail (container transform from the row) ---------- */
  var current = null;
  function openDetail(id, from) {
    var b = bills.filter(function (x) { return x.id == id; })[0];
    if (!b) return;
    current = b;
    $$('[data-bd-title]').forEach(function (h) { h.textContent = b.vendor; });
    $('#bd-amount').textContent = money(b.amount);
    $('#bd-status').outerHTML = status(b.status).replace('<span ', '<span id="bd-status" ');
    $('#bd-due').textContent = dateLabel(b.due);
    $('#bd-cat').textContent = b.cat;
    $$('[data-pay]').forEach(function (x) { x.hidden = b.status === 'paid'; });
    S4.dialog.open('bill-detail', { from: from });
  }
  $('#bill-list').addEventListener('click', function (e) {
    var item = e.target.closest('.s4-list-item[data-id]');
    if (item) openDetail(item.dataset.id, item);
  });
  $('#due-list').addEventListener('click', function (e) {
    var item = e.target.closest('[data-go-bill]');
    if (item) openDetail(item.dataset.goBill, item);
  });
  $$('[data-pay]').forEach(function (x) { x.addEventListener('click', markPaid); });
  function markPaid() {
    var b = current, prev = b.status;
    b.status = 'paid';
    save(); renderBills();
    S4.dialog.close('bill-detail', 'paid');
    S4.snackbar({ text: b.vendor + ' marked as paid', action: 'Undo', onAction: function () { b.status = prev; save(); renderBills(); } });
  }
  $('#bd-edit').addEventListener('click', function () {
    S4.dialog.close('bill-detail', 'edit');
    S4.snackbar('Editing isn’t part of this demo yet');
  });
  $('#bd-delete').addEventListener('click', function () {
    var b = current, i = bills.indexOf(b);
    bills.splice(i, 1);
    save(); renderBills();
    S4.dialog.close('bill-detail', 'delete');
    S4.snackbar({ text: b.vendor + ' deleted', action: 'Undo', onAction: function () { bills.splice(i, 0, b); save(); renderBills(); } });
  });

  /* ---------- Add bill ---------- */
  var vendor = $('#vendor'), amount = $('#amount'), due = $('#due');
  $('#save-bill').addEventListener('click', function () {
    var ok = true, first = null;
    var amt = parseFloat(String(amount.value).replace(/,/g, ''));
    function bad(field, msg) { field.closest('.s4-text-field').setAttribute('data-error', msg); ok = false; first = first || field; }
    function good(field) { field.closest('.s4-text-field').removeAttribute('data-error'); }
    if (!vendor.value.trim()) bad(vendor, 'Enter a vendor name.'); else good(vendor);
    if (!(amt > 0)) bad(amount, 'Enter an amount above $0.00.'); else good(amount);
    if (!due.value) bad(due, 'Choose a due date.'); else good(due);
    if (!ok) { first.focus(); return; }
    var b = { id: Date.now(), vendor: vendor.value.trim(), amount: amt, due: due.value, cat: $('#cat').value || 'Other', status: due.value < '2026-10-27' ? 'overdue' : 'due' };
    bills.push(b); save(); renderBills();
    S4.sheet.close('add-bill', 'save');
    $('#add-form').reset();
    S4.snackbar({ text: 'Bill added', action: 'Undo', onAction: function () { bills = bills.filter(function (x) { return x !== b; }); save(); renderBills(); } });
  });
  $('#add-bill').addEventListener('s4-close', function (e) {
    if (e.detail.value !== 'save') {
      $('#add-form').reset();
      $$('#add-form .s4-text-field').forEach(function (f) { f.removeAttribute('data-error'); });
    }
  });

  /* ---------- Menus, toolbar, notifications ---------- */
  function doExport() { S4.snackbar('Export started'); }
  function doRefresh() {
    var st = $('#refresh-state'); st.hidden = false;
    setTimeout(function () { st.hidden = true; S4.snackbar('Activity refreshed'); }, 1200);
  }
  $('#more-menu').addEventListener('s4-select', function (e) {
    var a = e.detail.item.dataset.action;
    if (a === 'export') doExport(); else if (a === 'refresh') doRefresh(); else S4.snackbar('Help is on its way');
  });
  $('#export-btn').addEventListener('click', doExport);
  $('#refresh-btn').addEventListener('click', doRefresh);
  $('#notify-btn').addEventListener('click', function () { S4.snackbar({ text: '3 bills need attention', action: 'View', onAction: function () { S4.app.go(app, 'bills'); } }); });
  $('#account-menu').addEventListener('s4-select', function (e) { $('#account-value').textContent = e.detail.item.dataset.value; });

  /* ---------- Activity filters (side sheet) ---------- */
  function applyActivityFilters() {
    var on = {};
    $$('[data-af-status]').forEach(function (c) { on[c.dataset.afStatus] = c.checked; });
    var method = ($('input[name="method"]:checked') || {}).value || '';
    var min = +$('#min-amt').value;
    $$('#activity-table tbody tr').forEach(function (tr) {
      var cells = tr.children, st = cells[4].textContent;
      var kind = st === 'Paid' ? 'paid' : /Failed/.test(st) ? 'problem' : 'open';
      var amt = +cells[5].dataset.value;
      tr.hidden = !on[kind] || (method && cells[3].textContent !== method) || amt < min;
    });
  }
  $('#activity-filters').addEventListener('s4-close', function (e) {
    if (e.detail.value === 'reset') {
      $$('[data-af-status]').forEach(function (c) { c.checked = true; });
      $('input[name="method"][value=""]').checked = true;
      var m = $('#min-amt'); m.value = 0; m.dispatchEvent(new Event('input', { bubbles: true }));
    }
    applyActivityFilters();
    if (e.detail.value === 'apply') S4.snackbar('Filters applied');
  });

  /* ---------- Delete all ---------- */
  $('#confirm-wipe').addEventListener('s4-close', function (e) {
    if (e.detail.value !== 'delete') return;
    bills = []; save(); renderBills();
    S4.snackbar('All data deleted');
  });

  /* ---------- Overview: period, chart ---------- */
  var PERIODS = {
    week: { spent: '$1,284.30', upcoming: '$480.95', overdue: '$1,240.00', saved: '$210.00', sd: '2% Under Budget', ud: '2 Bills Due', series: [['Mon', 120], ['Tue', 310], ['Wed', 90], ['Thu', 420], ['Fri', 210], ['Sat', 60], ['Sun', 74]] },
    month: { spent: '$6,820.00', upcoming: '$2,408.95', overdue: '$1,240.00', saved: '$1,150.00', sd: '4% Under Budget', ud: '3 Bills Due', series: [['May', 5200], ['Jun', 6100], ['Jul', 5750], ['Aug', 6900], ['Sep', 6450], ['Oct', 6820]] },
    year: { spent: '$71,460.00', upcoming: '$2,408.95', overdue: '$1,240.00', saved: '$9,320.00', sd: '1% Over Budget', ud: '3 Bills Due', series: [['Q1', 17200], ['Q2', 18400], ['Q3', 19300], ['Q4', 16560]] }
  };
  var period = 'month';
  function setPeriod(p) {
    period = p;
    var d = PERIODS[p];
    ['spent', 'upcoming', 'overdue', 'saved'].forEach(function (k) { $('[data-kpi="' + k + '"]').textContent = d[k]; });
    $('[data-kpi-delta="spent"]').textContent = d.sd;
    $('[data-kpi-delta="upcoming"]').textContent = d.ud;
    var cv = $('#chart');
    cv.setAttribute('aria-label', 'Bar chart of spending: ' + d.series.map(function (s) { return s[0] + ' ' + money(s[1]); }).join(', '));
    drawChart();
  }
  $('#period').addEventListener('s4-change', function (e) { setPeriod(e.detail.value); });

  function drawChart() {
    var cv = $('#chart'), box = cv.parentElement;
    var w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    var dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var g = cv.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, w, h);
    var css = S4.util.css;
    var primary = css('--md-sys-color-primary'), grid = css('--md-sys-color-outline-variant'), text = css('--md-sys-color-on-surface-variant');
    var data = PERIODS[period].series, max = Math.max.apply(null, data.map(function (s) { return s[1]; })) * 1.1;
    var padL = 8, padB = 24, padT = 8, ch = h - padB - padT, bw = (w - padL * 2) / data.length;
    g.strokeStyle = grid; g.lineWidth = 1;
    for (var i = 0; i <= 3; i++) { var y = padT + ch * i / 3; g.beginPath(); g.moveTo(padL, y); g.lineTo(w - padL, y); g.stroke(); }
    g.font = '12px Inter, sans-serif'; g.textAlign = 'center'; g.fillStyle = text;
    data.forEach(function (s, i) {
      var bh = ch * s[1] / max, x = padL + i * bw + bw * 0.2, y = padT + ch - bh;
      g.fillStyle = primary;
      g.beginPath(); g.roundRect(x, y, bw * 0.6, bh, 6); g.fill();
      g.fillStyle = text; g.fillText(s[0], x + bw * 0.3, h - 6);
    });
  }
  new ResizeObserver(drawChart).observe($('.ledger-chart'));
  document.addEventListener('s4-theme', drawChart);

  /* ---------- Settings: theme controls (patterns.md) ---------- */
  document.getElementById('mode').addEventListener('s4-change', function (e) { S4.theme({ mode: e.detail.value }); });
  document.getElementById('contrast').addEventListener('s4-change', function (e) { S4.theme({ contrast: +e.detail.value }); });
  var t = S4.theme();
  $$('#mode [value]').forEach(function (b) { b.setAttribute('aria-pressed', b.value === t.mode); });
  $$('#contrast [value]').forEach(function (b) { b.setAttribute('aria-pressed', +b.value === t.contrast); });

  renderBills();
  setPeriod('month');
})();
