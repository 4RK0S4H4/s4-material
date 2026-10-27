# Where S4 Orion stands (resume here)

Last updated: 2026-10-27, end of Phase 5 (awaiting approval).

## Done
- Phases 1–5 complete and published. Decisions: `docs/decisions/0001`–`0004`.
- Live: hub https://4rk0s4h4.github.io/s4-material/ · tokens `/tokens/` · components `/components/` · labs `/explore/` ·
  skill download `/skill/dist/s4-orion.skill`.
- `npm run build` and `npm run check` pass (tokens, icons, glass guarantee, bundle + generated skill references). CI runs `npm run check`.
- Publishing: work on `s4-orion`, fast-forward `main` (GitHub Pages deploys from `main`, root).

## Phase 5 summary
- `skill/s4-orion/SKILL.md` (~220 lines), `references/patterns.md` (hand-written), generated references
  (components, tokens, icons, foundations), `scripts/check.mjs`, `scripts/inline.mjs`, three evals.
- Re-package after skill changes: skill-creator `package_skill.py` → `skill/dist/s4-orion.skill`.
- S4 Glass is a separate, unrelated system; Orion only claims "my design system" for apps already on Orion or S4 Material.

## Next: Phase 6
- Build `demo/index.html` using only the skill and tokens (ideally a fresh agent given only the skill); run
  `scripts/check.mjs` on it; review against SKILL.md; fix skill wording where output drifted; link it from the hub.

## Open items
- Filled toggle buttons (unselected = surface-container) look faint on surface-container-low in dark mode.
- `_example/example.js` Color group doesn't follow swatch clicks (swatches do follow the bar).
- Possible tokens: connected-group gap 2px, 18dp checkbox/chip check size, switch track 52, FAB-m 80, slider handle 44.
- Container queries use literal 600/840px (var() isn't allowed in @container conditions).
- Untested in Safari/WebKit (not available in the build sandbox): container transform, `display: contents` nav pills, popover menus.
- The review labs in `explore/` still load their own copies of m3color/Inter; could switch to `components/assets/`.
- The hub page (`index.html`) uses its own hand-written styles (pre-Orion); restyle it with orion.css in Phase 6.
