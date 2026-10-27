#!/usr/bin/env node
/* Check a page built with S4 Orion before handing it over.
   Usage: node check.mjs page.html [more.html | http://…] [--out dir]
   Loads each page as a 390px dark phone and a 1280px light desktop (Playwright + Chromium) and reports:
     errors   – console errors, failed requests, unknown icons, sideways scroll, text below WCAG AA as rendered
                (on glass: against the worst backdrop after the glass's own filter and tint), icon-only controls with
                no name, and app CSS that breaks the house rules (hex/rgb colors, !important, hand-written durations or
                easings, glass on content, bare element selectors)
     warnings – more than one filled button in one area, labels that look sentence case
   Saves a full-page screenshot per viewport in --out (default ./s4-check). Exit code 1 when there are errors. */
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT = resolve(outIdx >= 0 ? argv.splice(outIdx, 2)[1] : 's4-check');
const pages = argv.filter((a) => !a.startsWith('--'));
if (!pages.length) { console.error('Usage: node check.mjs page.html [--out dir]'); process.exit(2); }

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { try { ({ chromium } = createRequire(resolve('x.js'))('playwright')); } catch { try { ({ chromium } = createRequire(import.meta.url)('playwright')); } catch {} } }
if (!chromium) { console.error('Playwright is not installed: npm i -D playwright && npx playwright install chromium'); process.exit(2); }

const SYSTEM_CSS = /(^|\/)orion(\.min)?\.css$/;
const SAFE_SELECTOR = /^(html|body|:root|\*|::?[a-z-]+|from|to|\d+(\.\d+)?%)$/;

