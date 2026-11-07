# 0018: Menus emerge from underneath their button (2026-11-07)

Status: **decided by the owner (Menu Motion Lab: D plus a note); default for every menu.** The owner has not yet seen the final version on the iPhone.

Path: 0001 unfold, 0008 grow from the button, 0010 quieter unfold (what shipped), then the owner asked for something closer to a container transform with the original button kept. The lab tried: container transform (button hides), button stays, expand from the button edge, button expanding in place. The owner picked **D (container transform, button stays)** with the note: "make it come from underneath the button and only the shape, and don't have the text move".

## Decision
- `S4.transition.unfold` now defaults to `emerge`: the menu's surface starts hidden under the button (its rect, corners and color) and travels to its place while its edges open. The button and its label never move; no label is carried into the menu. Options fade in; color goes from the button's to the menu's, solid while it moves, glass after landing. Closing runs back under the button.
- A still copy of the button is shown above the surface (in the top layer) only while the animation runs, so the moving surface can never paint over the real button. The copy is removed at the end.
- The menu is never narrower than its button while open, so the button never reaches past the surface.
- Other styles stay reachable with `data-motion` on the menu (or `S4.menuMotion`): `quiet` (the old unfold), `grow`, `edge`, `inplace`, `transform`, `transform-keep`. They are not documented as supported patterns; prune them once the owner has lived with `emerge`.
- Reduced motion: a plain fade, as before.
