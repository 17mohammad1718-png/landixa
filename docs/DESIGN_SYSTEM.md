# DESIGN SYSTEM — Landixa

Single source of truth for visual language. All values live as CSS custom
properties in `:root` (top of `assets/css/style.css`). Agents never
hardcode these values outside `:root`.

## 1. Brand

- **Product name:** لندیکسا (Latin: Landixa) — the template brand shown in
  header/logo.
- **Demo app:** «کیف من» — fictional Persian personal-finance app used in
  all demo copy (hero, screenshots, reviews). Buyers replace it.
- Logo mark: rounded square (rx 9) with cyan→violet gradient + "L" path.
  Inline SVG only.

## 2. Color tokens (default = Variant A, dark)

Every color in the template lives in exactly one of the three token blocks
below (`:root` + two variant blocks) at the top of `style.css`. Component
rules reference `var(--…)` only — hardcoding a color anywhere else is a
self-check failure. **The CSS is canonical**: if this doc and the CSS
disagree, fix the doc.

### Surfaces & text

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0B0F17` | page background |
| `--bg-soft` | `#0F1522` | alt section background |
| `--card` | `#131A26` | cards, mockup frame |
| `--card-2` | `#182234` | nested surfaces |
| `--border` | `#232E44` | hairlines |
| `--hover-border` | `#3A4869` | card border on hover |
| `--line` | `#24304A` | dividers |
| `--text` | `#E8EDF6` | body text |
| `--muted` | `#93A0B8` | secondary text |

### Accent family (buyers edit the first four)

Derived tokens use `color-mix(in srgb, var(--x) N%, transparent)`
(Chrome 111+ / Firefox 113+ / Safari 16.2+ — inside the supported
browser window). Change `--accent`/`--accent-2`/`--on-accent` and every
tint, glow, shadow and gradient re-tunes automatically — that is what
makes the README's "change 4 values" promise true.

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#22D3EE` | primary CTA, links, highlights |
| `--accent-2` | `#8B5CF6` | gradient end, secondary |
| `--accent-2-bright` | `#A78BFA` | accent-2 where it must read brighter |
| `--on-accent` | `#07121A` | text/icons on accent fills |
| `--grad` | `linear-gradient(135deg, var(--accent), var(--accent-2))` | primary fills |
| `--accent-soft` | accent 12% over transparent | soft chips/badges |
| `--accent-2-soft` | accent-2 12% over transparent | soft secondary chips |
| `--accent-border` | accent 35% | accent outline |
| `--accent-border-soft` | accent 25% | subtle accent outline |
| `--accent-2-border-soft` | accent-2 25% | subtle secondary outline |
| `--glow-accent` | accent 16% | glow shadows |
| `--glow-accent-2` | accent-2 14% | glow shadows |
| `--app-grad` | accent 14% → accent-2 14% | in-app screen wash |
| `--shadow-accent` | accent 45% | colored drop shadows |
| `--shadow-accent-2` | accent-2 55% | colored drop shadows |
| `--shadow-accent-strong` | accent 55% | strong colored shadows |

### Semantic & chrome

| Token | Value | Usage |
|---|---|---|
| `--success` | `#34D399` | checkmarks, positive stats |
| `--success-soft` | success 15% over transparent | positive surfaces |
| `--warn` | `#FBBF24` | badges |
| `--header-bg` | rgba(11,15,23,.82) | sticky header (blurred) |
| `--overlay` | rgba(5,8,14,.86) | lightbox overlay |
| `--scroll` | `#2A3650` | scrollbar thumb |
| `--scroll-hover` | `#3A4869` | scrollbar thumb hover |

### Device hardware & in-app data (phone mockup)

| Token | Value | Usage |
|---|---|---|
| `--device` | `#1B2434` | phone body |
| `--device-border` | `#303D5C` | phone edge |
| `--device-notch` | `#05070C` | notch |
| `--device-cam` | `#0B1220` | camera lens |
| `--device-cam-ring` | `#1B2740` | camera ring |
| `--device-cam-glow` | rgba(90,130,255,.55) | camera glint |
| `--nav-idle` | `#5A6B8C` | in-app nav icons (inactive) |
| `--data-3` | `#F59E0B` | third data-series color |
| `--data-idle` | `#33415E` | inactive bars/segments |

