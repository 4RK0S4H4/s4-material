/* Text field behaviour.
   - adds placeholder=" " so the floating label can use :placeholder-shown
   - outlined fields get a <fieldset><legend> for the notch (the browser cuts the border around the legend)
   - selects get a chevron; clicking anywhere in the field focuses the control (and opens a select's picker)
   - textareas grow with their content
   - data-counter shows "length / maxlength" under the field
   - links the supporting text with aria-describedby; data-error="Message" sets aria-invalid on the control and shows
     the message in place of the helper text (removing data-error restores it). */
S4.register('text-field', function (scope) {
  var uid = 0;
  S4.util.all(scope, '.s4-text-field').forEach(function (f) {
    if (!S4.util.once(f, 'textField')) return;
    var c = f.querySelector(':scope > input, :scope > select, :scope > textarea');
    if (!c) return;
    var label = f.querySelector(':scope > label');
    var isSelect = c.tagName === 'SELECT', isArea = c.tagName === 'TEXTAREA';
    if (!isSelect && !c.hasAttribute('placeholder')) c.setAttribute('placeholder', ' ');

    /* outlined notch */
    if (f.dataset.variant === 'outlined' && label && !f.querySelector(':scope > .s4-text-field-outline')) {
      var fs = document.createElement('fieldset'); fs.className = 's4-text-field-outline'; fs.setAttribute('aria-hidden', 'true');
      var lg = document.createElement('legend'), sp = document.createElement('span');
      sp.textContent = label.textContent.trim(); lg.appendChild(sp); fs.appendChild(lg); f.appendChild(fs);
    }

    /* select chevron */
    if (isSelect && !f.querySelector(':scope > select ~ .s4-icon, :scope > select ~ .s4-icon-button')) {
      var ch = document.createElement('span'); ch.className = 's4-icon s4-text-field-chevron'; ch.dataset.icon = 'chevron-down';
      c.after(ch); S4.icon.set(ch, 'chevron-down');
    }

    /* the whole container is the hit area */
    f.addEventListener('click', function (e) {
      if (c.disabled || e.target === c || e.target.closest('button, a, .s4-text-field-supporting, .s4-text-field-counter')) return;
      c.focus();
      if (isSelect && c.showPicker) { try { c.showPicker(); } catch (err) {} }
    });

    /* textarea auto height */
    if (isArea) {
      var grow = function () { c.style.height = 'auto'; c.style.height = c.scrollHeight + 'px'; };
      c.addEventListener('input', grow);
      requestAnimationFrame(grow);
    }

    /* supporting text + aria-describedby */
    var sup = f.querySelector(':scope > .s4-text-field-supporting');
    var describe = function (el) {
      if (!el.id) el.id = 's4-tf-' + (++uid) + '-' + Math.random().toString(36).slice(2, 6);
      var ids = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (ids.indexOf(el.id) < 0) { ids.push(el.id); c.setAttribute('aria-describedby', ids.join(' ')); }
    };
    if (sup) describe(sup);

    /* counter */
    if (f.hasAttribute('data-counter')) {
      var ct = document.createElement('span'); ct.className = 's4-text-field-counter'; ct.setAttribute('aria-hidden', 'true');
      f.appendChild(ct);
      var count = function () { var max = c.getAttribute('maxlength'); ct.textContent = c.value.length + (max ? ' / ' + max : ''); };
      c.addEventListener('input', count); count();
    }

    /* error message */
    var helper = sup ? sup.textContent : '';
    var syncError = function () {
      var msg = f.getAttribute('data-error');
      if (msg === null) {
        if (f.dataset.s4ErrorSet) { c.removeAttribute('aria-invalid'); delete f.dataset.s4ErrorSet; }
        if (sup && sup.textContent !== helper) sup.textContent = helper;
        return;
      }
      if (c.getAttribute('aria-invalid') !== 'true') { c.setAttribute('aria-invalid', 'true'); f.dataset.s4ErrorSet = '1'; }
      if (msg) {
        if (!sup) { sup = document.createElement('div'); sup.className = 's4-text-field-supporting'; f.appendChild(sup); describe(sup); }
        sup.textContent = msg;
      }
    };
    requestAnimationFrame(function () { requestAnimationFrame(function () { f.setAttribute('data-ready', ''); }); });
    new MutationObserver(syncError).observe(f, { attributes: true, attributeFilter: ['data-error'] });
    syncError();
  });
});
