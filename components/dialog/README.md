# Dialog

Asks for a decision or a short input. The button you press **becomes** the dialog (container transform): its shape and
color grow into the dialog at real size while the label fades out and the content fades in; closing runs it back into
the button. On glass, over a 32% scrim.

```html
<button class="s4-button" data-color="error" data-dialog="confirm-delete">Delete Bill</button>
<dialog class="s4-dialog" id="confirm-delete" aria-labelledby="cd-h">
  <span class="s4-icon s4-dialog-icon" data-icon="delete"></span>
  <h2 class="s4-dialog-headline" id="cd-h">Delete this bill?</h2>
  <div class="s4-dialog-content">Staples, $72.40. This can’t be undone.</div>
  <div class="s4-dialog-actions">
    <button class="s4-button" data-variant="text" data-close="cancel">Cancel</button>
    <button class="s4-button" data-variant="text" data-color="error" data-close="delete">Delete</button>
  </div>
</dialog>
```

| Attribute / API | Use |
|---|---|
| `[data-dialog="id"]` | Opens the dialog from this element (container transform) |
| `[data-close="value"]` | Closes it; the value comes back in `s4-close { value }` |
| `data-fullscreen="compact"` | Full screen on phones. Needs **both** markups: the normal headline + actions (wide screens) and a `.s4-dialog-bar` (phones) holding a close icon button (`data-close="cancel"`), a `.s4-dialog-headline` and a confirm text button; the other set is hidden at each size |
| `data-persistent` | A click on the scrim doesn't close it (Escape still does) |
| `data-origin="none"` | Fade in place instead of growing from the opener |
| JS | `S4.dialog.open(id, { from })`, `S4.dialog.close(id, value)`; events `s4-open`, `s4-close` |

**Focus:** `[autofocus]` wins; otherwise the first focusable element that isn't destructive, so Enter never confirms a delete
by accident. Focus returns to the opener.

**Do:** questions as headlines in sentence case ("Delete this bill?"); actions say what they do ("Delete", not "OK"); confirm
only what can't be undone (use Undo in a snackbar otherwise). **Don't:** stack dialogs; put a dialog on a sheet.
