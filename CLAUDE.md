# S4 Orion: working notes for Claude

S4 Orion is the owner's personal design system for web apps and pages: Material 3 Expressive plus a very clear,
contrast-guaranteed glass layer on floating chrome. It replaces the older **S4 Material** skill. **S4 Glass is a separate,
unrelated system**; don't mix the two. The repo is named `s4-material` for history only; the product is **S4 Orion**.

**Start every session by reading [`docs/NEXT.md`](docs/NEXT.md)**: current phase, the plan for what's left, the backlog
and the open questions. Update it (and the README phase table and CHANGELOG) before ending any session that changed
something, so the next session can pick up cold.

## How the owner works

- **Publish everything reviewable to GitHub Pages** and link it in the reply: https://4rk0s4h4.github.io/s4-material/
  (deploys from `main`, repo root). The owner reviews on an iPhone, so check pages at 390px as well as desktop.
- **Design decisions are made through review labs** in `explore/` (questionnaire style: options picked by tapping the
  option card right above its demo, answers saved in localStorage with an in-memory fallback, a Copy Answers button at
  the end). Labs use their own "review blue" UI so the questionnaire never looks like the design being reviewed.
  Bump `?v=` query strings on lab assets when changing them (iOS caching).
- **Pause for approval** at the points named in `docs/NEXT.md`; otherwise keep going without asking.
- Keep replies short and plain; lead with links and what needs a decision. Subagents are fine for parallel work.
- Recorded decisions live in `docs/decisions/` (0001 audit, 0002 repo, 0003 tokens, 0004 glass). Don't reopen a
  decision without the owner; add a new numbered record for new ones.

## Git and publishing

- Work on branch `s4-orion`; publish with `git push origin s4-orion && git push origin s4-orion:main` (fast-forward).
  No PRs needed for this repo; the owner reviews on Pages.
- **A new session starts on its own branch** (e.g. `claude/<name>`). Ignore it: `git fetch origin s4-orion main &&
  git checkout -B s4-orion origin/s4-orion`, work there, publish as above. Only if pushing to `s4-orion`/`main` is
  refused, push the session branch and open a PR into `main` instead (Pages updates when it's merged).
- Don't ask the owner which branch to use or whether to start the next phase: `docs/NEXT.md` says what's next.
- Commit after each meaningful step with a clear message. Never put model names or IDs in commits, code or docs.
- CI (`.github/workflows/check.yml`) runs `npm run check` on every push. It must stay green.

## Build and check (Node 20+, no dependencies; Playwright only for the page checker)

```sh
npm run build    # tokens -> tokens.css/ts/json; icons -> icons.js; components -> orion.css/js; skill assets + generated references
npm run check    # token validation + WCAG pairs, icons, glass guarantee (97 schemes), stale-output check
node skill/s4-orion/scripts/check.mjs page.html [--out dir]   # page checker: 390 dark + 1280 light, contrast, overflow, lint
```

Generated files are committed (Pages serves them) and never edited by hand: `tokens/tokens.*`, `components/orion.*`,
`components/assets/icons.js`, `skill/s4-orion/assets/*`, and `skill/s4-orion/references/*` **except** `patterns.md`.

After changing the skill, re-package it with skill-creator's packager (path varies per environment; find it with
`find / -name package_skill.py -path '*skill-creator*' 2>/dev/null`), run from the skill-creator folder:
`python3 -m scripts.package_skill <repo>/skill/s4-orion <repo>/skill/dist` → `skill/dist/s4-orion.skill`.
Validate with `scripts/quick_validate.py <repo>/skill/s4-orion`. Keep `SKILL.md` under ~500 lines.

## Map

| Path | What |
|---|---|
| `tokens/src/*.tokens.json` | Source of truth (W3C DTCG; modes in `$extensions["com.s4.modes"]`). |
| `scripts/` | `build-tokens.mjs`, `generate-color.mjs`, `check-glass.mjs`, `build-icons.mjs`, `build.mjs` (bundle + skill). |
| `components/` | One folder per component (`.css`, `.js`, reference `.html`, `README.md`). Rules: `components/CONVENTIONS.md`. Gallery: `components/index.html`. |
| `docs/` | `philosophy.md`, `foundations/*.md` (copied into the skill), `decisions/`, `NEXT.md`. |
| `skill/s4-orion/` | The Claude skill: `SKILL.md`, `references/`, `assets/`, `scripts/check.mjs`, `scripts/inline.mjs`, `evals/`. |
| `demo/` | Phase 6 showcase app (to build). |
| `explore/` | Review labs (not part of the system). |
| `index.html` | Pages hub linking everything. |

## Rules that are easy to break

- CSS: tokens only (no hex/rgb, raw ms, cubic-bezier), everything in `@layer s4.*`, mode blocks wrapped in `:where()`.
- Glass only on floating chrome and overlays, max two layers, solid in high contrast / reduced transparency / no
  backdrop-filter. Text on glass is `on-surface`. Content (cards, lists, panes, fields) is always solid.
- Motion: container transform (source becomes the container; collapse on a calm spring, color fades linearly),
  unfold for menus, shared axis between views (30px, out then in), slide from edge for sheets/snackbars. No origin scaling.
- Monochrome by default; a seed only when an app asks for color. Inter; Solar icons (Bold Duotone, Linear arrows)
  behind semantic names in `components/icons/names.json`. Title Case labels, sentence case sentences.
