# 0008: Owner critique of the demo (2026-11-07)

Critique after trying the demo: animations too slow for power users; glass took half a second to blur after a container
transform landed; a white edge on top of menus and other small glass elements; clicking an open menu's button reopened it;
menus didn't feel like the container transforms; table re-sort overshoots; checkbox uncheck inconsistent; slider end dot
looks off at max; the whole thing still reads as Material 3 Expressive (text fields, checkboxes, tables, tab headers).

## Done now
- **Faster, tighter springs** (tokens): spatial 415 -> 260 ms, fast-spatial 375 -> 220, slow-spatial 568 -> 340, effects
  222 -> 120, fast-effects 153 -> 90; the calm variants match. Bounce is much smaller (damping 0.75 to 0.9 instead of 0.6 to 0.8).
- **Glass in a container transform** comes on during the last part of the move (tint and blur ramp together while the
  surface is still mostly solid), not after landing. Needs an iPhone check (Safari).
- **No white hairline** on glass: removed from `glass.css` (the `--s4-glass-highlight-*` tokens are now unused).
- **Menus** open by growing out of their anchor's corner (same spring, color and fade pattern as a container transform);
  they use `popover="manual"` with our own outside-click, so the open menu's own button toggles it closed.
- **Table sort** uses the calm spring: no overshoot however far a row travels.
- **Checkbox**: the mark fades out on uncheck and wipes in on check, no springy wipe back.
- **Slider**: no stop dot at the end of the track (dots only with `data-stops`).

## Open: make it less "Material"
Needs the owner's taste: see the Style Lab (`explore/style.html`). Not decided yet.
