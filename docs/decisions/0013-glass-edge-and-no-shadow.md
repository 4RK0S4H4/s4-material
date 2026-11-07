# 0013: Glass edge is a thin frost line, and glass has no shadow (2026-11-07)

Status: **decided by the owner; applied in `components/glass/glass.css` and `tokens/src/glass.tokens.json`.**

## Path
The owner wanted glass that conveys depth by transparency, with a thin edge that catches light. Explored in the Transparency Labs
(`explore/transparency.html`, `transparency2.html`, `transparency3.html`): shiny, glowing, prism and bevel edges were all rejected; the
direction was "a super thin line, slightly more frosted than the glass, like other apps". Lab 3 showed it on real Orion components.

## Decision
- The edge is one 1px line in milky white at **20%**, even all round, **no fade**, no glow, no gradient. (30 to 50% were seen; 20% "looked perfect".)
- Glass surfaces have **no shadow**. The elevation shadow of the toolbar, menu, dialog and sheets is dropped on glass.
- Both come from the existing `--s4-glass-highlight-*` tokens (alpha 0.2 in light and dark, 0 in high contrast) through an inset `box-shadow` in `glass.css`.
- Wherever glass is solid (high contrast, reduced transparency, no `backdrop-filter`, `data-glass="off"`, a third nested layer) the component's own elevation shadow returns through `revert-layer`: with nothing showing through, the shadow is the only depth cue.
- The glass fill is unchanged (60% tint, 16px blur), so the text-contrast guarantee still holds (`npm run check`: worst 4.52:1 light, 4.53:1 dark over 97 schemes). The owner did not pick the clearer fill from the labs.
- Cards, the FAB and other non-glass raised things keep their shadows for now; the lab's "no shadows" demo removed them too, and the owner chose "No Shadows". **Open:** whether to drop them system-wide (record as a new decision when the owner says).

This reverses the earlier removal of the glass hairline (0008) on purpose: the owner now wants it, as a quieter line.

## Known weak spot
Without a shadow, a floating toolbar over plain white content in light mode barely separates from the page. Options if it bothers the owner: the faint dark outer hairline from Lab 3, or a firmer tint over light backdrops.

## Next explored (not decided)
Transparency for items sitting on glass (text fields, chips, list rows in a menu): Transparency Lab 4. Glass on glass is limited to two layers; items on glass would be translucent fills, not new backdrop blurs.
