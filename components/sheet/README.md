# Sheets

A short task without leaving the screen. **Bottom sheets** grow out of a FAB (container transform) or, opened from anything
else, **slide from the bottom edge**; drag the handle down to dismiss. **Side sheets** slide from the end edge. Both on glass.

```html
<button class="s4-fab" data-sheet="add-expense" aria-label="Add expense"><span class="s4-icon" data-icon="add"></span></button>
<dialog class="s4-bottom-sheet" id="add-expense" aria-labelledby="ae-h">
  <span class="s4-sheet-handle" aria-hidden="true"></span>
  <h2 class="s4-sheet-title" id="ae-h">Add Expense</h2>
  <div class="s4-sheet-content">…fields…</div>
  <div class="s4-sheet-actions"><button class="s4-button" data-variant="text" data-close="cancel">Cancel</button><button class="s4-button" data-close="save">Save</button></div>
</dialog>
<dialog class="s4-side-sheet" id="filters">
  <div class="s4-sheet-header"><h2 class="s4-sheet-title">Filters</h2><button class="s4-icon-button" data-close aria-label="Close"><span class="s4-icon" data-icon="close"></span></button></div>
  …
</dialog>
```

Opening, closing, `[data-close]`, `data-persistent`, focus and events work exactly like the [dialog](../dialog/)
(`S4.sheet.open/close` are the same functions). Drag-dismiss fires `s4-close { value: "drag" }`.

**Do:** use a bottom sheet for a quick add or a set of choices on phones; a side sheet for filters or details beside content on
wide screens. **Don't:** put a sheet on a dialog, or a second sheet on a sheet.
