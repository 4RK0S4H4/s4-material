# 0010: Owner critique, round 2 (2026-11-07)

Done:
- **Progress:** no stop dot at the end of the linear track (the owner dislikes the concept in general).
- **Snackbar:** pill shaped (extra-large corners when multi-line); arrives with a small rise (10px) and fade instead of sliding up from the edge (`S4.transition.rise`).
- **Menus:** more rounded (extra-large corners, large items, 8dp padding) and a quieter open: revealed from the anchor-facing edge from half height, 6px rise and fade, instead of growing from a small corner.
- **Tabs:** fully rounded, like the button groups: round tray, round sliding pill. The Tabs page no longer boxes the tabs and panel together.
- **Nav bar and rail:** one rounded highlight covers icon and label of the current item and slides and resizes between items (`S4.navPill`); in the rail it also follows the expand/collapse.

Open (needs the owner's taste, in the Style Lab round 2): button groups (a unique look), sliders (own look, with some transparency and glass), sheets (a better solution on mobile), and glass with thick-edge refraction and a very light refracting edge (current blur level kept or a bit less).
