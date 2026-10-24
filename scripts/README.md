# Scripts

Build and check tooling. No dependencies beyond Node 20+ for the build; the checks use Playwright.

| Script | What it does | Arrives in |
|---|---|---|
| `build-tokens.mjs` | Reads `tokens/src/*.tokens.json`, validates types, aliases and WCAG contrast, writes `tokens/tokens.css`, `tokens.ts`, `tokens.json`. `--check` fails on stale output | Done |
| `generate-color.mjs` | Regenerates the default color roles (four modes) from the seed in `color.tokens.json` | Done |
| `build.mjs` | Bundles tokens + components into `components/orion.css` and copies assets into `skill/s4-orion/assets/` | Phase 4 |
| `check.mjs` | Loads a page in a phone and a desktop viewport, both themes, and reports contrast over glass, overflow, missing icons and console errors | Phase 4 |
