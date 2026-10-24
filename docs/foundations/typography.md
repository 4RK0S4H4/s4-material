# Typography

**Tokens:** `--md-sys-typescale-<role>-{font,size,line-height,tracking,weight}`, `--md-sys-typescale-emphasized-<role>-weight`,
`--md-ref-typeface-{brand,plain,mono}` · live: [tokens page](https://4rk0s4h4.github.io/s4-material/tokens/#type)

- **Typeface:** Inter (variable, all OpenType features), bundled as `inter-variable.woff2`. Load it from the bundle, not
  Google Fonts, so `tnum`, `case`, `zero` and `frac` work. Inter plays with its default glyphs.
- **Scale:** the 15 M3 roles (display, headline, title, body, label × large/medium/small), with M3's sizes, line heights
  and tracking (Compose token values, as in S4 Material). M3 Expressive's **emphasized** weights are for moments that
  need more weight: a hero number, the selected item, a key title.
- **Body text is 16px** (`body-large`) by default; `body-medium` (14px) for dense secondary content.
- **Numbers:** tabular figures (`font-variant-numeric: tabular-nums`) on anything compared or scanned: amounts, counts,
  dates, IDs, table cells and inputs. Running text stays proportional.
- **Capitalisation:** Title Case for labels (buttons, tabs, headings, column headers, menu items); sentence case for
  sentences (helper text, toasts, dialog questions, empty states).

| Role | Use |
|---|---|
| display-* | Hero numbers and very short headlines |
| headline-* | Page and section titles |
| title-large | Top app bar title, dialog-adjacent headings |
| title-medium / small | Card and pane titles, list headlines |
| body-* | Running text, list supporting text |
| label-* | Buttons, chips, tabs, badges, captions |