/* ---------------- static lint of the app's own CSS ---------------- */
function lintCss(css, where) {
  const out = [];
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const keyframes = new Set();
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)/g)) keyframes.add(m[1]);
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim().replace(/^@[^;]*;\s*/, ''), body = m[2];
    if (/^(from|to|[\d.%,\s]+)$/.test(sel)) continue;            /* keyframe stops */
    const at = `${where}: ${sel.slice(0, 60)}`;
    for (const d of body.split(';')) {
      const i = d.indexOf(':'); if (i < 0) continue;
      const prop = d.slice(0, i).trim().toLowerCase(), raw = d.slice(i + 1).trim();
      if (prop.startsWith('--') && /^--_/.test(prop)) continue;
      const val = raw.replace(/var\([^()]*(\([^()]*\))*[^()]*\)/g, 'VAR');
      if (/!important/.test(raw)) out.push(`${at} → ${prop}: !important (override with tokens or attributes instead)`);
      if (/#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/i.test(val) && !/^(content|src|grid-template-areas)$/.test(prop))
        out.push(`${at} → ${prop}: ${raw} (use a --md-sys-color-* role)`);
      if (/\b(white|black)\b/i.test(val) && /color|background|border|fill|stroke|shadow|outline/.test(prop))
        out.push(`${at} → ${prop}: ${raw} (use a --md-sys-color-* role)`);
      if (/^(-webkit-)?backdrop-filter$/.test(prop) && !/^none$/.test(val))
        out.push(`${at} → ${prop} (glass comes from the components or class="s4-glass" on a floating panel only)`);
      if (/^(transition|animation)(-duration|-timing-function|-delay)?$/.test(prop)) {
        const words = val.split(/[\s,]+/);
        if (words.some((w) => /^-?\d*\.?\d+m?s$/.test(w) && !/^0m?s$/.test(w)) || /\b(ease|ease-in|ease-out|ease-in-out|cubic-bezier|steps)\b/.test(val))
          out.push(`${at} → ${prop}: ${raw} (use the spring tokens or S4.motion.animate)`);
      }
    }
    if (sel.startsWith('@')) continue;
    for (const s of sel.split(',').map((x) => x.trim())) {
      if (!s || SAFE_SELECTOR.test(s)) continue;
      if (!/[.#[]/.test(s) && !/^(html|body|:root)\b/.test(s))
        out.push(`${where}: "${s}" styles bare elements (scope it under an app class so it can't leak into components)`);
    }
  }
  return out;
}

/* ---------------- in-page audit (runs in the browser) ---------------- */
function audit() {
  const issues = { overflow: [], contrast: [], names: [], filled: [], caseWarn: [], glassContent: [] };
  const vw = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > vw + 1) {
    const wide = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > vw + 1 && getComputedStyle(e).position !== 'fixed'; })
      .filter((e, _, all) => !all.some((p) => p !== e && p.contains(e))).slice(0, 5);
    issues.overflow.push(`page is ${document.documentElement.scrollWidth}px wide in a ${vw}px window; widest: ${wide.map(path).join(', ') || '?'}`);
  }
  function path(e) {
    const bits = []; for (let n = e; n && n !== document.body && bits.length < 3; n = n.parentElement) {
      let s = n.tagName.toLowerCase(); if (n.id) s += '#' + n.id; else if (n.classList.length) s += '.' + [...n.classList].slice(0, 2).join('.'); bits.unshift(s);
    } return bits.join(' > ');
  }
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const parse = (c) => {
    let m = c.match(/^rgba?\(([^)]+)\)/);
    if (m) { const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] == null ? 1 : p[3]]; }
    m = c.match(/^color\(srgb ([^)]+)\)/);
    if (m) { const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] == null ? 1 : p[3]]; }
    if (!c || c === 'transparent') return null;
    cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1);    /* oklch(), lab() … */
    const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (top, bot) => { const a = top[3]; return [0, 1, 2].map((i) => top[i] * a + bot[i] * (1 - a)).concat(1); };
  const lum = (c) => { const v = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const filterOf = (f) => { const c = /contrast\(([\d.]+)\)/.exec(f), b = /brightness\(([\d.]+)\)/.exec(f); return (v) => Math.min(255, Math.max(0, ((v - 127.5) * (c ? +c[1] : 1) + 127.5) * (b ? +b[1] : 1))); };
  const hidden = (e) => {   /* not shown, or disabled (WCAG exempts disabled controls, including their labels) */
    if (e.closest('[hidden],[inert],[aria-hidden="true"],.s4-visually-hidden,[disabled],[aria-disabled="true"],:disabled,[data-s4-skip]')) return true;
    const lab = e.closest('label'); if (lab && lab.control && lab.control.disabled) return true;
    return ['label', '.s4-text-field', '.s4-list-item'].some((q) => { const c = e.closest(q); return c && c.querySelector('input:disabled, select:disabled, textarea:disabled'); });
  };
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.nodeValue.trim() ? 1 : 2 });
  for (let t; (t = walker.nextNode());) {
    const el = t.parentElement; if (!el || seen.has(el) || hidden(el) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName)) continue;
    seen.add(el);
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (!r.width || !r.height || cs.visibility !== 'visible' || +cs.opacity === 0) continue;
    let fg = parse(cs.color); if (!fg) continue;
    /* stack of backgrounds up to the first opaque one, noting glass and opacity */
    const layers = []; let glass = null, opacity = 1, unknown = false;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n); opacity *= +s.opacity;
      const bg = parse(s.backgroundColor); const bf = s.backdropFilter || s.webkitBackdropFilter;
      if (bf && bf !== 'none' && bg && bg[3] < 1) { glass = { tint: bg, f: filterOf(bf) }; break; }   /* its gradient is the edge highlight */
      if (s.backgroundImage !== 'none') unknown = true;
      if (bg && bg[3] > 0) { layers.push(bg); if (bg[3] >= 1) break; }
    }
    if (unknown || opacity < 0.99) continue;                                  /* images and fading content: skip */
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700, large = size >= 24 || (bold && size >= 18.66);
    const need = large ? 3 : 4.5;
    const bases = glass ? [0, 255].map((v) => { const x = glass.f(v); return over(glass.tint, [x, x, x, 1]); }) : [[255, 255, 255, 1]];
    let worst = Infinity;
    for (let base of bases) {
      for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
      worst = Math.min(worst, ratio(over(fg, base), base));
    }
    if (worst < need) issues.contrast.push(`${worst.toFixed(2)}:1 (needs ${need}) ${glass ? 'on glass ' : ''}"${t.nodeValue.trim().slice(0, 40)}" in ${path(el)}`);
  }
  /* icon-only controls need a name */
  for (const b of document.querySelectorAll('button, a[href], [role="button"], [role="tab"], [role="menuitem"]')) {
    if (hidden(b) || !b.getClientRects().length) continue;
    const name = (b.getAttribute('aria-label') || '').trim() || (b.getAttribute('aria-labelledby') ? 'x' : '') || (b.title || '').trim() || b.textContent.trim();
    if (!name) issues.names.push(path(b));
  }
  /* glass on content */
  for (const g of document.querySelectorAll('.s4-glass')) if (g.matches('.s4-card, .s4-pane, .s4-list, .s4-table, .s4-text-field, main, article, p, li, td') || (g.closest('.s4-content') && /^(static|relative)$/.test(getComputedStyle(g).position)))
    issues.glassContent.push(path(g));
  /* one filled button per area */
  const filled = [...document.querySelectorAll('.s4-button:not([data-variant])')].filter((b) => !hidden(b) && b.getClientRects().length && !b.closest('.s4-button-group'));
  const byParent = new Map(); for (const b of filled) { const p = b.parentElement; byParent.set(p, (byParent.get(p) || []).concat(b)); }
  for (const [p, bs] of byParent) if (bs.length > 1) issues.filled.push(`${bs.length} filled buttons in ${path(p)}: ${bs.map((b) => '"' + b.textContent.trim() + '"').join(', ')}`);
  /* Title Case labels */
  const small = new Set('a an the and but or nor for so yet on at to by in of up as vs via with per from into off out over'.split(' '));
  for (const e of document.querySelectorAll('.s4-button, .s4-chip, .s4-tab, .s4-nav-label, .s4-menu-item, th, .s4-app-bar-title, .s4-pane-title, .s4-card-title, .s4-dialog-title, .s4-sheet-title, .s4-text-field label')) {
    if (hidden(e)) continue;
    const c = e.cloneNode(true); c.querySelectorAll('[class*="supporting"], [class*="trailing"], .s4-badge, .s4-icon').forEach((x) => x.remove());
    const words = c.textContent.trim().replace(/\s+/g, ' ').split(' ');
    if (words.length < 2 || words.length > 8 || /[.?!]$/.test(words.at(-1))) continue;
    if (words.slice(1).some((w) => /^[a-z]/.test(w) && !small.has(w))) issues.caseWarn.push(`"${words.join(' ')}" (${path(e)})`);
  }
  return issues;
}

