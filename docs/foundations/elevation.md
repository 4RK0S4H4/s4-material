# Elevation

**Tokens:** `--md-sys-elevation-level0` … `level5` · live: [tokens page](https://4rk0s4h4.github.io/s4-material/tokens/#elevation)

M3 shows depth with **tonal surfaces first**: a card is `surface-container-low` on a `surface` page, a dialog is
`surface-container-high`. Shadows are only for components M3 gives them to:

| Level | Used by |
|---|---|
| 0 | Almost everything: cards, panes, lists, app bars at rest |
| 1 | Elevated cards and elevated buttons at rest |
| 2 | Menus; elevated buttons on hover |
| 3 | FAB at rest; dialogs and sheets when not glass |
| 4 | FAB on hover |

Glass surfaces (Phase 4) don't take a shadow; their blur and tint separate them from what's behind.
