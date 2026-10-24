/* The questions for every review demo, in one place so the hub and the pages agree.
   A page adds behaviour (e.g. capturing tuned values) through S4Review.page(id, { capture: { 'qid:v': fn } }). */
window.S4_REVIEW_DEMOS = [
  {
    id: 'states-shape', title: 'States and Shape', href: 'explore/states-shape.html',
    questions: [
      { id: 'states', label: 'States', help: 'How hover, press, focus and selection look.',
        options: [{ v: 'A', label: 'M3, secondary focus ring' }, { v: 'B', label: 'Neutral focus and rows' }, { v: 'C', label: 'Primary-tinted' }, { v: 'Other', label: 'Describe in notes' }] },
      { id: 'shape', label: 'Shape', help: 'The corner scale across components.',
        options: [{ v: 'A', label: 'Stock M3 Expressive' }, { v: 'B', label: 'S4 Material softer corners' }, { v: 'C', label: 'Expressive, rounder' }, { v: 'D', label: 'S4 Glass radii' }, { v: 'Other', label: 'Describe in notes' }] }
    ]
  },
  {
    id: 'motion', title: 'Motion Lab', href: 'explore/motion.html',
    questions: [
      { id: 'feel', label: 'Motion feel', help: 'Choose “My Tuned Values” to save the feel, stiffness and bounce currently set in the lab.',
        options: [{ v: 'A', label: 'Fluid' }, { v: 'B', label: 'Crisp' }, { v: 'C', label: 'Liquid Settle' }, { v: 'D', label: 'M3 Expressive' }, { v: 'Tuned', label: 'My tuned values' }] },
      { id: 'origin', label: 'Origin motion', help: 'Surfaces grow out of what you touched, or appear in place.',
        options: [{ v: 'On', label: 'Grow from the source' }, { v: 'Off', label: 'Fade in place' }] }
    ]
  }
];
