# 0012: Liquid glass on real pages, and why Safari broke Lab 4 (2026-11-07)

Status: **proposal, waiting for the owner.** Nothing is built into `components/`.

## What happened
Lab 4 on iPhone Safari showed no WebGL glass, doubled text near the bottom and an off layout. WebKit isn't available in the
sandbox (Playwright's download host is blocked), so this is reasoned, not reproduced.

## Most likely cause
Lab 4 draws the page into an SVG `foreignObject`, paints that onto a canvas and uploads the canvas to WebGL. **WebKit marks a
canvas tainted after it has drawn an SVG containing a foreignObject**, and `texImage2D` then throws `SecurityError`. The old
render loop swallowed the error every frame, so the glass canvas stayed empty and the page looked like plain DOM. Chromium and
Firefox don't taint, which is why it worked here. The doubled text is not explained by this; it is not diagnosed.

## What changed in the lab
- `liquid-glass.js` (v6): a render error turns that stage off once and calls `onError`; `LiquidGlass.diag()`; `Stage.drawn()`.
- `liquid4.html`: every snapshot step is timed out and named (load, taint, blank), the texture is size-capped, a blank first draw
  is retried, and a status line at the top says what happened (browser, WebGL2, snapshot size and time, canvas clean/tainted,
  texture content, glass drawn). On any failure the phone falls back to plain `backdrop-filter` blur and says so. Tested in
  Chromium with a simulated taint: falls back cleanly.

## Decision needed (after the owner reads the status line on the iPhone)
1. If it says **TAINTED**: the snapshot approach can't work on Safari. Options: (a) keep Orion's blur as is; (b) Lab 3's DOM-copy
   glass (no WebGL, runs on iPhone, magnified rim); (c) hybrid: WebGL glass only where the backdrop is a canvas or a few
   known images (hero photo), blur elsewhere; (d) a hand-written DOM rasteriser for Orion's own components (covers Safari, but is a
   large, fragile build).
2. If it says **clean and drawn**: design `S4.glass` as opt-in for nav bar, toolbar, menu and dialog, blur as fallback, max two
   layers, text `on-surface`, solid under high contrast / reduced transparency / no WebGL. Write that proposal then.
