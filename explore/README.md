# Review labs

Interactive pages used to make S4 Orion's design decisions with the owner. They are **not** part of the design system:
they use their own "review blue" UI (`lib/review.css`) so the questionnaire can't be confused with the design being
reviewed, and they save answers in the browser so several labs can be worked through at once.

| Page | Decided |
|---|---|
| `states-shape.html` | States A (stock M3), Shape A (stock M3 Expressive), default color Mono |
| `motion.html` | Springs D (M3 Expressive) |
| `transitions.html` | Unfold menus, container transform for dialogs, sheets and list-to-detail, shared axis between views, snackbars slide from the edge |

`lib/` holds the shared review tooling: `review.js` and `questions.js` (the questionnaire), `theme.js` (seed to M3 roles),
`springs.js` (spring presets as CSS `linear()` easings), plus copies of `m3color.js`, Inter and a few Solar icons. Once the
build exists, the labs will load these from the built assets instead.
