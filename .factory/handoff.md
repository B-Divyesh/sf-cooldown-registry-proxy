# Handoff — perfection-loop round 1 repair

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-1`

Base reviewed: `a583a174cfcb1a22d12d3f986733d7a8017b9d89`

Repair commit: `8174fddb91f6d172869f7db71f163419af646736` (amended below only to record this identifier)

## Delivered

- Rewrote the first screen in plain language for platform and security teams.
  It now has a one-click **Try it with sample data** action, an immediate
  outcome, and privacy/offline/price facts.
- Added `/demo/` and `?demo=1` entry. The sample has a persistent isolation
  banner, reset, start-real link, three seeded package decisions, a
  `demo:`-prefixed storage key, and no license or billing access.
- Added `cooldown-registry-proxy demo`. It creates a new temporary workspace,
  copies bundled policy fixtures, validates them with the binary, and prints
  the path. Fixtures live in `examples/demo/`.
- Added a self-hosted terminal-recording still, a text equivalent, and
  `.factory/demo.md`.
- Added `.factory/claims.json` with six tagged claim tests, including browser
  isolation and offline reload checks.
- Replaced the dead paid checkout with an honest free, MIT source path. The
  optional paid offer was removed because its checkout route was not provisioned.
- Added real Demo, legal, social metadata, touch icon, sitemap route, designed
  404 configuration, consistent navigation/footer, focus-on-load announcement,
  mobile stacking, and a three-step request path.
- Preserved the dark topographic cartography identity. Social/touch crops and
  the terminal SVG are recorded in `.factory/design.md`.

## Verification evidence

Run from this repair tree:

```sh
npm ci
npm test
npm run test:claims
npm run build
npx playwright test --reporter=list
cargo package --allow-dirty
```

Results on 2026-08-28:

- `npm test`: PASS — 6 Rust tests and 11 Node tests.
- Every command listed in `.factory/claims.json`: PASS. The browser claims run
  against the built static site; offline reload is verified after service-worker
  control.
- `npm run build`: PASS — `dist/bin/cooldown-registry-proxy` and `dist/site/`.
  Initial JavaScript is 5.29 kB raw / 2.40 kB gzip; CSS is 15.88 kB raw / 4.17
  kB gzip; hero artwork is below the 300 kB budget.
- `npx playwright test --reporter=list`: PASS — 8 tests. Axe reported zero
  serious or critical WCAG 2 A/AA violations on Home, Demo, Privacy, and Terms.
  The suite verifies title/lang/main/h1, visible mobile first action, route
  heading focus, demo reset/namespace/no-third-party requests, and offline demo
  reload.
- `cargo package --allow-dirty`: PASS — packaged and verified
  `cooldown-registry-proxy v0.1.0`.

## Deployment and release

The static deploy artifact is `dist/site/`. The work order retains the original
static deployment class. The factory owns deployment credentials and publishes
this directory. The Rust publish-ready check is `cargo package --allow-dirty`;
do not publish from this repository.

## Known gaps

None blocking. The product is intentionally free in this repair because the
reviewed paid checkout returned 404; a paid offer should only return after the
factory registers a working Sociobot product and adds its own sandbox claim
coverage.
