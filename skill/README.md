# The S4 Orion skill

`skill/s4-orion/` is a Claude skill: drop it into Claude (or package it) and Claude applies S4 Orion to any app or page.

```
skill/s4-orion/
├── SKILL.md        under ~500 lines: trigger description, philosophy, decision rules, common mistakes, a worked example
├── references/     loaded only when needed: tokens, components, glass rules, motion, accessibility
├── assets/         generated from the repo build: orion.css, orion.js, m3color.js, Inter, icon registry
├── scripts/        helpers Claude runs: add icons, check contrast and layout
└── evals/          test prompts used to check the skill's output
```

Only `SKILL.md`, `references/` and `scripts/` are edited by hand. `assets/` is copied in by the build so the skill always
ships the same CSS and JS as the repo. Package it with skill-creator's `package_skill.py` to get a `.skill` file.

Written in Phase 5. It replaces the S4 Material skill.
