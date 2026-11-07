# Motion

**Tokens:** `--md-sys-motion-spring-<name>` (a CSS `linear()` easing) with `-duration`, `-stiffness`, `-damping`; calm
variants `--s4-motion-spring-<name>-calm`; patterns `--s4-motion-pattern-*` · live:
[tokens page](https://4rk0s4h4.github.io/s4-orion/tokens/#motion) · decided in the
[Motion Lab](https://4rk0s4h4.github.io/s4-orion/explore/motion.html) and
[Transitions Lab](https://4rk0s4h4.github.io/s4-orion/explore/transitions.html)

## Springs
S4 Orion uses **M3 Expressive springs**. Each is stored as physics (stiffness, damping ratio, duration) and the build
samples it into a `linear()` easing, so `transition: transform var(--md-sys-motion-spring-spatial-duration) var(--md-sys-motion-spring-spatial)`
moves exactly like the spring.

| Spring | Use | Overshoot |
|---|---|---|
| fast-spatial | Small moves: switch handle, chip check, button press morph | ~9% |
| spatial | Default movement: nav indicator, menu unfold, dialogs and sheets opening, shared axis | ~1.5% |
| slow-spatial | Large movement: full-screen transforms, sheets from the edge | ~1.5% |
| fast-effects / effects / slow-effects | Fades and color changes | none |
| *-calm | Moves that must land exactly on a target: a container collapsing back into its source | none |

**Spatial** springs move and resize things. **Effects** springs fade and recolor; they never overshoot, so colors never
pass their target. Use **calm** springs when overshoot would look broken (shrinking into a button). Under reduced motion,
spatial durations become 0 and fades remain.

## Transition patterns
| Situation | Pattern |
|---|---|
| A surface opened from something you touched: dialog from a button, sheet from a FAB, detail from a row | **Container transform**: the source becomes the container at real size. It starts and ends with the source's rect, corners, color and label; the container travels from the source and its edges open, and the label and content ride on it (nothing slides across the container). Opening, the label fades out by 30% and content fades in from 35%; closing, content is gone by 20% and the label is back by 60%. Glass stays solid while the shape moves and clears once it has landed; the shadow rises after landing. Collapse uses the calm spring; then the real source reappears. |
| Menus | **Unfold**: the menu's shape opens downward from its top edge; items don't move |
| Switching between sibling views: tabs, nav destinations, steps | **Shared axis**: old view slides 30px out and fades, new one slides in from the side you're heading |
| Sheets not opened from a FAB, snackbars | **Slide from edge**: they come from the edge where they live |

Never scale a surface's content to make it appear (S4 Material's Origin did; it stretches text and reads as goofy).
