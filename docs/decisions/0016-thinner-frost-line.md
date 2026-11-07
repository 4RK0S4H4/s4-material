# 0016: Thinner frost line, content-facing edge only on bars (2026-11-07)

Status: **applied after the owner's iPhone check of the demo; adjusts 0013.**

The owner's iPhone screenshot of the demo showed the frost line on the top app bar and nav bar as a box around the bar and "way too thick".
Two causes: the line was a full 1px ring (3 device pixels at 3x) on all four sides, including the sides that touch the screen edge.

- `--s4-glass-highlight-width` 1px to **0.5px** (about 1.5 device pixels on a phone) and the alpha 20% to **28%** so the thinner line stays visible. Tune these two tokens if it is still off.
- Full-width and docked surfaces (top app bar, nav bar, docked toolbar, modal rail, side sheet, bottom sheet from 600px) draw the line **only on the edge facing the content**. Floating surfaces keep the full ring.
- The demo's copy of the stylesheet was stale (it had none of 0013 to 0015 until today and its font path was wrong after refresh). `npm run build` now regenerates `demo/orion.css`, `demo/orion.js` and the `?v=` stamps in `demo/index.html`, and `--check` fails if they are stale.
