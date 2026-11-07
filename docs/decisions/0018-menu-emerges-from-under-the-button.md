# 0018: Menus emerge from underneath their button (2026-11-07)

Status: **decided by the owner (Menu Motion Lab: D plus a note); default for every menu.** The owner has not yet seen the final version on the iPhone.

Path: 0001 unfold, 0008 grow from the button, 0010 quieter unfold (what shipped), then the owner asked for something closer to a container transform with the original button kept. The lab tried: container transform (button hides), button stays, expand from the button edge, button expanding in place. The owner picked **D (container transform, button stays)** with the note: "make it come from underneath the button and only the shape, and don't have the text move".

## Decision
- `S4.transition.unfold` defaults to `emerge`: the menu sits at its final place and its surface is revealed by a clip that starts as a thin lip under the button (the button's width, aligned to it, the button's color) and opens to the whole menu while the options fade in. **Nothing is copied and nothing but the shape moves; the button is never touched.**
- First build (same day) carried a still copy of the button above the surface in the top layer. The owner's iPhone check: "very buggy, symbol moves, button changes shape for a split second, blur is choppy". The copy was the cause of the first two (it never lays out exactly like the real button); it is gone.
- **Second iPhone check (screenshots):** the clip-path version showed the whole glass pane at full size from the first frame, with the solid lip stuck to its top. WebKit paints `backdrop-filter` in a layer that `clip-path` does not clip. That is also what made every earlier clip-based open (container transform, unfold) look choppy on Safari. So `emerge` no longer uses clip-path: the surface's own box (left, top, width, height, border-radius) animates from a lip the button's width to the menu, the options keep their final width inside (hidden by overflow) so nothing reflows.
- Blur is never animated (Safari can't animate it smoothly under a moving clip, the same trouble the container transform had): the surface is solid with no blur while the shape moves; after it lands the blur comes on under the still-solid surface and only the color fades to glass (150ms). Closing: color to solid, then the shape folds back under the button with the blur off.
- The menu is never narrower than its button while open.
- Other styles stay reachable with `data-motion` on the menu (or `S4.menuMotion`): `quiet` (the old unfold), `grow`, `edge`, `inplace`, `transform`, `transform-keep`. Not documented as supported patterns; prune them once the owner has lived with `emerge`.
- Reduced motion: a plain fade, as before.

Not verified: Safari (only Chromium frames were checked). If the blur still stutters on the iPhone, the next step is to keep menus solid for the whole open animation and fade the glass in only on landing, or to drop the blur on menus.
