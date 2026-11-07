/* The questions for every review demo, in one place so the hub and the pages agree.
   A page adds behaviour (e.g. capturing tuned values) through S4Review.page(id, { capture: { 'qid:v': fn } }). */
window.S4_REVIEW_DEMOS = [
  {
    id: 'states-shape', title: 'States and Shape', href: 'explore/states-shape.html',
    questions: [
      { id: 'states', label: 'States', help: 'How hover, press, focus and selection look.',
        options: [{ v: 'A', label: 'M3, secondary focus ring' }, { v: 'B', label: 'Neutral focus and rows' }, { v: 'C', label: 'Primary-tinted' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'shape', label: 'Shape', help: 'The corner scale across components.',
        options: [{ v: 'A', label: 'Stock M3 Expressive' }, { v: 'B', label: 'S4 Material softer corners' }, { v: 'C', label: 'Expressive, rounder' }, { v: 'D', label: 'S4 Glass radii' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'color', label: 'Default color', help: 'The color S4 Orion uses when an app doesn’t pick its own seed.',
        options: [{ v: 'Mono', label: 'Black and white' }, { v: 'Mono + Red', label: 'Black and white with a red accent' }, { v: 'Indigo', label: '' }, { v: 'Teal', label: '' }, { v: 'Orange', label: '' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  },
  {
    id: 'motion', title: 'Motion Lab', href: 'explore/motion.html',
    questions: [
      { id: 'feel', label: 'Motion feel', help: 'Choose “My Tuned Values” to save the feel, stiffness and bounce currently set in the lab.',
        options: [{ v: 'A', label: 'Fluid' }, { v: 'B', label: 'Crisp' }, { v: 'C', label: 'Liquid Settle' }, { v: 'D', label: 'M3 Expressive' }, { v: 'Tuned', label: 'My tuned values' }] }
    ]
  }
  ,
  {
    id: 'transitions', title: 'Transitions Lab', href: 'explore/transitions.html',
    questions: [
      { id: 'menus', label: 'Menus', options: [{ v: 'A', label: 'Origin (S4 Material)' }, { v: 'B', label: 'Unfold' }, { v: 'C', label: 'Drop' }, { v: 'D', label: 'Fade' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'dialogs', label: 'Dialogs', options: [{ v: 'A', label: 'Origin (S4 Material)' }, { v: 'B', label: 'Container transform' }, { v: 'C', label: 'Lean' }, { v: 'D', label: 'Scale and fade' }, { v: 'E', label: 'Fade' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'sheets', label: 'Bottom sheets', options: [{ v: 'A', label: 'Origin (S4 Material)' }, { v: 'B', label: 'Container transform' }, { v: 'C', label: 'Slide from edge' }, { v: 'D', label: 'Short rise' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'peers', label: 'Switching views', options: [{ v: 'A', label: 'Shared axis' }, { v: 'B', label: 'Fade through' }, { v: 'C', label: 'Crossfade' }, { v: 'D', label: 'Push' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'detail', label: 'List to detail', options: [{ v: 'A', label: 'Origin (S4 Material)' }, { v: 'B', label: 'Container transform' }, { v: 'C', label: 'Shared axis Z' }, { v: 'D', label: 'Push' }, { v: 'E', label: 'Fade through' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'snackbar', label: 'Snackbars', options: [{ v: 'A', label: 'Origin' }, { v: 'B', label: 'Slide from edge' }, { v: 'C', label: 'Rise and fade' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'glass', title: 'Glass Lab', href: 'explore/glass.html',
    questions: [
      { id: 'material', label: 'Glass material', options: [{ v: 'A', label: 'Frosted (84%)' }, { v: 'B', label: 'Clear (72%)' }, { v: 'C', label: 'Very clear (60%), guaranteed' }, { v: 'D', label: 'Very clear (60%), unguarded' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'edge', label: 'Glass edge', options: [{ v: 'A', label: 'None' }, { v: 'B', label: 'Hairline' }, { v: 'C', label: 'Rim' }, { v: 'D', label: 'Specular' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'backdrop', label: 'Backdrop', options: [{ v: 'A', label: 'Flat' }, { v: 'B', label: 'Soft blooms' }, { v: 'C', label: 'Tonal wash' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'surfaces', label: 'Where glass goes', options: [{ v: 'A', label: 'Chrome and overlays' }, { v: 'B', label: 'Chrome only' }, { v: 'C', label: 'Overlays only' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'liquid', title: 'Liquid Glass Lab', href: 'explore/liquid-glass.html',
    questions: [
      { id: 'raised', label: 'Material with liquid glass: raised surfaces', options: [{ v: 'A', label: 'Bars, menus, sheets, dialogs' }, { v: 'B', label: 'Also the FAB' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'frost', label: 'Frost level', options: [{ v: 'A', label: 'Light frost' }, { v: 'B', label: 'Frosted' }, { v: 'C', label: 'Heavy frost' }, { v: 'Tuned', label: 'My tuned values' }] },
      { id: 'look', label: 'Refraction', options: [{ v: 'A', label: 'Subtle' }, { v: 'B', label: 'Liquid' }, { v: 'C', label: 'Extra liquid' }, { v: 'D', label: 'Keep today’s glass (no refraction)' }, { v: 'Tuned', label: 'My tuned values' }] },
      { id: 'text', label: 'Keeping text readable', options: [{ v: 'A', label: 'Fixed tint (today’s guarantee)' }, { v: 'B', label: 'Adaptive tint' }, { v: 'C', label: 'Apple-clear, not guaranteed' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'melt', label: 'Shapes melting together', options: [{ v: 'A', label: 'Melt' }, { v: 'B', label: 'Stay separate' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'where', label: 'Where liquid glass goes', options: [{ v: 'A', label: 'Every glass surface' }, { v: 'B', label: 'Floating pills and buttons only' }, { v: 'C', label: 'Opt-in per app' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'device', label: 'On your iPhone', options: [{ v: 'A', label: 'Smooth and right' }, { v: 'B', label: 'Looks right but slow' }, { v: 'C', label: 'Looks wrong or broken' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'icons', title: 'Icon Lab', href: 'explore/icons.html',
    questions: [
      { id: 'glyphs', label: 'Glyphs in controls', options: [{ v: 'A', label: 'Boxed (today)' }, { v: 'B', label: 'Plain' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'menu', label: 'Menu button', options: [{ v: 'A', label: 'Boxed hamburger' }, { v: 'B', label: 'Dots' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'style', title: 'Style Lab', href: 'explore/style.html',
    questions: [
      { id: 'field', label: 'Text fields', options: [{ v: 'A', label: 'Material (today)' }, { v: 'B', label: 'Quiet Box' }, { v: 'C', label: 'Underline' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'check', label: 'Checkboxes', options: [{ v: 'A', label: 'Material (today)' }, { v: 'B', label: 'Round Ink' }, { v: 'C', label: 'Soft Square' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'table', label: 'Tables', options: [{ v: 'A', label: 'Material (today)' }, { v: 'B', label: 'Hairline' }, { v: 'C', label: 'Soft Rows' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'tabs', label: 'Tab headers', options: [{ v: 'A', label: 'Material (today)' }, { v: 'B', label: 'Ink Pills' }, { v: 'C', label: 'Quiet Underline' }, { v: 'D', label: 'Segmented Tray' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'style2', title: 'Style Lab 2', href: 'explore/style2.html',
    questions: [
      { id: 'group', label: 'Button groups', options: [{ v: 'A', label: 'Connected (today)' }, { v: 'B', label: 'Capsule' }, { v: 'C', label: 'Squishy Pills' }, { v: 'D', label: 'Notched' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'slider', label: 'Sliders', options: [{ v: 'A', label: 'Material (today)' }, { v: 'B', label: 'Glass Bead' }, { v: 'C', label: 'Fine Line' }, { v: 'D', label: 'Fill Bar' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'sheet', label: 'Sheets on a phone', options: [{ v: 'A', label: 'Bottom Sheet (today)' }, { v: 'B', label: 'Floating Card' }, { v: 'C', label: 'Full Page' }, { v: 'D', label: 'Centered Card' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'glass', label: 'Glass edge', options: [{ v: 'A', label: 'Blur Only (today)' }, { v: 'B', label: 'Light Rim' }, { v: 'C', label: 'Thick Pane' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'liquid3', title: 'Liquid Glass Lab 3', href: 'explore/liquid3.html',
    questions: [
      { id: 'glass', label: 'Glass over moving content', options: [{ v: 'A', label: 'Blur Only (today)' }, { v: 'B', label: 'Magnified Rim' }, { v: 'C', label: 'Thick Pane' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'device', label: 'On your iPhone', options: [{ v: 'A', label: 'Smooth and right' }, { v: 'B', label: 'Looks right but slow' }, { v: 'C', label: 'Looks wrong or broken' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
  ,
  {
    id: 'liquid4', title: 'Liquid Glass Lab 4', href: 'explore/liquid4.html',
    questions: [
      { id: 'glass', label: 'WebGL glass over a real page', options: [{ v: 'A', label: 'Liquid Frost' }, { v: 'B', label: 'Heavy Frost' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'device', label: 'On your iPhone', options: [{ v: 'A', label: 'Shows and follows scrolling, smooth' }, { v: 'B', label: 'Shows but slow or laggy' }, { v: 'C', label: 'Glass missing, blank or wrong' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  },
  {
    id: 'transparency', title: 'Transparency Lab', href: 'explore/transparency.html',
    questions: [
      { id: 'glass', label: 'Glass transparency and edge (CSS only)', options: [{ v: 'A', label: 'Today' }, { v: 'B', label: 'Clearer' }, { v: 'C', label: 'Clearer + Lit Edge' }, { v: 'D', label: 'Light-Gathering Rim' }, { v: 'E', label: 'Specular Arcs' }, { v: 'F', label: 'Bevel Hairlines' }, { v: 'G', label: 'Prism Edge' }, { v: 'H', label: 'Bright Band' }, { v: 'I', label: 'Frost Bevel' }, { v: 'J', label: 'Everything Together' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'clarity', label: 'How clear should glass be', options: [{ v: 'A', label: 'More tint than shown' }, { v: 'B', label: 'About as shown' }, { v: 'C', label: 'Clearer than shown' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  },
  {
    id: 'transparency2', title: 'Transparency Lab 2', href: 'explore/transparency2.html',
    questions: [
      { id: 'edge', label: 'The thin, slightly frostier edge line', options: [{ v: 'A', label: 'No Edge' }, { v: 'B', label: 'Frost Hairline' }, { v: 'C', label: 'Fainter Hairline' }, { v: 'D', label: 'Hairline + Soft Inner Fade' }, { v: 'E', label: 'Hairline + Hint of Top Light' }, { v: 'F', label: 'Hairline + Outer Hairline' }, { v: 'G', label: 'Thicker Frost Line' }, { v: 'H', label: 'C + D: Tight' }, { v: 'I', label: 'C + D: Fainter' }, { v: 'J', label: 'C + D: Softer Fade' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'clarity', label: 'How clear should glass be', options: [{ v: 'A', label: 'More tint than shown' }, { v: 'B', label: 'About as shown' }, { v: 'C', label: 'Clearer than shown' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  },
  {
    id: 'transparency3', title: 'Transparency Lab 3', href: 'explore/transparency3.html',
    questions: [
      { id: 'edge', label: 'Thin frost line (no fade) on the real UI', options: [{ v: '20', label: 'Frost Line 20%' }, { v: '30', label: 'Frost Line 30%' }, { v: '40', label: 'Frost Line 40%' }, { v: '50', label: 'Frost Line 50%' }, { v: '30o', label: '30% + Outer Hairline' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'shadow', label: 'Shadows under raised things', options: [{ v: 'none', label: 'No Shadows' }, { v: 'glass', label: 'No Shadow on Glass Only' }, { v: 'today', label: 'Keep Today\'s Shadows' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  },
  {
    id: 'transparency4', title: 'Transparency Lab 4', href: 'explore/transparency4.html',
    questions: [
      { id: 'items', label: 'Items sitting on glass (text fields, chips)', options: [{ v: 'A', label: 'Solid Items (today)' }, { v: 'B', label: 'Outline Only' }, { v: 'C', label: 'Frosted Fill' }, { v: 'D', label: 'Recessed Well' }, { v: 'E', label: 'Milky Fill' }, { v: 'F', label: 'Soft Well + Frost Line' }, { v: 'G', label: 'Combo: Well + Frost Line, Outlined Items Only' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  }
];
