# S4 Orion

A personal design language for web apps and pages, built on **Material 3 Expressive**, with a **glass layer** reserved for floating chrome. It is the successor to the S4 Material skill (1.3) and is designed to be applied consistently by Claude, through the skill in [`/skill`](skill/), and by hand.

**Live site:** https://4rk0s4h4.github.io/s4-material/ (demos, review labs and reference)

## What's in the repo

| Folder | What it holds | Source or generated |
|---|---|---|
| [`tokens/`](tokens/) | Design tokens. `src/*.tokens.json` (W3C Design Tokens format) is the single source of truth; `tokens.css` and `tokens.ts` are built from it. | JSON is source; CSS/TS generated |
| [`components/`](components/) | Reference implementations: one folder per component with its CSS and an HTML example, a small runtime (`orion.js`) for theming and motion, and React wrappers where they help. | Source |
| [`docs/`](docs/) | Philosophy, foundations, usage guidelines, do/don't examples and the decision log. | Source |
| [`skill/`](skill/) | The Claude skill (`skill/s4-orion/`): `SKILL.md`, reference files loaded on demand, and the built assets an app copies in. | `SKILL.md` and references are source; `assets/` is generated |
| [`demo/`](demo/) | One showcase page that uses every component, built only from the skill and tokens. | Source |
| [`explore/`](explore/) | Review labs used to make design decisions (States and Shape, Motion, Transitions). Not part of the system. | Source |
| [`scripts/`](scripts/) | Build and check scripts (tokens → CSS/TS, bundle, skill references, contrast and glass checks). | Source |
| [`LICENSES/`](LICENSES/) | Third-party licences for bundled fonts, icons and libraries. | — |

The flow is one way: **tokens → components → skill assets → demo**. Change a value in `tokens/src`, run the build, and everything downstream picks it up. Generated files are committed so GitHub Pages can serve them, and are never edited by hand.

## Status

S4 Orion is being built phase by phase. Decisions are recorded in [`docs/decisions/`](docs/decisions/); the current plan, backlog and next steps are in [`docs/NEXT.md`](docs/NEXT.md).

| Phase | What | State |
|---|---|---|
| 1 | Audit of S4 Material 1.3 and decisions | Done ([0001](docs/decisions/0001-phase-1-audit.md)) |
| 2 | Repo structure | Done ([0002](docs/decisions/0002-repo-structure.md)) |
| 3 | Tokens and build script | Done ([0003](docs/decisions/0003-tokens.md), [tokens page](https://4rk0s4h4.github.io/s4-material/tokens/)) |
| 4 | Components and the glass layer | Done ([0004](docs/decisions/0004-glass.md), [components](https://4rk0s4h4.github.io/s4-material/components/)) |
| 5 | Claude skill | Done, approved ([skill](skill/), [download](skill/dist/s4-orion.skill)) |
| 6 | Demo and review against the skill | Built, awaiting owner review ([0005](docs/decisions/0005-phase-6-review.md)) |

## Building

Node 20+, no dependencies.

```sh
npm run build          # tokens -> tokens.css/ts/json, icons -> icons.js, components -> orion.css/orion.js + skill assets
npm run check          # token, contrast and glass-guarantee checks; fails if anything generated is stale (runs in CI)
npm run generate:color # regenerate the default color roles from the seed in tokens/src/color.tokens.json
```

## Credits

See [`LICENSES/`](LICENSES/) and [`NOTICE.md`](NOTICE.md).
