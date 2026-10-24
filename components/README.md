# Components

Reference implementations of S4 Orion components. Each one is plain HTML and CSS built only from tokens, with a small
shared runtime for theming and motion. React wrappers are added only where state or motion make them worth having.

Planned layout (built in Phase 4):

```
components/
├── base/             reset, type utilities, cascade layers, focus ring, reduced-motion and reduced-transparency rules
├── <component>/      one folder per component
│   ├── <component>.css     the component, using tokens only
│   ├── <component>.html    a reference example with every variant and state
│   └── README.md           anatomy, when to use it, do/don't
├── glass/            the glass layer: surface levels, fallbacks, contrast scrims
├── motion/           container transform, shared axis, unfold, slide from edge
├── orion.js          runtime: theme (seed, light/dark, contrast), dialogs and sheets, motion helpers
├── orion.css         generated bundle: tokens + base + every component + glass
└── react/            optional React wrappers
```

Core set (decided in Phase 1): app shell (nav rail and nav bar), top app bar, buttons (filled, tonal, outlined, text,
elevated), icon button, connected button group, FAB and extended FAB, card, pane, list (including segmented and grouped),
data table that becomes a list on phones, divider, text field (filled and outlined, including select and textarea), switch,
checkbox, radio, chips (filter, assist, input), slider, search bar, tabs, menu, dialog, bottom sheet, side sheet, snackbar,
tooltip, badge, status pill, progress (linear and circular), color swatches.

Left out of 1.0 (can come back later): date and time pickers (native inputs cover them), carousel, shape morph library,
FAB menu, split button, swipe to dismiss, inspector layout, rolling numbers.
