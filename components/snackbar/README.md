# Snackbar

A short message after an action, often with Undo. **Slides up from the bottom edge**, above a nav bar, docked toolbar or FAB.
A solid inverse surface (not glass), so its `inverse-primary` action keeps 4.5:1.

```js
S4.snackbar({ text: 'Bill archived', action: 'Undo', onAction: restore });
S4.snackbar('Staples marked as paid');
S4.snackbar({ text: 'Couldn’t sync 3 bills. Check your connection.', action: 'Retry', multiline: true, closable: true });
```

| Option | Default |
|---|---|
| `text` | required; sentence case, past tense for confirmations ("Bill archived") |
| `action`, `onAction` | one short action, usually Undo or Retry |
| `closable` | adds a close icon button |
| `multiline` | text on its own line, action below |
| `duration` | 4000ms, or 6000ms with an action; `0` keeps it until dismissed |

Returns `{ element, dismiss() }`. One at a time: a new snackbar replaces the current one. It pauses while hovered or focused,
and is announced politely to screen readers.

**Do:** confirm actions that already happened, offer Undo instead of a confirm dialog. **Don't:** use it for errors that need
a decision (use a dialog) or for messages that must stay (use a banner or inline text).
