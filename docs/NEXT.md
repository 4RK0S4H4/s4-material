# Where S4 Orion stands (resume here)

Last updated: 2026-10-25, end of Phase 4.

## Done
- Phase 1–4 complete and published. Decisions: `docs/decisions/0001`–`0004`.
- Live: hub https://4rk0s4h4.github.io/s4-material/ · tokens `/tokens/` · components `/components/` · labs `/explore/`.
- `npm run build` and `npm run check` pass (tokens, icons, glass guarantee, bundle). CI runs `npm run check`.
- Publishing: work on `s4-orion`, fast-forward `main` (GitHub Pages deploys from `main`, root).

## Next: Phase 5 (rewrite the skill), then pause for approval
- Use skill-creator. Skill lives in `skill/s4-orion/` (`SKILL.md` < ~500 lines, `references/` loaded on demand, `assets/` copied by `scripts/build.mjs`, `scripts/`, `evals/`).
- Trigger description replaces the S4 Material skill (S4 Glass stays separate).
- References to write: tokens, components (markup cheat sheet from each component README), glass rules, motion and transitions, accessibility, page shape / app shell, theming API.
- Include common mistakes and one short worked example. Package with `package_skill.py`.

## Then: Phase 6
- Build `demo/index.html` using only the skill and tokens; review it against the skill; fix skill wording where output drifted.

## Open items noted during Phase 4
- Filled toggle buttons (unselected = surface-container) look faint on surface-container-low in dark mode.
- `_example/example.js` Color group doesn't follow swatch clicks (swatches do follow the bar).
- Possible tokens: connected-group gap 2px, 18dp checkbox/chip check size, switch track 52, FAB-m 80, slider handle 44.
- Container queries use literal 600/840px (var() isn't allowed in @container conditions).
- Untested in Safari/WebKit (not available in the build sandbox): container transform, `display: contents` nav pills, popover menus.
- The review labs in `explore/` still load their own copies of m3color/Inter; could switch to `components/assets/`.
