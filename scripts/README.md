# Scripts

Build and check tooling. No dependencies beyond Node 20+ for the build; the checks use Playwright.

| Script | What it does | Arrives in |
|---|---|---|
| `build-tokens.mjs` | Reads `tokens/src/*.tokens.json`, validates them, writes `tokens/tokens.css` and `tokens/tokens.ts` | Phase 3 |
| `build.mjs` | Bundles tokens + components into `components/orion.css` and copies assets into `skill/s4-orion/assets/` | Phase 4 |
| `check.mjs` | Loads a page in a phone and a desktop viewport, both themes, and reports contrast over glass, overflow, missing icons and console errors | Phase 4 |
