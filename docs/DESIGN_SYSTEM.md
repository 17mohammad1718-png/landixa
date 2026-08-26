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

## 2. Color tokens (dark default)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0B0F17` | page background |
| `--bg-soft` | `#0F1522` | alt section background |
| `--card` | `#131A26` | cards, mockup frame |
| `--card-2` | `#182234` | nested surfaces |
| `--border` | rgba(255,255,255,.08) | hairlines |
| `--accent` | `#22D3EE` | primary CTA, links, highlights |
| `--accent-2` | `#8B5CF6` | gradient end, secondary |
| `--text` | `#E6EAF2` | body text |
| `--muted` | `#93A0B5` | secondary text |
| `--success` | `#34D399` | checkmarks, positive stats |
| `--warn` | `#FBBF24` | badges |

Gradient: `linear-gradient(135deg, var(--accent), var(--accent-2))`.

**Variant themes (phase 2)** must be implemented as token overrides on
`html[data-theme="light"]` / `html[data-theme="warm"]` — same structure,
different token values. No duplicate CSS blocks per variant.

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
