<!-- GENERATED copy of docs/foundations/shape.md (scripts/build.mjs). Edit the original. -->
# Shape

**Tokens:** `--md-sys-shape-corner-*` (scale) and `--s4-shape-*` (which step each component uses) · live:
[tokens page](https://4rk0s4h4.github.io/s4-material/tokens/#shape)

S4 Orion uses the **stock M3 Expressive corner scale** (decision 0001: Shape A): none 0, extra-small 4, small 8, medium 12,
large 16, large-increased 20, extra-large 28, extra-large-increased 32, extra-extra-large 48, full.

- Components use `--s4-shape-<component>`, which points at a step of the scale, so a component's corner is set in one place.
- **Buttons are pills that square off while pressed** (full → small): M3 Expressive's shape morph, animated with the
  fast-spatial spring.
- **Filled text fields** round only their top corners; the bottom edge stays square with its indicator line.
- **Segmented lists** use extra-small inner corners inside a large outer group.
- Edges that meet the screen stay square: a bottom sheet's bottom edge, full-screen dialogs, a docked toolbar.
- Don't invent radii in app CSS; pick a step from the scale.
