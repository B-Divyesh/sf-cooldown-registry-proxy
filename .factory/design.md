# Visual thesis — The quarantine contour

## Direction and rationale

Cooldown is infrastructure that turns time into a boundary. The site therefore uses **topographic cartography**: package releases are plotted as survey points, concentric contour lines represent age, and a vermilion quarantine boundary makes the policy choke point visible. This is not outdoor nostalgia; it is an operational map for security engineers who need to see where software is allowed to cross.

The interface is intentionally single-mode and dark, like a field console used in a low-light operations room. The background is painted explicitly. Paper grain is restrained and decorative contour lines are always subordinate to documentation.

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| `--ink` | `#071814` | deep survey-map background |
| `--terrain` | `#0d241e` | raised panels and code blocks |
| `--terrain-2` | `#15332a` | borders and elevated controls |
| `--paper` | `#f3efdd` | primary text and contour paper |
| `--paper-muted` | `#b9c5b8` | secondary copy (7.9:1 on ink) |
| `--moss` | `#91c9a8` | safe/allowed state |
| `--signal` | `#ff6b4a` | quarantine boundary and action |
| `--signal-ink` | `#2b0904` | text on signal |
| `--amber` | `#f4c95d` | caution/pending age |
| `--danger` | `#ff8c7a` | hard block/error copy |

Text and control combinations meet WCAG AA. State labels pair color with words and symbols.

## Type

- Display and prose: `Aptos`, `Segoe UI`, system sans-serif. It stays clear at dense documentation sizes and avoids a network font request.
- Technical labels and code: `ui-monospace`, `SFMono-Regular`, `Cascadia Code`, monospace. Tabular numbers are enabled for ages and latency.
- Scale: 14 / 16 / 20 / 28 / clamp(42–72) px; body is never below 16 px. Measures cap at 72 characters.

No font files are shipped because the system stacks are the fastest privacy-preserving option and fit an operator tool.

## Spacing and shape

- 4 px base grid; primary rhythm: 8, 12, 16, 24, 32, 48, 72, 96.
- Content width: 1180 px. Reading width: 720 px.
- Corners are clipped or lightly rounded (2–10 px), evoking map plates rather than generic pill cards.
- Lines do semantic work: thin contour separators show grouping; a 3 px signal line denotes enforced boundaries.
- Controls are at least 44 px tall, with 8 px separation.

## Interaction grammar

- Primary actions are solid signal-orange; secondary actions use a terrain fill and paper outline.
- The interactive policy demo is a horizontal elevation profile. Changing cooldown redraws the safe/quarantine boundary and updates a textual result in an `aria-live` region.
- A compact three-column survey strip repeats the live sample outcomes above the detailed elevation profile, keeping the complete policy result visible on phone and desktop entry screens.
- Code examples are copyable from labeled buttons. Feedback changes the verb to “Copied” without shifting layout.
- Navigation collapses to the essential install and repository actions at 390 px; the map illustration stacks below the value proposition.

## Motion policy

- On first view, contour layers rise 8 px and fade over 240 ms in spatial order. Demo markers move only with `transform` over 200 ms.
- Nothing loops. No parallax or scroll-jacking.
- Under `prefers-reduced-motion: reduce`, all movement and smooth scrolling are removed; state changes remain immediate and visible.

## Original asset plan and provenance

- `site/public/topographic-quarantine.webp`: original generated editorial cartography for the hero. Prompt: “A wide, text-free topographic security map at night: layered forest-green contour terrain, one precise vermilion quarantine boundary/checkpoint separating fresh package markers from an established safe basin, cream survey ticks, restrained screen-print texture, orthographic editorial composition, no logos, no words, no UI screenshots, generous negative space, high contrast.” Generated with the factory `factory-image` deployment via `/opt/fleet/lib/gen-image.sh`, 2026-08-27. Optimized locally to WebP. Intended as explanatory product artwork; no third-party source material.
- `site/public/social-card.webp` and `site/public/apple-touch-icon.png`: local crops of the original hero artwork, made with ImageMagick on 2026-08-28 for the 1200×630 social preview and 180×180 touch icon. They introduce no external source material.
- Logo, route icons, contour rules, demo markers, and `site/public/demo-terminal.svg` are hand-authored CSS/SVG geometry in the repository, MIT with the product. The terminal still reproduces the bundled `demo` command's observable output and has a text caption.
