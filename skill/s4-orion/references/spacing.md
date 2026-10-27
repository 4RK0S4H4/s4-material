<!-- GENERATED copy of docs/foundations/spacing.md (scripts/build.mjs). Edit the original. -->
# Spacing, size and layout

**Tokens:** `--s4-space-*`, `--s4-size-*`, `--s4-layout-*`, `--s4-breakpoint-*`, `--s4-z-*` · live:
[tokens page](https://4rk0s4h4.github.io/s4-material/tokens/#spacing)

- **4dp grid:** spacing steps 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Use the step names (`--s4-space-4` = 16px), not raw values.
- **Touch targets** are at least 48dp everywhere (decision 0001: M3 sizes everywhere). Visual size can be smaller (a 40px
  icon button) as long as the target is 48.
- **Component sizes** are M3's: buttons 40 (small 32, medium 56, large 96), FAB 56, chips 32, text fields 56, list items
  56/72/88, top app bar 64, nav bar 80, nav rail 96.
- **Margins:** 16 on compact windows, 24 from 600 up. Panes sit 24 apart. Page content is capped at 1200.
- **Window size classes (M3):** compact < 600, medium 600–839, expanded 840–1199, large 1200–1599, extra-large ≥ 1600.
  Under 840 the nav bar sits at the bottom; from 840 a nav rail sits at the side.
- **Stacking:** use the `--s4-z-*` names (app-bar, navigation, fab, scrim, sheet, dialog, menu, snackbar, tooltip) instead
  of raw numbers.
