#!/usr/bin/env node
/* Make one self-contained HTML file from a page that links the S4 Orion assets.
   Usage: node inline.mjs page.html [out.html]   (default out: page.single.html next to the page)
   Inlines orion.css (with Inter as a base64 font), icons.js, orion.js and m3color.js (only when the page sets a seed or
   has theme swatches), looked up next to the page first, then in this skill's assets/. Removes the font preload.
   Other local stylesheets and scripts are inlined too; remote URLs are left alone. Run it again after every edit. */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const [src, dest] = process.argv.slice(2);
if (!src) { console.error('Usage: node inline.mjs page.html [out.html]'); process.exit(2); }
const pageDir = dirname(resolve(src));
const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const find = (ref) => {
  const clean = ref.split(/[?#]/)[0];
  for (const f of [resolve(pageDir, clean), join(assets, basename(clean))]) if (existsSync(f)) return f;
  return null;
};
const isRemote = (u) => /^(https?:)?\/\/|^data:/.test(u);
let html = readFileSync(resolve(src), 'utf8');
const missing = [];

/* font preload: the font is inlined into the CSS */
html = html.replace(/<link[^>]+rel=["']?preload["']?[^>]*\.woff2[^>]*>\s*/gi, '');

/* stylesheets */
html = html.replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, (tag) => {
  const href = (/href=["']?([^"'\s>]+)/i.exec(tag) || [])[1];
  if (!href || isRemote(href)) return tag;
  const f = find(href); if (!f) { missing.push(href); return tag; }
  let css = readFileSync(f, 'utf8').replace(/url\(["']?([^"')]+\.woff2)["']?\)/g, (m, u) => {
    const font = isRemote(u) ? null : (existsSync(resolve(dirname(f), u)) ? resolve(dirname(f), u) : find(u));
    if (!font) { if (!isRemote(u)) missing.push(u); return m; }
    return `url("data:font/woff2;base64,${readFileSync(font).toString('base64')}")`;
  });
  return `<style>\n${css.replace(/<\/style/gi, '<\\/style')}\n</style>`;
});

/* scripts */
const usesSeed = /S4\.theme\s*\(\s*\{[^}]*seed\s*:\s*['"#]|S4\.theme\.restore\([^)]*seed|data-theme-seed/.test(html);
let m3inlined = false;
html = html.replace(/<script\b([^>]*)\bsrc=["']?([^"'\s>]+)["']?([^>]*)><\/script>/gi, (tag, a, href, b) => {
  if (isRemote(href)) return tag;
  const f = find(href); if (!f) { missing.push(href); return tag; }
  let js = readFileSync(f, 'utf8').replace(/<\/script/gi, '<\\/script');
  let pre = '';
  if (/(^|\/)orion\.js$/.test(href.split(/[?#]/)[0]) && usesSeed) {
    const m3 = find('m3color.js');
    if (m3) { pre = `<script>\n${readFileSync(m3, 'utf8').replace(/<\/script/gi, '<\\/script')}\n</script>\n`; m3inlined = true; }
    else missing.push('m3color.js');
  }
  const attrs = (a + b).replace(/\s+/g, ' ').trim();
  return `${pre}<script${attrs ? ' ' + attrs : ''}>\n${js}\n</script>`;
});

if (missing.length) { console.error(`Could not find: ${[...new Set(missing)].join(', ')}`); process.exit(1); }
const out = dest ? resolve(dest) : resolve(pageDir, basename(src).replace(/\.html?$/, '') + '.single.html');
writeFileSync(out, html);
console.log(`Wrote ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB${m3inlined ? ', with color generation' : ''}).`);
