# Progress

Shows that something is happening (M3 Expressive): linear or circular, determinate or indeterminate. M3E details: a 4dp
gap between the indicator and the track, rounded ends, and a stop dot at the end of a linear track.

```html
<div class="s4-progress" data-value="0.62" aria-label="Q4 Budget Used"></div>              <!-- linear, determinate -->
<div class="s4-progress" aria-label="Syncing With Your Bank"></div>                       <!-- linear, indeterminate -->
<div class="s4-progress" data-type="circular" data-value="0.4" aria-label="Scanning"></div>
<div class="s4-progress" data-type="circular" aria-label="Loading Bills"></div>
```

| Attribute | Values | Default |
|---|---|---|
| `data-type` | `linear`, `circular` | `linear` |
| `data-value` | 0 to 1 (clamped); leave out for indeterminate. Change it at any time; the indicator moves with a spring | indeterminate |
| `aria-label` | what is in progress (required) | — |

progress.js sets `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` (removed when
indeterminate) and the internal `--_value`, and draws the circular indicator's SVG.

**Linear:** full width, 4dp high; primary indicator, secondary-container track, 4dp stop dot in primary at the track's end
(it disappears at 100%). **Circular:** 40dp, 4dp stroke with round caps; the track shows only while determinate.

**Public knobs.** The indeterminate loops are long, linear cycles that no spring token describes, so they are
component-level custom properties:

| Property | What | Default |
|---|---|---|
| `--s4-progress-cycle` | linear indeterminate cycle (M3: two lines, 1800ms) | `1800ms` |
| `--s4-progress-circular-cycle` | circular arc grow-and-catch-up cycle | `1333ms` |
| `--s4-progress-circular-spin` | circular rotation | `2000ms` |

**Reduced motion.** This component carries the one allowed `@media (prefers-reduced-motion: reduce)` query: tokens can't
stop an infinite loop, so the indeterminate animations stop and show a still, partial indicator (40% of the linear bar,
a quarter arc). `:root[data-motion="reduced"]` (S4.motion's app switch) does the same. Determinate changes use the
calm spatial spring, which the tokens already zero under reduced motion.

**When to use what:** **linear** at the top of a surface or under the thing it describes (an upload, a budget); **circular**
in a small space (a button, a card corner, a full-screen load). Use **determinate** whenever you know the fraction.

**Do**
- Label it with what is happening ("Uploading Receipts"), and show the figure next to it when it means something
  ("$6,820.00 of $11,000.00").
- Remove the indicator when the work is done; don't leave a full bar on screen.

**Don't**
- Don't show a progress indicator for actions under about a second.
- Don't stack several indeterminate indicators on one screen.

**Accessibility:** a real `progressbar` with a name and value. Forced-colors mode draws the linear track with a border and
the indicator in CanvasText.

**Tokens:** `--md-sys-color-primary`, `--md-sys-color-secondary-container`, `--s4-space-1` (thickness and gap),
`--s4-space-10` (circular size), `--md-sys-shape-corner-full`, `--s4-motion-spring-spatial-calm` (value changes),
`--md-sys-motion-spring-slow-effects` (indeterminate easing per segment).
