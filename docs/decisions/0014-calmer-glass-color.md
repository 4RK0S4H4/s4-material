# 0014: Calmer color through glass (2026-11-07)

Status: **decided by the owner; applied in `tokens/src/glass.tokens.json`.**

The owner found the colors coming through the glass too hard and asked for more frost (Transparency Lab 5). Today's glass boosted the
backdrop's color to 180%. The owner picked card B, **Calmer Color**: same 16px blur, color strength 120%.

- `--s4-glass-saturation-float`: 1.8 to 1.2. Blur (16px) and tint (60%) are unchanged.
- The text-contrast guarantee does not depend on blur or saturation (`scripts/check-glass.mjs` uses tint and the contrast/brightness squeeze only), so it is unchanged and still passes over 97 schemes.
- More blur (28 and 40px) and a clearer tint (45%) were seen and not chosen.

Still open: how items on glass (text fields, chips, buttons) are drawn (Transparency Lab 4), now to be judged on this calmer glass.
