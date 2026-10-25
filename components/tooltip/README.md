# Tooltips

**Plain** tooltips name an icon-only control: `data-tooltip="Copy invoice number"`. They appear after a 500ms hover, on
keyboard focus, or on a long press; Escape hides them; they can be hovered (WCAG 1.4.13). Solid inverse surface.

**Rich** tooltips explain something in a few lines and may hold an action; they sit on glass:

```html
<button class="s4-button" data-variant="text" data-rich-tooltip="autopay-tip">What Is Autopay?</button>
<div class="s4-rich-tooltip" id="autopay-tip" role="dialog" aria-label="About Autopay">
  <span class="s4-rich-tooltip-subhead">Autopay</span>
  <span>Pays the bill from your default card on its due date.</span>
  <div class="s4-rich-tooltip-actions"><button class="s4-button" data-variant="text">Learn More</button></div>
</div>
```

Hover or focus shows a rich tooltip; a click pins it until you click elsewhere.

**Do:** keep plain tooltips to a few words that name the action. The control still needs its own `aria-label`; the tooltip
is linked with `aria-describedby` (added to any existing ids, never replacing them). **Don't:** put essential information
only in a tooltip, or put interactive content in a plain one.
