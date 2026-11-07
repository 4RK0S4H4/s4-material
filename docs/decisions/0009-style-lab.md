# 0009: Style Lab answers (2026-11-07)

Goal: make Orion look less like stock Material 3 Expressive.

- **Text fields: Quiet Box (B).** Label above a thin-outlined box, medium corners, surface fill, ink focus ring. One look:
  no filled/outlined variants, no floating label, no notch (`data-variant` is ignored). 48dp tall.
- **Checkboxes: Soft Square (C).** 20dp, 6dp corners, 1.5dp outline, primary fill (ink in monochrome).
- **Tab headers: Segmented Tray (D) combined with Ink Pills (B), per the owner's note.** A soft tray with a flat sliding
  pill (on-surface with an inverse label), no raised shadow. Secondary tabs use the same tray and pill.
- **Tables: not decided.** The owner picked Hairline but asked for further exploration, with context on where tables
  appear, and asked that the pick not be used. Unchanged. Next: a Tables Lab that shows tables in their real places (the
  Activity view, the phone list reflow, selection and sort) with 2-3 directions.
- Checker (`check.mjs`) now counts the sliding pill as the background of a selected tab.
