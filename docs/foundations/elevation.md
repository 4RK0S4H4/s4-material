# Elevation

**Tokens:** `--md-sys-elevation-level0` … `level5` · live: [tokens page](https://4rk0s4h4.github.io/s4-orion/tokens/#elevation)

**S4 Orion has no shadows** (decision 0017). Every elevation level is flat; the names stay so components and apps keep
working, and nothing in the system draws a drop shadow. Depth comes from two things only:

1. **Tonal surfaces.** A card is `surface-container-low` on a `surface` page, a dialog is `surface-container-high`, and
   a raised control sits one container step above what it is on.
2. **Glass transparency** on floating chrome and overlays: blur and tint show what is behind, and a thin frost line
   marks the edge (see `glass.md`).

Don't add `box-shadow` for depth in an app. Where something must read as raised and sits on a flat surface (an elevated
button, a FAB), rely on its container color and shape, not a shadow.
