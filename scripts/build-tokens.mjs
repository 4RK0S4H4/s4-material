#!/usr/bin/env node
/* Build S4 Orion tokens: tokens/src/*.tokens.json (W3C DTCG format) -> tokens/tokens.css, tokens.ts, tokens.json.
   No dependencies; Node 20+.

   Source conventions
   - A token is any object with "$value". "$type" is inherited from the nearest group that sets it.
   - The CSS name is the token path joined with "-": md.sys.color.primary -> --md-sys-color-primary.
   - Aliases are "{path.to.token}". In CSS an alias becomes var(--path-to-token), so a run-time change to the target
     (e.g. a new seed color) flows through. Inside composite values (shadows) aliases are resolved to plain values.
   - Modes live on the token in $extensions["com.s4.modes"]: dark, high-contrast, dark-high-contrast, reduced-motion,
     reduced-transparency. The light, standard-contrast value is $value.
   - A group with $extensions["com.s4.spring"] = true holds stiffness, damping and duration; the build also emits the
     group itself as a CSS linear() easing that follows that spring for that duration.

   Usage: node scripts/build-tokens.mjs           build
          node scripts/build-tokens.mjs --check   fail if the committed outputs are stale or a check fails */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'tokens/src');
const CHECK = process.argv.includes('--check');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const errors = [];
const fail = (msg) => errors.push(msg);

/* ---------- load and merge ---------- */
const files = readdirSync(SRC).filter((f) => f.endsWith('.tokens.json')).sort();
const tree = {};
function merge(into, from, where) {
  for (const [k, v] of Object.entries(from)) {
    if (k === '$description' || (k === '$extensions' && where === '')) continue;   /* file-level metadata */
    if (v && typeof v === 'object' && !Array.isArray(v) && !('$value' in v) && !k.startsWith('$')) {
      into[k] = into[k] || {}; merge(into[k], v, where + '.' + k);
    } else {
      if (k in into && !k.startsWith('$')) fail(`Duplicate token ${where.slice(1)}.${k}`);
      into[k] = v;
    }
  }
}
for (const f of files) merge(tree, JSON.parse(readFileSync(join(SRC, f), 'utf8')), '');

/* ---------- flatten ---------- */
const tokens = new Map();   /* path -> { path, type, value, modes, description } */
const springs = [];         /* spring group paths */
const MODES = ['dark', 'high-contrast', 'dark-high-contrast', 'reduced-motion', 'reduced-transparency'];
(function walk(node, path, type) {
  if (node.$type) type = node.$type;
  if ('$value' in node) {
    if (!type) fail(`${path.join('.')} has no $type`);
    const modes = node.$extensions?.['com.s4.modes'] || {};
    for (const m of Object.keys(modes)) if (!MODES.includes(m)) fail(`${path.join('.')}: unknown mode "${m}"`);
    tokens.set(path.join('.'), { path, type, value: node.$value, modes, description: node.$description });
    return;
  }
  if (node.$extensions?.['com.s4.spring']) springs.push(path.join('.'));
  for (const [k, v] of Object.entries(node)) if (!k.startsWith('$') && v && typeof v === 'object') walk(v, [...path, k], type);
})(tree, [], undefined);

/* ---------- aliases ---------- */
const ALIAS = /^\{([^}]+)\}$/;
function resolve(value, seen = []) {
  if (typeof value === 'string' && ALIAS.test(value)) {
    const target = value.match(ALIAS)[1];
    if (seen.includes(target)) { fail(`Alias cycle: ${[...seen, target].join(' -> ')}`); return null; }
    const t = tokens.get(target);
    if (!t) { fail(`Unknown alias {${target}}`); return null; }
    return resolve(t.value, [...seen, target]);
  }
  if (Array.isArray(value)) return value.map((v) => resolve(v, seen));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, seen)]));
  return value;
}
const cssName = (path) => '--' + path.join('-');

