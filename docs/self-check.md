# Self-check — Landixa

Run this before you consider any phase done. It encodes the Definition of
Done from `AGENT_INSTRUCTIONS.md` §6 plus the interactive checks from §5.4.

There are two layers: a **static** check (fast, zero-dependency, runs
anywhere) and a **manual browser** pass (the real proof).

## 1. Static check — zero network, hard rules

```bash
node tools/self-check.mjs
```

Pure Node, **no dependencies, no `npm install`**. It reads every page
(`index.html`, the two variant homes, the two blog pages, the English
LTR twin), `assets/css/style.css` and `assets/js/main.js` and asserts
every hard rule:

- no external URLs / `@import` / CDN references (rules 1, 4)
- every local `href` / `src` / `url()` exists on disk, resolved against the
  page's own directory (no 404s from `file://`; works inside subfolders
  like `blog/`)
- all named anchors resolve to existing `id`s
- exactly the 3 local Vazirmatn `@font-face` files, all present, no other font source (rules 1, 3)
- RTL-first: `dir="rtl"`, no physical `left/right` CSS properties (rule 2)
- no personal links — `github.com`, `t.me/`, `mailto:`, `telegram` (rule 5, §6)
- no Gregorian-style dates on any page — Jalali only (rule 4)
- blog pages exist, are `dir=rtl lang=fa`, share the single
  `../assets/css/style.css` + `main.js`, carry no external/personal links,
  and their refs resolve from `blog/`
- the LTR twin exists (`ltr/index.html`), is `lang=en dir=ltr`, shares the
  single stylesheet + `main.js`, carries no external/personal links, its
  anchors/refs resolve from `ltr/`, and it is fully translated (no
  Arabic-script characters left)
- accessibility inventory: decorative SVGs `aria-hidden`, nav-toggle ARIA
  triple, lightbox `role=dialog`/`aria-modal`/labelled close, shots are
  keyboard buttons, reduced-motion kill present (rule 9)

Must exit `0` (all PASS) before you commit.

## 2. Manual browser pass (open `index.html` from disk)

No server needed — double-click `index.html`. In DevTools:

1. **Zero network requests** — Network tab, hard reload. Expect *only*
   `index.html`, `style.css`, `main.js` and the 3 `Vazirmatn-*.woff2`.
   Nothing else, no red/failed requests.
2. **No console errors** — Console tab is empty.
3. **Menu** — under 769px: toggle opens/closes; keyboard: `Enter` opens and
   focus lands on the first link, `Tab`/`Shift+Tab` cycle inside the menu,
   `Escape` closes and refocuses the toggle; clicking a link closes it.
4. **Screenshot lightbox** — click or `Enter`/`Space` on a shot opens it;
   `Tab` stays on the close button; `Escape` / close button / backdrop click
   all close it and return focus to the shot.
5. **FAQ accordion** — only one item open at a time; native `<details>`
   keyboard works.
6. **Reveal on scroll** — cards animate in once. With the OS
   “reduce motion” preference on, there is no animation and content still
   appears (no stuck invisible cards).
7. **Responsive** — resize 1920 → 1200 → 768 → 360 → 320. No horizontal
   scrollbar at 360/320; store buttons wrap/stack; phone mockup and stats
   grid hold up.
8. **Links** — every nav link, the brand mark and “دانلود اپ” scroll to
   their section. The store buttons show the demo-hint toast (no
   jump-to-top) until the buyer replaces their `href` with real links.

## 3. Optional deeper check (needs Node + jsdom)

A jsdom harness that actually loads the page, runs `main.js`, and exercises
nav / lightbox / FAQ / store-guard with a request interceptor proving **zero
network fetches** is available to maintainers (it needs `npm i jsdom`, so it
is deliberately *not* part of the shipped template — keep it in your dev
area, not in `assets/`). The static check in step 1 is what runs with the
product.
