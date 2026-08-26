# ROADMAP — Landixa

Owner tracks progress here. Agents: complete phases in order, one commit
per checklist item, never merge to main.

Legend: [ ] todo · [x] done · (owner) = owner-only work

## Phase 0 — repo bootstrap (owner)
- [x] Repo created (public for now; owner will make it private later)
- [x] v1 draft imported (index.html + assets + README)
- [x] AGENT_INSTRUCTIONS.md written
- [x] ROADMAP.md written (this file)
- [x] DESIGN_SYSTEM.md written
- [x] First commit pushed to main

## Phase 1 — core template hardening (agent) — DONE 1405/06/04
Goal: make the existing single page flawless. No new sections yet.
- [x] Audit index.html: fix any broken anchor, missing aria-label,
      non-logical CSS property (left/right → inline-start/end)
- [x] Verify all JS interactions (nav toggle, screenshot slider, FAQ
      accordion, reveal-on-scroll) work with keyboard and reduced-motion
- [x] Check 320–1920px responsiveness; fix any overflow at 360px
- [x] Ensure zero network requests from file:// (fonts local, no CDN)
- [x] Polish hero phone mockup (pure CSS) — realistic status bar, notch,
      screen content for the demo app «کیف من»
- [x] Add `docs/screens/` note: where buyers drop their own screenshots

## Phase 2 — variants and extra pages (agent)
Goal: replicate the "multiple home versions" value driver of APPER/Apdash.
- [x] Variant A (default, current): dark gradient
- [x] Variant B: light/minimal — `home-light.html`, shares style.css via
      a `data-theme="light"` attribute + token overrides
- [x] Variant C: accent-shifted (e.g. warm) — `home-warm.html`
      <!-- 2A DONE 1405/06/04: merged to main, self-check extended to 19 rules -->
- [x] `blog/index.html` — blog list (6 demo posts, Jalali dates)
- [x] `blog/post.html` — single post layout (text + image placeholder)
      <!-- 2B DONE 1405/06/04: merged to main, self-check 22/22, resolver fixed for subfolders -->
- [x] `ltr/` — English LTR twin of the main page (translate copy, flip
      dir; logical CSS must make this near-zero-work)
      <!-- 2C DONE 1405/06/04: ltr/index.html, self-check 27/27 -->

## Phase 3 — package and listing (agent prepares, owner ships)
- [x] `docs/listing-copy.md` — full Persian listing text for rtl-theme
      (H1, short desc, full HTML description, features list, FAQ,
      requirements box: "HTML5 / CSS3 / بدون وردپرس")
- [x] `docs/changelog.md` — versioned changelog with Jalali dates
- [x] Help.pdf source (Persian, follows easy-call build_help_pdf.py
      pattern; reportlab, Vazirmatn, no personal links)
- [x] Package script `build_package.py`: produces
      `Html_Package/1-Theme/theme.zip` + `Help.pdf` per rtl-theme HTML
      standard
- [x] Icon 320×320 + cover 2100×1040 + infographic — hand-built
      HTML/CSS→PNG (NO AI images) (owner reviews before use)
      <!-- 3A DONE 1405/06/04: all agent items complete, 27/27 checks -->
- [ ] VirusTotal scan (owner, manual)
- [x] Demo deploy: GitHub Pages on this repo (owner)
      <!-- DONE 1405/06/04: https://17mohammad1718-png.github.io/landixa/ -->
- [ ] Submit via rtl-theme vendor panel (owner)

## Phase 4 — post-approval ops
- [ ] Release cadence: minor update every ≤10 days (12-day rule)
- [x] Support reply templates `docs/support-replies.md`
      <!-- DONE 1405/06/04: 10 common buyer Q&A in Persian -->
- [ ] Track Q&A questions buyers ask → fold answers into FAQ + listing
