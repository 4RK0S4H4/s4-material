/* Data table behaviour, for every table.s4-table:
   - Column names: copies each header's text into data-label on its body and footer cells (shown when the table reflows
     into stacked rows under 600), and th[data-primary] into data-primary. A cell's own data-label wins; data-label=""
     hides the name for that cell.
   - Sorting: th[aria-sort] > button.s4-table-sort cycles ascending → descending → none (original order), sorts each
     tbody by the cell's data-value or its text (numbers, amounts and dates in data-value sort as numbers), animates the
     rows into place and fires s4-change { type: 'sort', column, label, direction } on the table.
   - Selection: a checkbox in th[data-check] selects all rows (indeterminate when some are); row checkboxes in
     td[data-check]. Fires s4-change { type: 'select', rows } with the selected rows.
   - Clickable rows: tr[tabindex] fires s4-select { row } on click or Enter (and follows the row's first link, if any). */
S4.register('table', function (scope) {
  S4.util.all(scope, 'table.s4-table').forEach(function (table) {
    if (!S4.util.once(table, 'table')) return;
    var slice = function (l) { return Array.prototype.slice.call(l); };
    var bodies = function () { return slice(table.tBodies); };
    var bodyRows = function () { return bodies().reduce(function (a, b) { return a.concat(slice(b.rows)); }, []); };
    var headRow = function () { var h = table.tHead; return h && h.rows.length ? h.rows[h.rows.length - 1] : null; };
    var counter = 0;

    /* header cell for each column index, honouring colspan */
    function columns() {
      var out = [], row = headRow(); if (!row) return out;
      slice(row.cells).forEach(function (th) { for (var i = 0; i < (th.colSpan || 1); i++) out.push(th); });
      return out;
    }
    function cellAt(row, col) {
      var c = 0, cells = row.cells;
      for (var i = 0; i < cells.length; i++) { if (col < c + (cells[i].colSpan || 1)) return cells[i]; c += cells[i].colSpan || 1; }
      return null;
    }

    /* ---------- column names on cells, original order ---------- */
    function label() {
      var cols = columns();
      var rows = bodyRows().concat(table.tFoot ? slice(table.tFoot.rows) : []);
      rows.forEach(function (tr) {
        if (tr.parentNode.tagName === 'TBODY' && !tr.dataset.s4Order) tr.dataset.s4Order = String(counter++);
        var c = 0;
        slice(tr.cells).forEach(function (cell) {
          var th = cols[c]; c += cell.colSpan || 1;
          if (!th || th.hasAttribute('data-check') || cell.hasAttribute('data-check')) return;
          if (!cell.hasAttribute('data-label') && (cell.colSpan || 1) === 1) cell.setAttribute('data-label', th.textContent.trim());
          if (th.hasAttribute('data-primary')) cell.setAttribute('data-primary', '');
          if (th.classList.contains('num') && (cell.colSpan || 1) === 1) cell.classList.add('num');
        });
      });
    }

    /* ---------- sorting ---------- */
    var NUM = /^[\s(+\-−$€£¥]*\d[\d,.\s]*%?\)?$/;
    function key(cell) {
      if (!cell) return { n: null, s: '' };
      var raw = cell.hasAttribute('data-value') ? cell.getAttribute('data-value') : cell.textContent.trim();
      if (cell.hasAttribute('data-value') ? raw !== '' && !isNaN(+raw) : NUM.test(raw)) {
        var neg = /^[\s]*[(\-−]/.test(raw);
        var n = parseFloat(raw.replace(/[^\d.]/g, ''));
        if (!isNaN(n)) return { n: neg ? -n : n, s: raw };
      }
      return { n: null, s: raw };
    }
    var collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    function sort(col, dir) {
      var before = new Map();
      bodyRows().forEach(function (tr) { before.set(tr, tr.getBoundingClientRect().top); });
      bodies().forEach(function (tb) {
        var rows = slice(tb.rows);
        rows.sort(function (a, b) {
          if (dir === 'none') return +a.dataset.s4Order - +b.dataset.s4Order;
          var x = key(cellAt(a, col)), y = key(cellAt(b, col)), r;
          if (x.n !== null && y.n !== null) r = x.n - y.n;
          else if (x.n !== null || y.n !== null) r = x.n !== null ? -1 : 1;   /* numbers before text */
          else r = collator.compare(x.s, y.s);
          if (r === 0) r = +a.dataset.s4Order - +b.dataset.s4Order;           /* stable */
          return dir === 'descending' ? -r : r;
        });
        rows.forEach(function (tr) { tb.appendChild(tr); });
      });
      /* FLIP: each row slides from where it was */
      bodyRows().forEach(function (tr) {
        var dy = before.get(tr) - tr.getBoundingClientRect().top;
        if (dy) S4.motion.animate(tr, [{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], 'spatial', { fill: 'none' });
      });
    }
    table.addEventListener('click', function (e) {
      var btn = e.target.closest('.s4-table-sort'); if (!btn || !table.contains(btn)) return;
      var th = btn.closest('th[aria-sort]'); if (!th) return;
      var next = { none: 'ascending', ascending: 'descending', descending: 'none' }[th.getAttribute('aria-sort')] || 'ascending';
      table.querySelectorAll('th[aria-sort]').forEach(function (h) { h.setAttribute('aria-sort', 'none'); });
      th.setAttribute('aria-sort', next);
      var col = columns().indexOf(th);
      sort(col, next);
      S4.util.emit(table, 's4-change', { type: 'sort', column: col, label: th.textContent.trim(), direction: next });
    });

    /* ---------- selection ---------- */
    var all = function () { return table.querySelector('thead [data-check] input[type="checkbox"]'); };
    var boxes = function () { return slice(table.querySelectorAll('tbody [data-check] input[type="checkbox"]')).filter(function (b) { return !b.disabled; }); };
    function syncAll() {
      var a = all(); if (!a) return;
      var b = boxes(), n = b.filter(function (x) { return x.checked; }).length;
      a.checked = n > 0 && n === b.length;
      a.indeterminate = n > 0 && n < b.length;
    }
    function selected() { return boxes().filter(function (b) { return b.checked; }).map(function (b) { return b.closest('tr'); }); }
    table.addEventListener('change', function (e) {
      var box = e.target; if (!box.matches || !box.matches('[data-check] input[type="checkbox"]')) return;
      if (box === all()) boxes().forEach(function (b) { b.checked = box.checked; });
      syncAll();
      S4.util.emit(table, 's4-change', { type: 'select', rows: selected() });
    });

    /* ---------- clickable rows ---------- */
    var INTERACTIVE = 'a, button, input, select, textarea, label, [data-check]';
    function activate(tr, e) {
      var link = tr.querySelector('a[href]');
      if (link && !(e && e.target.closest('a'))) link.click();
      S4.util.emit(tr, 's4-select', { row: tr });
    }
    table.addEventListener('click', function (e) {
      var tr = e.target.closest('tbody tr[tabindex]'); if (!tr || !table.contains(tr)) return;
      if (e.target.closest(INTERACTIVE)) return;
      activate(tr, e);
    });
    table.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target.matches('tbody tr[tabindex]')) return;
      e.preventDefault();
      activate(e.target, null);
    });

    label();
    syncAll();
    /* rows added or removed later */
    new MutationObserver(function () { label(); syncAll(); }).observe(table, { childList: true, subtree: true });
  });
});