/* ---------- values -> CSS ---------- */
const round = (n, d = 4) => +n.toFixed(d);
function color(v) {
  if (typeof v === 'string') return v;
  const a = v.alpha ?? 1;
  if (a === 1 && v.hex) return v.hex;
  const [r, g, b] = v.components.map((c) => Math.round(c * 255));
  return `rgb(${r} ${g} ${b} / ${round(a, 3)})`;
}
const dimension = (v) => (typeof v === 'string' ? v : `${v.value}${v.unit}`);
const duration = (v) => (typeof v === 'string' ? v : `${v.value}${v.unit}`);
const family = (v) => (Array.isArray(v) ? v : [v]).map((f) => (/^[a-z-]+$/i.test(f) && !/\s/.test(f) && f !== 'Inter' ? f : `"${f}"`)).join(', ');
function shadow(v) {
  const layers = Array.isArray(v) ? v : [v];
  if (!layers.length) return 'none';
  return layers.map((l) => `${l.inset ? 'inset ' : ''}${dimension(l.offsetX)} ${dimension(l.offsetY)} ${dimension(l.blur)} ${dimension(l.spread)} ${color(l.color)}`).join(', ');
}
function toCss(type, raw) {
  if (typeof raw === 'string' && ALIAS.test(raw)) {
    const target = raw.match(ALIAS)[1];
    if (!tokens.has(target)) fail(`Unknown alias {${target}}`);
    else if (tokens.get(target).type !== type) fail(`Alias {${target}} is a ${tokens.get(target).type}, used as a ${type}`);
    return `var(${cssName(target.split('.'))})`;
  }
  const v = resolve(raw);
  switch (type) {
    case 'color': return color(v);
    case 'dimension': return dimension(v);
    case 'duration': return duration(v);
    case 'number': case 'fontWeight': return String(v);
    case 'fontFamily': return family(v);
    case 'shadow': return shadow(v);
    case 'cubicBezier': return `cubic-bezier(${v.join(', ')})`;
    default: fail(`Unsupported $type "${type}"`); return String(v);
  }
}

/* ---------- springs -> linear() ---------- */
function springEasing(k, z, ms, steps = 40) {
  const w = Math.sqrt(k), T = ms / 1000;
  const x = (t) => {
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
  };
  const pts = [];
  for (let i = 0; i <= steps; i++) pts.push(i === 0 ? '0' : i === steps ? '1' : `${round(x((T * i) / steps), 3)} ${round((100 * i) / steps, 2)}%`);
  let peak = 0; for (let i = 0; i <= 400; i++) peak = Math.max(peak, x((T * i) / 400));
  return { easing: `linear(${pts.join(', ')})`, overshoot: round(Math.max(0, peak - 1) * 100, 1) };
}

/* ---------- collect declarations per mode ---------- */
const base = [], byMode = Object.fromEntries(MODES.map((m) => [m, []])), json = {};
for (const t of tokens.values()) {
  const name = cssName(t.path), value = toCss(t.type, t.value);
  base.push([name, value]);
  const entry = { type: t.type, value, ...(t.description ? { description: t.description } : {}) };
  const modes = {};
  for (const [m, mv] of Object.entries(t.modes)) modes[m] = toCss(t.type, mv);
  /* dark + high contrast needs a value whenever either one changes the token, otherwise the high-contrast (light) value
     would leak into dark mode: explicit, else dark, else high-contrast. */
  if ((modes.dark || modes['high-contrast']) && !modes['dark-high-contrast']) modes['dark-high-contrast'] = modes.dark || modes['high-contrast'];
  for (const [m, mv] of Object.entries(modes)) byMode[m].push([name, mv]);
  if (Object.keys(modes).length) entry.modes = modes;
  json[name] = entry;
}
for (const s of springs) {
  const g = (k) => resolve(tokens.get(`${s}.${k}`)?.value);
  const k = g('stiffness'), z = g('damping'), d = g('duration');
  if (k == null || z == null || !d) { fail(`Spring ${s} needs stiffness, damping and duration`); continue; }
  const { easing, overshoot } = springEasing(k, z, d.value);
  const name = cssName(s.split('.'));
  base.push([name, easing]);
  json[name] = { type: 'easing', value: easing, description: `Spring: stiffness ${k}, damping ${z}, ${d.value}ms, overshoot ${overshoot}%.` };
}

/* ---------- contrast checks (WCAG) ---------- */
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const roleIn = (role, mode) => { const e = json[`--md-sys-color-${role}`]; return mode === 'light' ? e?.value : e?.modes?.[mode] ?? e?.value; };
const SURFACES = ['surface', 'surface-container-lowest', 'surface-container-low', 'surface-container', 'surface-container-high', 'surface-container-highest', 'surface-dim', 'surface-bright'];
const PAIRS = [
  ...['primary', 'secondary', 'tertiary', 'error'].flatMap((r) => [[`on-${r}`, r, 4.5], [`on-${r}-container`, `${r}-container`, 4.5]]),
  ...SURFACES.flatMap((s) => [['on-surface', s, 4.5], ['on-surface-variant', s, 4.5], ['primary', s, 3], ['outline', s, 3]]),
  ['inverse-on-surface', 'inverse-surface', 4.5], ['inverse-primary', 'inverse-surface', 3],
];
const contrastReport = [];
for (const mode of ['light', 'dark', 'high-contrast', 'dark-high-contrast']) {
  let worst = Infinity;
  for (const [fg, bg, min] of PAIRS) {
    const a = roleIn(fg, mode), b = roleIn(bg, mode);
    if (!a || !b) { fail(`Contrast check: missing role ${!a ? fg : bg}`); continue; }
    const r = ratio(a, b); worst = Math.min(worst, r / min);
    if (r < min) fail(`Contrast ${mode}: ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${min}:1`);
  }
  contrastReport.push(`${mode}: ${PAIRS.length} pairs pass`);
}

