#!/usr/bin/env node
/* Prove the glass contrast floor: text in on-surface on float glass meets WCAG AA (4.5:1) over ANY backdrop, for every
   seed. Reads the glass values from tokens/tokens.json, generates 97 color schemes (monochrome + 24 hues x 4 variants)
   with Material Color Utilities, and checks the worst case: a pure black and a pure white backdrop, after the glass's
   backdrop filter (contrast, brightness) and tint. Fails (exit 1) if any scheme in light or dark falls below 4.5:1.
   Usage: node scripts/check-glass.mjs */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8')).tokens;
const sandbox = { window: {} };
vm.runInNewContext(readFileSync(join(root, 'components/assets/m3color.js'), 'utf8'), sandbox);
const M3 = sandbox.window.M3Color;

const val = (name, mode) => parseFloat(mode === 'light' ? T[name].value : (T[name].modes?.[mode] ?? T[name].value));
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (c) => { const [r, g, b] = c.map((v) => { v = Math.min(255, Math.max(0, v)) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => a.map((v, i) => v * t + b[i] * (1 - t));
const hue = (h) => { const s = 0.7, l = 0.45, k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); return '#' + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); };
const seeds = [['#000000', ['monochrome']], ...Array.from({ length: 24 }, (_, i) => [hue(i * 15), ['vibrant', 'tonal', 'fidelity', 'expressive']])];

let failures = 0, worstAll = Infinity;
for (const mode of ['light', 'dark']) {
  const t = val('--s4-glass-tint-opacity-float', mode), c = val('--s4-glass-backdrop-contrast-float', mode), b = val('--s4-glass-backdrop-brightness-float', mode);
  const filt = (v) => Math.min(255, Math.max(0, ((v - 127.5) * c + 127.5) * b));   /* CSS contrast() then brightness() on sRGB */
  const lo = filt(0), hi = filt(255);
  let worst = { r: Infinity };
  for (const [seed, variants] of seeds) for (const v of variants) {
    const s = M3.scheme(seed, v, mode === 'dark', 0), tint = rgb(s['surface-container']), text = rgb(s['on-surface']);
    const r = Math.min(ratio(text, mix(tint, [lo, lo, lo], t)), ratio(text, mix(tint, [hi, hi, hi], t)));
    if (r < worst.r) worst = { r, seed, v };
    if (r < 4.5) { failures++; console.error(`  x ${mode}: ${seed} ${v}: on-surface on glass is ${r.toFixed(2)}:1`); }
  }
  worstAll = Math.min(worstAll, worst.r);
  console.log(`Glass ${mode}: tint ${t}, backdrop contrast ${c} brightness ${b} -> worst ${worst.r.toFixed(2)}:1 (${worst.seed} ${worst.v}) over 97 schemes`);
}
if (failures) { console.error(`${failures} scheme(s) below 4.5:1. Raise the tint or the backdrop compression in tokens/src/glass.tokens.json.`); process.exit(1); }
