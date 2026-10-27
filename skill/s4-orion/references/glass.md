<!-- GENERATED copy of docs/foundations/glass.md (scripts/build.mjs). Edit the original. -->
# Glass

**Tokens:** `--s4-glass-*` · **CSS:** `components/glass/glass.css` · decided in the
[Glass Lab](https://4rk0s4h4.github.io/s4-material/explore/glass.html) ([decision 0004](../decisions/0004-glass.md))

S4 Orion is Material 3 Expressive with one personal layer: very clear, Liquid Glass-inspired glass on the things that float
above content. Content itself is always solid.

## The rules

1. **Only on floating chrome and overlays.** The top app bar *once content scrolls under it*, the nav bar, a modal nav rail,
   toolbars, menus, dialogs, bottom and side sheets, rich tooltips. Never cards, panes, lists, fields, tables, body text or
   anything people read for long. If it scrolls with the page, it isn't glass.
2. **Two layers at most.** A menu over an app bar is fine; a menu inside a sheet over an app bar is not. CSS makes a third
   nested glass surface solid; for overlays that stack visually but not in the DOM, design so it doesn't happen.
3. **Text on glass is `on-surface`.** Glass surfaces redefine `on-surface-variant` as `on-surface`. Don't put colored or
   faded text on glass; icons and labels use the normal content colors.
4. **The contrast floor is guaranteed, don't undo it.** The glass compresses what shows through so text stays ≥ 4.5:1 over
   any backdrop and any seed. Don't lower `--s4-glass-tint-opacity-float` or remove the backdrop filter; `npm run check`
   fails if the guarantee breaks.
5. **Text over photos is not glass.** A label on an image or illustration gets a scrim or a solid chip behind it.
6. **Glass is a surface, not a state.** Selected, active and filled controls on glass stay solid (the nav indicator, a filled
   button, a selected chip).

## How it's built

```css
background-color: color-mix(in srgb, var(--s4-glass-tint-float) 60%, transparent);   /* surface-container */
backdrop-filter: blur(16px) saturate(1.8) contrast(.74) brightness(1.1);              /* dark: contrast(1) brightness(.8) */
background-image: linear-gradient(to bottom, white-at-50% 0 1px, transparent 1px);   /* hairline on the content-facing edge */
```

Components don't write this: `glass.css` applies it to the listed components in its own cascade layer. To make something
else glass (a custom floating panel), add `class="s4-glass"`. To keep one element solid, add `data-glass="off"`.

## Accessibility and fallbacks

| Situation | Glass becomes |
|---|---|
| `prefers-contrast: more` or contrast level high | Solid (`surface-container`), no blur, no hairline |
| `prefers-reduced-transparency: reduce` or `data-glass="off"` on `<html>` | Solid |
| Browser without `backdrop-filter` | Solid |
| Contrast level medium | 80% tint |
| Forced colors | Solid with a real border |
| `prefers-reduced-motion` | Unchanged (glass doesn't move); transitions into it follow the motion rules |

## Do / don't
- **Do** let content scroll under the top app bar and nav bar; that's what the glass is for.
- **Do** keep chrome light: a title, a few icon buttons, navigation.
- **Don't** put glass on cards to make a page feel "glassy". It hurts legibility and performance.
- **Don't** stack a sheet on a dialog on an app bar.
- **Don't** add blooms or gradients behind the page to give glass "something to show". The backdrop is flat (decision 0004).
