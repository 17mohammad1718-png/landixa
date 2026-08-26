#!/usr/bin/env node
/* ============================================================
   Landixa — self-check.mjs (dev tooling, NOT part of the template)
   Pure Node, zero dependencies:  node tools/self-check.mjs
   Static hard-rule checks from docs/AGENT_INSTRUCTIONS.md §2/§6.
   Interactive checks (keyboard, reduced-motion, 360px) are a
   manual browser pass — see docs/self-check.md.
   ============================================================ */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(path.join(REPO, p), 'utf8');

const html = read('index.html');
const css = read('assets/css/style.css');
const js = read('assets/js/main.js');
const files = { 'index.html': html, 'assets/css/style.css': css, 'assets/js/main.js': js };

const results = [];
const ok = (name, pass, note = '') => results.push({ name, pass, note });

/* ---- 1. zero external dependencies (rule 1) ---- */
const external = [];
for (const [name, src] of Object.entries(files)) {
  const hits = src.match(/https?:\/\/[^\s"'()<>]+|@import\b|cdn\./gi) || [];
  for (const h of hits) external.push(`${name}: ${h}`);
}
ok('no external URLs / @import / CDN references in html+css+js',
   external.length === 0, external.join(' | '));

/* ---- 2. every referenced local file exists ---- */
const localRefs = new Set(); // resolved repo-relative paths
for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) localRefs.add(m[1]);
for (const m of css.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
  localRefs.add(path.posix.normalize('assets/css/' + m[1]));
}
const brokenRefs = [...localRefs].filter((r) =>
  !r.startsWith('#') && !r.startsWith('data:') && !existsSync(path.join(REPO, r)));
ok('all local href/src/url() references exist on disk',
   brokenRefs.length === 0, brokenRefs.join(' | '));

/* ---- 3. anchors resolve (self-check §5.4) ---- */
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = [...html.matchAll(/<a[^>]+href="#([^"]+)"/g)].map((m) => m[1]);
const brokenAnchors = anchors.filter((a) => a !== '' && !ids.has(a));
ok('all named anchors resolve to existing ids',
   brokenAnchors.length === 0, brokenAnchors.join(' | ') || `${anchors.length} anchors checked`);

/* ---- 4. local Vazirmatn fonts only (rules 1+3) ---- */
const fontFiles = [...css.matchAll(/url\('\.\.\/fonts\/([^']+)'\)/g)].map((m) => m[1]);
ok('exactly 3 local Vazirmatn @font-face files, all present',
   fontFiles.length === 3 && fontFiles.every((f) => existsSync(path.join(REPO, 'assets/fonts', f))),
   fontFiles.join(' '));
const families = new Set([...css.matchAll(/font-family:\s*([^;}]+)/g)].map((m) => m[1].replace(/['"]/g, '')));
const allowedFont = (f) =>
  /^(Vazirmatn|ui-monospace|Consolas|Menlo|Tahoma|var\(--mono\)|inherit)/.test(f.trim());
ok('only Vazirmatn + local token/system fallbacks used (no other font source)',
   [...families].every(allowedFont), [...families].join(' | '));

/* ---- 5. RTL-first: logical properties only (rule 2) ---- */
const phys = css.match(/(^|[\s{,])(left|right)\s*:|margin-(left|right)\s*:|padding-(left|right)\s*:|border-(left|right)\s*:|text-align\s*:\s*(left|right)\s*:/g);
ok('no physical left/right properties in style.css', !phys, phys?.join(' | '));
ok('html is dir="rtl" lang="fa"', /<html[^>]+lang="fa"[^>]+dir="rtl"/.test(html));

/* ---- 6. Jalali dates / no personal links (rules 4+5, §6) ---- */
const personal = [];
for (const [name, src] of Object.entries(files)) {
  const hits = src.match(/github\.com|t\.me\/|mailto:|telegram/i) || [];
  for (const h of hits) personal.push(`${name}: ${h}`);
}
ok('no personal links (github.com / t.me / mailto / telegram)',
   personal.length === 0, personal.join(' | '));
const gregorian = html.match(/20\d{2}[-/]\d{1,2}[-/]\d{1,2}/);
ok('no Gregorian-style dates in the page', !gregorian, gregorian);

/* ---- 7. accessibility inventory (rule 9) ---- */
const svgNoHide = [...html.matchAll(/<svg(?![^>]*aria-hidden)[^>]*>/g)];
ok('every decorative <svg> is aria-hidden', svgNoHide.length === 0,
   svgNoHide.length + ' without aria-hidden');
const toggleTag = (html.match(/<button[^>]*class="nav-toggle"[^>]*>/) || [''])[0];
ok('nav toggle: aria-label + aria-expanded + aria-controls',
   /aria-label="[^"]+"/.test(toggleTag) &&
   /aria-expanded="false"/.test(toggleTag) &&
   /aria-controls="mainNav"/.test(toggleTag));
ok('lightbox: role=dialog + aria-modal + labelled close button',
   /role="dialog"[^>]*aria-modal="true"/.test(html) &&
   /<button class="lb-close"[^>]*aria-label="[^"]+"/.test(html));
ok('shots are keyboard buttons (tabindex + role + aria-label)',
   (html.match(/<figure class="shot" data-shot tabindex="0" role="button" aria-label="/g) || []).length === 5);
ok('reduced-motion kill present in CSS',
   css.includes('@media(prefers-reduced-motion:reduce)') && css.includes('animation:none'));

/* ---- 8. variant pages (Phase 2A) ---- */
const pages = ['index.html', 'home-light.html', 'home-warm.html'];
const missingPages = pages.filter((p) => !existsSync(path.join(REPO, p)));
ok('variant pages exist: home-light.html + home-warm.html',
   missingPages.length === 0, missingPages.join(' '));
const pageSources = {};
for (const p of pages) if (existsSync(path.join(REPO, p))) pageSources[p] = read(p);

// correct dir/lang + the right data-theme on every home page
const themeAttr = (src) => (src.match(/<html[^>]*data-theme="([^"]+)"/) || [,''])[1];
const pageThemes = { 'index.html': '', 'home-light.html': 'light', 'home-warm.html': 'warm' };
const badThemes = Object.entries(pageThemes).filter(([p, want]) => {
  const src = pageSources[p];
  return !src || themeAttr(src) !== want ||
    !/<html[^>]+lang="fa"[^>]+dir="rtl"/.test(src);
}).map(([p]) => p);
ok('every home page: dir=rtl lang=fa + correct data-theme (default/light/warm)',
   badThemes.length === 0, badThemes.join(' '));

// every data-theme used must have a token-override block in the shared CSS
const cssThemes = new Set([...css.matchAll(/html\[data-theme="([^"]+)"\]\{/g)].map((m) => m[1]));
const missingCssThemes = [...new Set(Object.values(pageThemes).filter(Boolean))]
  .filter((t) => !cssThemes.has(t));
ok('each data-theme has a token-override block in style.css',
   missingCssThemes.length === 0, missingCssThemes.join(' '));

// variant pages obey the same hard rules as index
const pageProblems = [];
for (const [p, src] of Object.entries(pageSources)) {
  if (p === 'index.html') continue; // covered by checks 1-7 above
  const ext = src.match(/https?:\/\/[^\s"'()<>]+|@import\b|cdn\./gi);
  if (ext) pageProblems.push(`${p}: external refs ${ext.join(', ')}`);
  const ids2 = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const brk = [...src.matchAll(/<a[^>]+href="#([^"]+)"/g)].map((m) => m[1])
    .filter((a) => a !== '' && !ids2.has(a));
  if (brk.length) pageProblems.push(`${p}: broken anchors ${brk.join(', ')}`);
  const missingRefs = [...src.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .filter((r) => !r.startsWith('#') && !r.startsWith('data:') &&
      !existsSync(path.join(REPO, r)));
  if (missingRefs.length) pageProblems.push(`${p}: missing files ${missingRefs.join(', ')}`);
  const svgNoHide2 = [...src.matchAll(/<svg(?![^>]*aria-hidden)[^>]*>/g)];
  if (svgNoHide2.length) pageProblems.push(`${p}: ${svgNoHide2.length} svg without aria-hidden`);
}
ok('variant pages: no external refs, files exist, anchors resolve, svg aria-hidden',
   pageProblems.length === 0, pageProblems.join(' | '));

// variants must share the single style.css + main.js (no per-variant css)
const shared = Object.entries(pageSources).filter(([p]) => p !== 'index.html').every(([, src]) =>
  /<link rel="stylesheet" href="assets\/css\/style\.css">/.test(src) &&
  /<script src="assets\/js\/main\.js" defer><\/script>/.test(src) &&
  (src.match(/<link rel="stylesheet"/g) || []).length === 1);
ok('variant pages share assets/css/style.css + main.js (one stylesheet each)',
   shared);

/* ---- report ---- */
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`[${r.pass ? 'PASS' : 'FAIL'}] ${r.name}${r.note ? '  — ' + r.note : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} static checks passed`);
process.exit(failed ? 1 : 0);
