# 0018: Menus grow out from behind their button (2026-11-07)

Status: **decided by the owner (Menu Motion Lab: D, with the shape in a lower layer than the button); default for every menu. Awaiting the owner's iPhone check of the final build.**

Path: 0001 unfold, 0008 grow from the button, 0010 quieter unfold, then the owner asked for a container transform with the original button kept. The lab tried several; the owner picked **D (container transform, button stays)** and then explained twice what "underneath" meant: not lower on the page, but **a lower layer: the shape should come from beneath the button, not from above it**.

## What failed first (kept as lessons)
- A still copy of the button above the moving surface: the copy never lays out exactly like the real button (symbol moved, button changed shape for a frame).
- Revealing the menu with `clip-path`: WebKit paints `backdrop-filter` in a layer a clip does not clip, so the whole glass pane showed at full size from the first frame, and animating the blur is choppy.
- A zero-height sliver, a box grown from below the button, and an even-odd clip with the button as a hole: all read as "a shape appearing below the button", not as coming from behind it.

## Decision (the final build)
- `S4.transition.unfold` defaults to `emerge`. The real menu is in the browser's top layer, which always paints above the page, so it cannot be below the button. Instead a plain layer (a `div`, not in the top layer, no backdrop-filter) is inserted into the button's own stacking context just behind it (the button is lifted one step above it, then restored). The layer starts as exactly the button's rectangle, color and corners and grows into the menu's final box; the button is never copied, moved or covered.
- The real menu stays hidden until the layer lands, then takes over at the same place, still solid; the options fade in and the color fades to glass. The blur is never animated: it comes on under the solid menu. Focus moves into the menu at the handoff.
- Closing is the same backwards. A button with no fill grows in the menu's color. The menu is never narrower than its button. Reduced motion: a plain fade.
- Other styles stay reachable with `data-motion` (or `S4.menuMotion`): `quiet` (the old unfold), `grow`, `edge`, `inplace`, `transform`, `transform-keep` (D as the owner first saw it). Not documented as supported patterns; prune once the owner has lived with `emerge`.

## After the owner's check of the final build (H)
H was picked, but "still pretty buggy and not a smooth transition; button shape glitches when clicking". Cause of the click glitch: Orion buttons square off while pressed and spring back (`:active` radius), so a layer that started exactly at the button's rect and pill shape showed past the moving edge. Fixes: the layer starts 2px INSIDE the button as a pill (always hidden behind it); a plain icon button (the three dots) has no fill, so the layer starts as its hover circle (the faint tint of its own color over the page) and that hover shape grows into the menu, as the owner suggested; a short solid hold (80ms) after the handoff before the glass fades in, because the first frames with the blur on are the expensive ones.

Not verified: Safari (only Chromium frames, with the layer visibly growing from behind the button and the button crisp on top).
