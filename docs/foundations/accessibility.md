# Accessibility

S4 Orion builds accessibility into tokens and components so apps get it without extra work. These are the guarantees, and
the few things an app still has to do.

## Built in

| Area | What S4 Orion does | Where |
|---|---|---|
| Color contrast | 42 role pairs pass WCAG AA in light, dark and both high-contrast modes; the build fails otherwise | `scripts/build-tokens.mjs` |
| Contrast on glass | Text on glass is ≥ 4.5:1 over any backdrop for every seed (backdrop compression + `on-surface` only) | `glass.css`, `scripts/check-glass.mjs` |
| Contrast levels | Standard, medium, high; device "more contrast" picks high unless the app chose a level | tokens, `S4.theme({ contrast })` |
| Focus | 3dp `secondary` ring, 2dp outside, on every interactive element (`:focus-visible`) | `base.css` |
| Touch targets | ≥ 48dp on every control, even when the visual is 32 or 40dp | components (`::after` hit areas) |
| Reduced motion | Spatial springs become instant; fades remain; JS animations read the same tokens | tokens, `S4.motion` |
| Reduced transparency | Glass becomes solid (`prefers-reduced-transparency`, `data-glass="off"`, no `backdrop-filter` support) | tokens |
| Forced colors | Decorative layers drop out; controls drawn with shadows get real borders | every component |
| Semantics | Native elements underneath (`button`, `input`, `dialog`, `popover`); state in ARIA (`aria-pressed`, `aria-selected`, `aria-current`, `aria-checked`, `aria-expanded`) | every component |
| Keyboard | WAI-ARIA patterns: tabs, menus, button groups and toolbars use arrows/Home/End; dialogs trap focus and return it; Escape closes overlays | component JS |
| Dialog focus | Starts on the first non-destructive action, so Enter never confirms a delete by accident | `dialog.js` |
| Tooltips | Hoverable, dismissible with Escape, linked with `aria-describedby` without replacing existing ids | `tooltip.js` |
| Announcements | Snackbars are announced politely | `snackbar.js` |

## The app's job
- Give every icon-only control an `aria-label` (icon buttons, FABs without a label).
- Label every field with a real `<label>`; put errors in the supporting text and set `aria-invalid="true"`.
- Use headings in order; give each view one `h1` (usually the top app bar title).
- Don't convey status by color alone: use a [status](../../components/status/) label or text.
- Put text over photos on a scrim or a solid chip, never on glass.
- Keep `html[lang]` set and don't disable zoom.
