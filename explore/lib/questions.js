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
];
