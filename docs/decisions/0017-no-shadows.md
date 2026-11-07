# 0017: No shadows anywhere (2026-11-07)

Status: **decided by the owner ("also remove all shadows"); applied in `tokens/src/elevation.tokens.json`.** Answers the open question left in 0013.

- `--md-sys-elevation-level0` to `level5` are all flat (`0 0 0 0 transparent`, so a component's `inset` outline in the same `box-shadow` list still works). Names are kept: no component or app markup changes.
- Cards, elevated buttons and chips, the FAB, menus and dialogs when solid, rich tooltips and the snackbar lose their shadows. Depth is tonal containers plus glass transparency.
- The container-transform's colored spread (it paints the source's color past the surface box while it moves) is not a drop shadow and stays.
- `docs/foundations/elevation.md` rewritten: no shadows, and don't add `box-shadow` for depth in apps.

Watch: a solid dialog or menu (glass off, high contrast, reduced transparency) now has no edge cue except its tonal step from the scrim and page, so check those states on the iPhone.
