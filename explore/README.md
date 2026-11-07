# Review labs

Interactive pages used to make S4 Orion's design decisions with the owner. They are **not** part of the design system:
they use their own "review blue" UI (`lib/review.css`) so the questionnaire can't be confused with the design being
reviewed, and they save answers in the browser so several labs can be worked through at once.

| Page | Decided |
|---|---|
| `states-shape.html` | States A (stock M3), Shape A (stock M3 Expressive), default color Mono |
| `motion.html` | Springs D (M3 Expressive) |
| `liquid-glass.html` | Not adopted: liquid glass (refraction + frost) was explored and shelved; 0004 glass stays ([0006](../docs/decisions/0006-liquid-glass.md)) |
| `liquid5.html` | Open: liquid glass over real pages via a mirror (a live copy of the content with the SVG lens filter on it), iPhone-safe ([0019](../docs/decisions/0019-liquid-glass-mirror.md)); phone page `liquid5-app.html` |
| `liquid4.html` | Open: the WebGL liquid glass over a real DOM page, using a snapshot of the page as the texture (needs the iPhone check) |
| `liquid3.html` | Open: glass with a magnified-rim copy of the content behind it (iPhone-safe, no WebGL) |
| `style2.html` | Open: button groups, sliders, phone sheets and glass edge looks |
| `style.html` | Open: alternative looks (less Material) for text fields, checkboxes, tables and tab headers |
| `icons.html` | Open: plain or boxed glyphs for add, close, check and menu (Solar Bold Duotone either way) |
| `transitions.html` | Unfold menus, container transform for dialogs, sheets and list-to-detail, shared axis between views, snackbars slide from the edge |

`lib/` holds the shared review tooling: `review.js` and `questions.js` (the questionnaire), `theme.js` (seed to M3 roles),
`springs.js` (spring presets as CSS `linear()` easings), `liquid-glass.js` (the liquid glass engine: WebGL2 refraction over a canvas backdrop everywhere, SVG `backdrop-filter` refraction in Chromium), plus copies of `m3color.js`, Inter and a few Solar icons. Once the
build exists, the labs will load these from the built assets instead.
