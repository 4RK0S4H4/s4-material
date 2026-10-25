# Menu

A short list of choices opened from a button. **Unfolds** from the edge next to its button (the menu's shape opens; items
stay still), on glass, positioned by `orion.js` (flips above when there's no room below).

```html
<button class="s4-button" data-variant="tonal" data-menu="sort-menu">Sort By</button>
<div class="s4-menu" id="sort-menu" aria-label="Sort by">
  <div class="s4-menu-label">Sort By</div>
  <button class="s4-menu-item" role="menuitemradio" aria-checked="true"><span class="s4-icon" data-icon="calendar"></span>Due Date</button>
  <button class="s4-menu-item" role="menuitemradio" aria-checked="false"><span class="s4-icon" data-icon="wallet"></span>Amount</button>
  <hr class="s4-menu-divider">
  <button class="s4-menu-item" data-color="error"><span class="s4-icon" data-icon="delete"></span>Delete</button>
</div>
```

| Part / attribute | Use |
|---|---|
| `[data-menu="id"]` on the opener | Opens the menu; gets `aria-haspopup`, `aria-expanded`, `aria-controls` |
| `.s4-menu[data-align="end"]` | Align the menu's end edge with the opener (for overflow menus at the right) |
| `.s4-menu[data-color="vibrant"]` | Tertiary-container menu |
| `.s4-menu-item` + `.s4-menu-item-text`, `.s4-menu-item-supporting`, `.s4-menu-item-trailing` | Item, with optional second line and a shortcut or value at the end |
| `role="menuitemradio|menuitemcheckbox"` + `aria-checked` | Choice items; checked items use secondary-container |
| `.s4-menu-label`, `.s4-menu-divider` | Group label, separator |
| Events | `s4-select { value, item }` on the menu when an item is chosen; `s4-open`, `s4-close` |
| JS | `S4.menu.open(menu, anchor)`, `S4.menu.close(menu)`, `S4.position(popup, anchor, { align, gap })` |

**Do:** keep menus short (2–7 items), Title Case items, icons for every item or none. **Don't:** put forms or long text in a
menu (use a dialog or sheet); don't color items except a destructive one.

**Accessibility:** native popover (top layer, light dismiss); arrows, Home/End, type-to-jump, Escape returns focus to the
opener; Tab closes. 48dp item targets.
