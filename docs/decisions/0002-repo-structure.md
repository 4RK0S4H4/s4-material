# 0002: Repo structure

Status: accepted
Date: 2026-10-24

## Decision

```
tokens/      src/*.tokens.json (source) → tokens.css, tokens.ts (generated)
components/  base/, one folder per component (css + html + README), glass/, motion/, orion.js, orion.css (generated), react/
docs/        philosophy, foundations/, components/, decisions/
skill/       s4-orion/ (SKILL.md, references/, assets/ (generated), scripts/, evals/)
demo/        index.html: every component, built from the skill and tokens only
explore/     review labs (not part of the system)
scripts/     build and check tooling
LICENSES/    third-party licences; NOTICE.md lists them
index.html   GitHub Pages hub
```

## Why

- **One-way flow: tokens → components → skill assets → demo.** Values are edited in exactly one place. Everything
  downstream is generated or reads from it, so light/dark, density or a seed change can't drift between copies (the
  duplicated dark blocks in S4 Material 1.3 were the main source of drift).
- **Generated files are committed.** GitHub Pages serves the repo as is (deploy from `main`, root), so the hub, demo and
  docs work without a build step on the server. Generated files carry a "do not edit" header, and a check will fail if
  they're stale.
- **The skill ships its own copies of the built assets.** A skill has to work on its own after packaging, so
  `skill/s4-orion/assets/` is a build output, not a second source.
- **Review labs stay separate.** `explore/` holds decision-making tools with their own UI, so they never leak into the
  design system or the skill.
- **No dependencies for the build.** Node 20+ only; Playwright is used for visual and contrast checks, not for building.

## Publishing

`main` is the published branch (GitHub Pages: deploy from branch `main`, folder `/`). Work happens on `s4-orion` and is
fast-forwarded to `main` when something is ready to review. The site lives at https://4rk0s4h4.github.io/s4-material/.
