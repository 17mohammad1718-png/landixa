# AGENTS.md — Landixa (قالب HTML لندینگ معرفی اپلیکیشن)

Read this file FULLY before touching any file. This project ships to the
rtl-theme.com marketplace. Violating the rules below = product rejection.

## 1. What this project is

**Landixa (لندیکسا)** — a single-purpose, zero-dependency, RTL-first HTML
template for introducing mobile apps (app landing page). It will be sold as
"قالب HTML" on rtl-theme.com. The buyer is an Iranian app developer who wants
a Persian landing page for their app (cafe-bazaar / myket / direct APK
download buttons).

Current state: a working v1 draft exists (single page, dark theme).
Your job versions: evolve it per the roadmap in `docs/ROADMAP.md`.

## 2. Hard rules (violations = rejected by marketplace review)

1. **Zero external dependencies.** No CDN, no Google Fonts, no Bootstrap,
   no jQuery, no analytics, no external images. Everything local:
   `assets/css/style.css`, `assets/js/main.js`, `assets/fonts/*.woff2`.
   All graphics must be inline SVG or pure CSS.
2. **RTL-first.** The Persian page (`index.html`, `dir="rtl"`) is the main
   product. Use CSS logical properties (`margin-inline-start`, not
   `margin-left`) so the LTR twin works by flipping `dir`.
3. **Local font only:** Vazirmatn (`assets/fonts/`), already included.
   Never reference any other font source.
4. **Jalali dates everywhere** a date is visible in the front-end
   (changelog, blog posts, copyright). Format: `۱۴۰۵/۰۶/۱۲` or
   `12 شهریور 1405`. Never Gregorian-only.
5. **NO personal links or contact info anywhere** — no GitHub links, no
   Telegram, no email, no portfolio links in HTML, CSS, JS, README of the
   product itself, or help docs. This is an automatic rejection rule.
6. **NO AI-generated images.** Marketplace bans AI imagery. All visuals =
   inline SVG / CSS shapes / CSS phone mockups. Do not add <img> from the
   web. (Real app screenshots are the buyer's job — leave placeholder
   slots documented in README.)
7. **Latin digits inside Persian text** must be wrapped in
   `<bdi class="en">…</bdi>` (existing pattern — follow it).
8. **Keep files editable by hand.** No build step, no npm, no minification.
   The buyer edits these files directly.
9. **Accessibility:** keyboard navigable menu/accordion, `aria-label`s on
   icon-only controls, `prefers-reduced-motion` respected (pattern exists
   in main.js — keep it working).
10. **Responsive:** mobile-first; the phone mockup and stats grid must not
    break between 320px and 1920px. Test mentally at 360 / 768 / 1200.

## 3. File map

```
landixa/
├── index.html            ← main RTL page (Persian)
├── assets/
│   ├── css/style.css     ← ALL styles; design tokens in :root at top
│   ├── js/main.js        ← nav toggle, slider, accordion, reveal-on-scroll
│   └── fonts/            ← Vazirmatn Regular/Medium/Bold (woff2, local)
├── ltr/                  ← English LTR twin (same structure)  [phase 2]
├── blog/index.html       ← blog list page                        [phase 2]
├── blog/post.html        ← blog single post page                 [phase 2]
├── docs/
│   ├── AGENT_INSTRUCTIONS.md ← this file
│   ├── ROADMAP.md        ← what to build, phase by phase
│   └── DESIGN_SYSTEM.md  ← colors, type scale, components
└── README.md             ← product README (buyer-facing, Persian)
```

## 4. Design system (do not drift)

- Tokens live in `:root` of style.css. Change values there, never hardcode
  colors elsewhere.
- Current palette (dark): bg `#0B0F17`, card `#131A26`, accent `#22D3EE`,
  accent-2 `#8B5CF6`, text via CSS vars.
- Font scale, spacing, radii: follow existing values in style.css.
- Brand name in demo content: **لندیکسا** / demo app name: **«کیف من»**
  (a fictional finance app). Keep demo copy realistic Persian marketing
  copy — no lorem ipsum.

## 5. Workflow for AI agents (Arena / Freebuff / any coding agent)

1. Work on a branch: `git checkout -b feat/<topic>` (never commit to main).
2. Small commits, conventional style: `feat: add pricing section`,
   `fix: mobile nav z-index`.
3. **Do NOT merge. Do NOT push to main.** The owner reviews and merges.
4. After finishing a task: run a quick self-check — open the page and
   verify: no console errors, menu works, accordion works, no horizontal
   scrollbar at 360px width, all links resolve to existing anchors/files.
5. Commit message must state which ROADMAP item you completed.
6. If a rule in section 2 conflicts with a task, the rule wins — note the
   conflict in the commit message instead of breaking the rule.

## 6. Definition of done (per phase)

- Page opens from `file://` with zero network requests (check devtools).
- No console errors or 404s.
- Persian text is natural marketing copy, not machine-translated tone.
- Jalali dates wherever a date appears.
- No personal links (grep yourself for `github.com`, `t.me`, `@`, `mailto:`
  outside of allowed placeholders).
- Works at 360px without horizontal scroll.

## 7. Out of scope (do NOT add)

- WordPress/PHP anything — this is a pure HTML template.
- Dark/light theme switcher (the variants ARE the themes).
- Backend, forms with server code, newsletter, comments.
- Any dependency, framework, or package manager.
- New pages beyond the roadmap without owner approval.