Device hardware tokens stay dark in **every** theme on purpose: the phone
is a physical object sitting on any page background.

### Variant themes (Phase 2A — shipped)

Pure token overrides on `html[data-theme="…"]` in `style.css` — same
structure and component CSS, no duplication. Each page carries its
variant in a single attribute on `<html>`:

| Variant | File | `data-theme` | Palette |
|---|---|---|---|
| A — dark gradient (default) | `index.html` | — (none) | cyan `#22D3EE` / violet `#8B5CF6` on `#0B0F17` |
| B — light/minimal | `home-light.html` | `light` | teal `#0E7490` / violet `#6D28D9` on `#F4F6FB`, dark text `#17202E` |
| C — warm accent shift | `home-warm.html` | `warm` | orange `#FB923C` / rose `#F43F5E` on the dark base |

Rules when touching variants:

- Override **core tokens only** (surfaces, text, accents, semantic,
  chrome). Derived tints/glows/shadows/gradient are inherited from `:root`
  and recompute from the variant's own `--accent`/`--accent-2`.
- `--accent-2-bright` is overridden per theme (its value is not a
  simple color-mix of `--accent-2`).
- Adding a variant = new `<html data-theme="x">` page + one new
  token-override block. Never a second stylesheet, never per-variant
  component CSS.

## 3. Typography

- Font: **Vazirmatn** — local `@font-face` from `assets/fonts/`
  (Regular 400, Medium 500, Bold 700). No other family anywhere.
- Scale (desktop → mobile): h1 `clamp(2rem, 4.5vw, 3.25rem)`,
  h2 `clamp(1.5rem, 3vw, 2.1rem)`, lead `1.125rem`, body `1rem`,
  small `.875rem`.
- Line-height: 1.7 body, 1.3 headings.
- Latin digits/numbers inside Persian text: `<bdi class="en">` (monospace
  stack: ui-monospace, "Cascadia Mono", Consolas).

## 4. Layout

- Container: max-width `1160px`, padding-inline `20px` (16px < 480px).
- Section vertical rhythm: `clamp(64px, 10vw, 110px)`.
- Radii: card `18px`, button `12px`, mockup `36px`.
- Grid: hero 2 cols (copy 1.1fr / mockup .9fr), collapses < 900px;
  features 3 cols → 2 (< 900px) → 1 (< 560px); stats 4 → 2.

## 5. Components (existing patterns to reuse)

- `.btn`, `.btn-primary` (gradient, glow shadow), `.btn-store` (store
  buttons with inline SVG logos: کافه‌بازار، مایکت، دانلود مستقیم)
- `.section-head` (kicker + h2 + lead, centered)
- `.feature-card` (icon chip + title + text)
- `.shot` (screenshot frame with CSS phone chrome + placeholder screen)
- `.review-card` (stars, quote, avatar initials, name+city)
- `.price-card` (plan name, price, feature list, CTA)
- `.faq-item` (button + panel accordion)
- `.reveal` (scroll-in animation; disabled under reduced-motion)

## 6. Motion

- Reveal on scroll: opacity + translateY(16px), 500ms ease-out,
  IntersectionObserver, `threshold .15`.
- Hover lifts: `translateY(-3px)` + shadow, 200ms.
- `@media (prefers-reduced-motion: reduce)`: kill transforms/transitions.

## 7. Iconography

- Inline SVG, `stroke="currentColor"`, `stroke-width 1.8`, 24×24 viewBox.
- One style only (outline). No emoji in UI chrome.

## 8. Do / Don't

- ✅ logical properties (`margin-inline-start`, `inset-inline-end`)
- ✅ semantic landmarks (`header/main/section/footer`), one `h1`
- ✅ `aria-expanded` on accordion/menu buttons
- ❌ px font sizes (use rem/clamp), ❌ `!important` wars,
  ❌ fixed heights on text containers, ❌ external URLs of any kind
