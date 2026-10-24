# Changelog

All notable changes to S4 Orion are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/):

- **Major**: a token is renamed or removed, a component's markup or class names change, or a rule in the skill changes what existing apps should look like.
- **Minor**: new tokens, components, variants or skill guidance that existing apps can ignore.
- **Patch**: fixes that bring output back in line with the documented rules (contrast, bugs, docs).

## [1.0.0] - Unreleased

The first version of S4 Orion, a leaner rebuild of S4 Material 1.3 on Material 3 Expressive.

### Added

- Repo structure: `tokens/`, `components/`, `docs/`, `skill/`, `demo/`, `explore/`, `scripts/`, `LICENSES/`.
- Decision log: [0001](docs/decisions/0001-phase-1-audit.md) (audit and design decisions), [0002](docs/decisions/0002-repo-structure.md) (repo structure).
- Review labs on GitHub Pages (`explore/`): States and Shape, Motion Lab, Transitions Lab, with a saved questionnaire.

### Decided (from S4 Material 1.3)

- Stock M3 states (secondary focus ring) and the stock M3 Expressive shape scale, replacing S4 Material's softer corners.
- Default color is monochrome; any app can set its own seed.
- M3 Expressive springs replace S4 Material's Fluid motion.
- Origin motion (scaling a surface out of its source) is replaced by container transform, unfold, shared axis and slide from edge.
- Glass only on floating chrome; cards, panes, lists and fields become solid tinted surfaces.
