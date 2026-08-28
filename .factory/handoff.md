# Handoff — adversarial review 5

Date: 2026-08-28

Work order: `cooldown-registry-proxy-review-5`

## Delivered

- Performed an independent no-product-code-change review and wrote
  `.factory/review-5.md`.
- Rechecked the deployed product cold at 390 × 844 and 1440 × 900. The job,
  audience, sample action, action outcome, and privacy/offline/price facts are
  visible before scrolling.
- Rechecked browser and CLI demo isolation, reset/exit, live same-origin
  traffic, offline reload, routes, metadata, 404, links, focus/back,
  accessibility coverage, every claim, prior findings, and visual identity.

## Verification

- New clone: `/tmp/cooldown-review5-clone.wTNP2l` at
  `ea21b8878d89d68a0a6d63aa6cc24930dbf6fbe9`.
- `npm ci` completed; all 24 `.factory/claims.json` commands passed separately.
- `npm test`, `npm run build`, and `npm run test:browser` passed. The browser
  suite passed 15/15, including axe, demo, offline, metadata, routing, and
  interaction checks.
- A live intercepted Home → Demo → reset → exit flow used only same-origin
  requests. Demo exit cleared browser storage; `/demo/` reloaded offline after
  service-worker control.
- A CLI demo from a new temporary invocation directory produced its own
  temporary workspace with npm 404, PyPI 200, Cargo 451, four refusal records,
  and five cache files.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:browser
cargo run --release -- demo
```

Open `https://cooldown-registry-proxy.sociobot.in/?demo=1` for the browser
sample.

## Known gaps and next steps

No open review findings. Preserve the clean-clone claim matrix and cold-live
checks whenever public copy, policy behavior, build output, or demo isolation
changes.

---

# Previous handoff — polish round 4

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-4`

Repair commit: `d3dee84be15d61c04d3d925dcddef58151282971`

Deployment: `7f8115d3-0b1e-4320-9f88-74dd8b83e5a9`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

## Delivered

- Unified the Home, Demo, Privacy, Terms, and 404 headers around the same
  contour mark, wordmark, accessible home label, and navigation destinations.
- Renamed every source action to “View source on GitHub.”
- Repaired the setup link to target the real `#run-the-proxy` README heading.
- Added static and rendered-route regression tests for exact header parity and
  an anchor-aware README fragment test.
- Rechecked the verb-first first screen, isolated `?demo=1` path, persistent
  banner/reset/exit, all 24 claims, route metadata, focus/history, legal links,
  product 404, mobile bounds, privacy, offline use, and package behavior.
- Updated `.factory/catalog-description.txt`, `.factory/copy-audit.md`, and
  the cumulative finding ledger in `.factory/polish-4.md`.

The topographic quarantine visual system, Rust single-binary artifact, and
static documentation deployment remain unchanged.

## Exact verification evidence

- Clean clone: `/tmp/cooldown-polish4-claims.eYHVcJ` at `d3dee84`.
- Claim contract: all 24 commands from `.factory/claims.json` passed
  separately, including four browser claims.
- Aggregate: `cargo fmt --check`, strict `cargo clippy`, `npm test` (7 Rust +
  35 Node), `npm run build`, `npm run test:browser` (15/15), and
  `cargo package --allow-dirty` passed.
- Browser/accessibility: cold local and live suites passed. Axe reported zero
  serious or critical issues on Home, Demo, Privacy, Terms, and 404.
- Demo/privacy/offline: storage instrumentation touched only
  `demo:cooldown-registry-proxy:policy`; traffic stayed same-origin; the Demo
  route reloaded offline after service-worker control.
- Live routes: `/`, `/?demo=1`, `/demo`, `/demo/`, `/privacy`, `/privacy/`,
  `/terms`, `/terms/`, robots, sitemap, and social/touch assets returned 200.
  `/not-a-real-route` returned the designed HTTP 404.
- Live finding checks: Privacy/Terms/404 contain the contour SVG and the exact
  source action; Home contains `#run-the-proxy`; the pushed README contains
  `## Run the proxy`; all GitHub destinations returned 200.
- Smoke test: 820 ms, no console errors, `lang=en`, one h1, one main, complete
  alt text, and named buttons. Evidence is under
  `.factory/evidence/polish-4/live-home/`.
- Build parity: local and live Home SHA-256 both equal
  `1589622c85acabebfc4d224cecaef1e6143e2b8db23811baeac373c31423249c`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.502 s, CLS 0, TBT 8 ms, Speed Index 0.814 s. Report:
  `.factory/evidence/polish-4/lighthouse/report.json`.
- Budgets: JS 5,864 bytes raw / 2.55 kB gzip; CSS 17,713 bytes raw /
  4.49 kB gzip; hero WebP 141,096 bytes.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:browser
cargo clippy --all-targets --all-features -- -D warnings
cargo package --allow-dirty
```

Run the isolated CLI sample with `cargo run --release -- demo`. Open
`http://localhost:4173/?demo=1` after serving `dist/site` for the browser sample.

## Known gaps and next steps

None. Every finding in reviews 1–4 is closed and rechecked on the live custom
domain. Publishing the CLI package remains outside this repair work order.
