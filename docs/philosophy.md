# Philosophy (draft)

S4 Orion is a personal design language for the apps and pages its owner builds. It should make a new app look
finished on day one and make the hundredth app look like it belongs with the first.

## 1. Material 3 Expressive first

S4 Orion is Material 3 Expressive. It uses the same color roles, type scale, shape scale, state layers, springs and
components, under the same names. When a question isn't answered here, the answer is "do what stock M3 Expressive does".
That keeps the system predictable, lets Google's guidance and tooling apply directly, and avoids a pile of personal
exceptions that drift over time.

The personal layer is short and deliberate:

- **Inter** as the typeface, with its full OpenType features.
- **Solar icons**: Bold Duotone where the icon carries the screen, Linear at small sizes.
- **Title Case** for labels; sentences stay sentence case.
- **Monochrome by default.** Color comes from one seed when an app wants it.
- **Glass on floating chrome** and nowhere else.
- **Motion that comes from somewhere, quietly**: container transform, unfold, shared axis, slide from edge.

## 2. One source of color

Every color is a role generated from a seed by Material Color Utilities: primary, surface containers, outlines, and so on.
Nobody picks hex values for components. To raise contrast you raise the contrast level, which regenerates every role;
you don't darken one color by hand. The default seed is monochrome, so an app without a brand looks calm and neutral, and
an app with one gets a complete, accessible scheme from a single value.

## 3. Solid content, glass chrome

Content sits on solid tonal surfaces: cards, panes, lists, fields and tables are all M3 surface containers. Glass is reserved
for layers that float above content and move or overlay it: app bars once content scrolls under them, nav bars, toolbars,
menus, sheets, dialogs and tooltips. Glass is never used under dense text, and it always has a fallback: more contrast,
reduced transparency, or a browser without backdrop blur all turn it solid.

## 4. Things come from somewhere, quietly

Motion explains where things come from and where they go. When a surface opens from something you touched, that thing
becomes the surface (container transform) at its real size, so content never stretches. Menus unfold from their anchor,
sibling views slide along a shared axis, and sheets and snackbars come from the edge where they live. Movement uses M3
Expressive springs; fades and color use effects springs that never overshoot; anything that must land exactly on a
target uses a calm, critically damped spring. Reduced motion makes movement instant.

## 5. Readable for everyone

All text meets WCAG AA against what is actually painted behind it, including on glass. Every control has a visible focus
ring, touch targets are at least 48dp, and the system respects reduced motion, reduced transparency, more contrast and
forced colors. These are built into the components rather than left to each app.

## 6. Data reads cleanly

Numbers that are compared or scanned (amounts, counts, dates, IDs) use tabular figures. Tables become lists on phones.
Status is shown with a label and a tone, never color alone.