/* ---------------- run ---------------- */
const VIEWS = [
  { name: '390-dark', viewport: { width: 390, height: 844 }, colorScheme: 'dark', isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  { name: '1280-light', viewport: { width: 1280, height: 800 }, colorScheme: 'light', deviceScaleFactor: 1 },
];
mkdirSync(OUT, { recursive: true });
/* serve each page's folder over http, as it will be deployed (file:// blocks font preloads and module fetches) */
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2', ico: 'image/x-icon' };
const servers = new Map();
async function serve(dir) {
  if (servers.has(dir)) return servers.get(dir);
  const srv = createServer((req, res) => {
    const f = join(dir, decodeURIComponent(req.url.split(/[?#]/)[0]));
    if (!f.startsWith(dir) || !existsSync(f)) { res.writeHead(404); return res.end(); }
    try { const body = readFileSync(f); res.writeHead(200, { 'content-type': TYPES[f.split('.').pop()] || 'application/octet-stream' }); res.end(body); }
    catch { res.writeHead(404); res.end(); }
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${srv.address().port}`; servers.set(dir, { srv, base }); return servers.get(dir);
}
const browser = await chromium.launch();
let errorCount = 0, warnCount = 0;
for (const page of pages) {
  const url = /^https?:/.test(page) ? page : `${(await serve(dirname(resolve(page)))).base}/${encodeURIComponent(basename(page))}`;
  const label = basename(page).replace(/\.html?$/, '') || 'page';
  const errors = new Set(), warnings = new Set();

  /* static: inline <style> and local app stylesheets (not orion.css) */
  if (!/^https?:/.test(page) && existsSync(resolve(page))) {
    const html = readFileSync(resolve(page), 'utf8');
    let n = 0;
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      n++; if (/^\s*\/\* S4 Orion [\d.]+ stylesheet/.test(m[1])) continue;     /* orion.css inlined by inline.mjs */
      lintCss(m[1], `<style> #${n}`).forEach((e) => errors.add(e));
    }
    for (const m of html.matchAll(/<link[^>]+rel=["']?stylesheet[^>]*>/gi)) {
      const href = (/href=["']?([^"'\s>]+)/.exec(m[0]) || [])[1];
      if (!href || /^(https?:)?\/\//.test(href) || SYSTEM_CSS.test(href.split('?')[0])) continue;
      const f = resolve(dirname(resolve(page)), href.split('?')[0]);
      if (existsSync(f)) lintCss(readFileSync(f, 'utf8'), href).forEach((e) => errors.add(e));
    }
    for (const m of html.matchAll(/\sstyle="([^"]*)"/gi)) lintCss(`.x{${m[1]}}`, `style=""`).forEach((e) => errors.add(e.replace(/: \.x → /, " → ")));
  }

  for (const v of VIEWS) {
    const ctx = await browser.newContext(v);
    const p = await ctx.newPage();
    p.on('console', (m) => {
      const t = m.text();
      if (m.type() === 'error') errors.add(`[${v.name}] console error: ${t}`);
      else if (m.type() === 'warning' && /^S4:/.test(t)) errors.add(`[${v.name}] ${t}`);
    });
    p.on('pageerror', (e) => errors.add(`[${v.name}] script error: ${e.message}`));
    p.on('requestfailed', (r) => errors.add(`[${v.name}] failed to load ${r.url()}`));
    p.on('response', (r) => { if (r.status() >= 400) errors.add(`[${v.name}] ${r.status()} ${r.url()}`); });
    await p.goto(url, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.waitForTimeout(700);                                            /* springs and dynamic color settle */
    const r = await p.evaluate(audit);
    r.overflow.forEach((x) => errors.add(`[${v.name}] sideways scroll: ${x}`));
    r.contrast.forEach((x) => errors.add(`[${v.name}] low contrast ${x}`));
    r.names.forEach((x) => errors.add(`[${v.name}] control with no accessible name (add aria-label): ${x}`));
    r.glassContent.forEach((x) => errors.add(`[${v.name}] glass on content: ${x}`));
    r.filled.forEach((x) => warnings.add(`more than one filled button in an area: ${x}`));
    r.caseWarn.forEach((x) => warnings.add(`label may not be Title Case: ${x}`));
    const shot = join(OUT, `${label}-${v.name}.png`);
    await p.screenshot({ path: shot, fullPage: true });
    await ctx.close();
  }

  console.log(`\n${page}`);
  if (!errors.size && !warnings.size) console.log('  ✓ no problems found');
  for (const e of errors) console.log('  ✗ ' + e);
  for (const w of warnings) console.log('  ! ' + w);
  console.log(`  screenshots: ${join(OUT, label)}-390-dark.png, ${label}-1280-light.png`);
  errorCount += errors.size; warnCount += warnings.size;
}
await browser.close();
for (const { srv } of servers.values()) srv.close();
console.log(`\n${errorCount} error(s), ${warnCount} warning(s).${errorCount ? ' Fix the errors and run it again.' : ''}`);
process.exit(errorCount ? 1 : 0);
