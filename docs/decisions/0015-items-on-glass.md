# 0015: Items on glass (2026-11-07)

Status: **decided by the owner; applied in `components/glass/glass.css` and `tokens/src/glass.tokens.json`.**

## Path
The owner wanted transparency on the things sitting on glass too. Transparency Lab 4 went through four rounds: item fills and frost lines on everything (rejected:
"I didn't want every element on a glass surface to have the front lines"), own color kept as the main thing, and finally "no outline or frost
lines at all unless the item is an outlined item with no fill". The owner picked the frost line (C) for those, and **full fill** for everything
else ("let's try full fill").

## Decision
- Buttons (except text buttons), chips and text fields on glass draw their own color at `--s4-glass-item-fill` = **1** (full). The knob exists so the owner can try 0.7 or 0.55 later; the lab showed those levels.
- Text fields and the unchecked switch lose their outline at rest. Hover, focus, error and disabled outlines stay (they carry state).
- Outlined buttons and unselected chips (outline, no fill) keep an outline drawn as `--s4-glass-item-outline` (white 28%, 0 in high contrast). Error-colored outlined buttons keep their red.
- Every rule is skipped where glass is solid (high contrast and `data-glass="off"` through the selector; reduced transparency and no `backdrop-filter` through `revert-layer` blocks), so the components' own outlines return there.
- Text stays on-surface and button label colors are unchanged. At full fill the item colors are the solid component colors, so the text-contrast guarantee does not change (`npm run check` passes: worst 4.52:1 light, 4.53:1 dark). **If the fill is ever lowered, the glass check must be extended to the translucent filled buttons first.**

## Not decided
Whether the off switch needs a faint ring (flagged by the owner's review: without it a pale track sits on the glass). At full fill the track is solid and visible, so it stays ringless for now.