/* ---------- write CSS ---------- */
const decl = (list, indent = '    ') => list.map(([n, v]) => `${indent}${n}: ${v};`).join('\n');
const block = (sel, list, extra = []) => (list.length ? `  ${sel} {\n${decl([...extra, ...list])}\n  }\n` : '');
const media = (q, inner) => (inner ? `  @media ${q} {\n${inner.replace(/^/gm, '  ')}  }\n` : '');
const W = (s) => `:where(${s})`;
const SCHEME = (v) => [['color-scheme', v]];
const header = `/* S4 Orion tokens ${pkg.version}. GENERATED by scripts/build-tokens.mjs from tokens/src/*.tokens.json. Do not edit.
   Every selector is wrapped in :where() so all blocks have the same (zero) specificity and source order decides:
   base -> dark -> high contrast -> dark + high contrast -> reduced motion -> reduced transparency.
   Opt in or out with attributes on <html>: data-theme="light|dark", data-contrast="standard|high",
   data-motion="reduced", data-glass="off". Without attributes, the device settings apply. */\n`;
let css = header + '@layer s4.tokens {\n';
css += block(W(':root'), base, SCHEME('light'));
const DARK_AUTO = ':root:not([data-theme="light"])', HC_AUTO = ':root:not([data-contrast="standard"])';
css += media('(prefers-color-scheme: dark)', block(W(DARK_AUTO), byMode.dark, SCHEME('dark')));
css += block(W(':root[data-theme="dark"]'), byMode.dark, SCHEME('dark'));
css += media('(prefers-contrast: more)', block(W(HC_AUTO), byMode['high-contrast']));
css += block(W(':root[data-contrast="high"]'), byMode['high-contrast']);
const dhc = byMode['dark-high-contrast'];
css += media('(prefers-color-scheme: dark) and (prefers-contrast: more)', block(W(`${DARK_AUTO}${HC_AUTO.slice(5)}`), dhc));
css += media('(prefers-color-scheme: dark)', block(W(`${DARK_AUTO}[data-contrast="high"]`), dhc));
css += media('(prefers-contrast: more)', block(W(`:root[data-theme="dark"]${HC_AUTO.slice(5)}`), dhc));
css += block(W(':root[data-theme="dark"][data-contrast="high"]'), dhc);
css += media('(prefers-reduced-motion: reduce)', block(W(':root'), byMode['reduced-motion']));
css += block(W(':root[data-motion="reduced"]'), byMode['reduced-motion']);
const rt = byMode['reduced-transparency'];
css += media('(prefers-reduced-transparency: reduce)', block(W(':root'), rt));
css += block(W(':root[data-glass="off"]'), rt);
css += `  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {\n${block(W(':root'), rt).replace(/^/gm, '  ')}  }\n`;
css += '}\n';

/* ---------- write TS and JSON ---------- */
const ts = `/* S4 Orion tokens ${pkg.version}. GENERATED by scripts/build-tokens.mjs. Do not edit. */
export const version = ${JSON.stringify(pkg.version)};
export const tokens = ${JSON.stringify(json, null, 2)} as const;
export type TokenName = keyof typeof tokens;
export type Mode = ${MODES.map((m) => JSON.stringify(m)).join(' | ')};
/** CSS reference for a token, e.g. cssVar('--md-sys-color-primary') -> 'var(--md-sys-color-primary)'. */
export const cssVar = (name: TokenName): string => \`var(\${name})\`;
`;
const out = { 'tokens/tokens.css': css, 'tokens/tokens.ts': ts, 'tokens/tokens.json': JSON.stringify({ version: pkg.version, tokens: json }, null, 2) + '\n' };

if (errors.length) { console.error(errors.map((e) => '  x ' + e).join('\n')); console.error(`\n${errors.length} problem(s); nothing written.`); process.exit(1); }
if (CHECK) {
  const stale = Object.entries(out).filter(([f, c]) => !existsSync(join(root, f)) || readFileSync(join(root, f), 'utf8') !== c).map(([f]) => f);
  if (stale.length) { console.error(`Stale generated files (run npm run build:tokens): ${stale.join(', ')}`); process.exit(1); }
  console.log(`Tokens up to date: ${tokens.size} tokens + ${springs.length} spring easings. Contrast: ${contrastReport.join('; ')}.`);
} else {
  for (const [f, c] of Object.entries(out)) writeFileSync(join(root, f), c);
  console.log(`Built ${tokens.size} tokens + ${springs.length} spring easings from ${files.length} files -> tokens.css, tokens.ts, tokens.json`);
  console.log(`Contrast: ${contrastReport.join('; ')}`);
}
