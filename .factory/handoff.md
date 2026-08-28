# Handoff — perfection-loop round 1

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-1-all-findings`

Reviewed candidate: `cb2f368dd11369fdb9fc99f22db046f67c252eb6`

Adversarial report: `a583a174cfcb1a22d12d3f986733d7a8017b9d89`

Implementation commits: `99143b3`, `c34344e`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

## Delivered

- Reworked the 390×844 first screen around the operator’s job. It names
  platform/security teams, makes the sample primary, explains its result, and
  shows privacy, offline, and price facts without scrolling.
- Rebuilt the browser sample around `?demo=1` and `/demo`. It has a persistent
  banner, reset, start-real exit, a separate `demo:` key, real-data preservation,
  exit disposal, an offline shell, and three exact sample decisions.
- Rebuilt `cooldown-registry-proxy demo` as a genuine isolated exercise. The
  binary embeds its fixtures, creates a new temporary workspace, starts a
  private mock registry, runs the production npm/PyPI/Cargo request handlers,
  and writes cache files, four refusal rows, and `report.json`.
- Expanded `.factory/claims.json` to 20 claims. Every entry has exactly one
  tagged, individually filtered test. Public copy was reduced or split until
  every retained product statement had observable evidence.
- Added real direct routes, a designed HTTP 404, full per-route metadata,
  shared navigation/footer, route announcements, heading focus, Back scroll
  restoration, legal links, internal link crawling, and hardened same-origin
  CSP.
- Removed the broken, unprovisioned paid checkout and stale Operator Pack.
  The release is explicitly MIT-only; no unavailable purchase is advertised.
- Preserved the single-mode topographic quarantine visual identity and its
  original art. Mobile layout, sticky demo controls, switch hit target, focus
  states, and terminal evidence were polished without adopting a generic
  product template.
- Updated the catalog line, copy audit, demo contract, review finding map, and
  live screenshots.

## Verification

Clean clone: `/tmp/cooldown-polish-clean.XVRljr` at `c34344e`.

```sh
npm ci
# Each command from .factory/claims.json, executed separately
npm test
npm run build
npm run test:browser -- --reporter=list
cargo package --allow-dirty
```

Results:

- Claims: PASS — all 20 manifest commands. Each command ran exactly one tagged
  test; the manifest/source cross-check also passed.
- `npm test`: PASS — 7 Rust tests and 27 Node site/content/claim tests.
- Browser: PASS — 13 Playwright tests at desktop and 390×844. Four route axe
  scans plus the designed 404 had zero serious or critical violations.
- Privacy: PASS — the complete landing-to-demo flow made same-origin requests
  only; live CSP is `connect-src 'self'`.
- Offline: PASS — `/demo/` retained all three decisions after service-worker
  control, network disablement, and reload.
- Build: PASS — `dist/bin/cooldown-registry-proxy` and `dist/site/` produced.
  Initial JS is 5.58 kB raw / 2.49 kB gzip. CSS is 16.38 kB raw / 4.27 kB
  gzip. Hero artwork is 141.10 kB.
- Package: PASS — `cooldown-registry-proxy v0.1.0` packaged and verified.
- Copy: PASS — seven-word verb-first headline, no banned words, no sentence
  above 22 words, and a 75-character verb-first catalog description.

## Deployment and cold live audit

Deployment used the work-order command and unchanged static artifact class:

```sh
/opt/fleet/lib/deploy-static.sh cooldown-registry-proxy dist/site
```

Azure Static Web Apps deployment
`cb29e7ce-91d1-4192-9d55-5cd58b96cd15` succeeded. The custom domain returned
HTTPS 200.

Cold live checks after deployment:

- `verify-url.sh`: 815 ms load; no console errors; title, `lang=en`, main,
  single h1, alt text, and button names passed.
- Playwright against the live domain: 13/13 passed, including `?demo=1`, reset,
  real-data sentinel preservation, exit cleanup, offline reload, exact sample
  values, focus/Back, links, metadata, mobile layout, axe, and 404 behavior.
- Route probe: home/query/demo/privacy/terms variants returned 200. The unknown
  route returned the product 404 with HTTP 404. Social/touch/robots/sitemap
  assets returned 200.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms, Speed Index 0.9 s.
- Evidence: `.factory/evidence/polish-1/`; full finding map:
  `.factory/polish-1.md`.

## Known gaps

None. The paid offer is intentionally absent because no working Sociobot
billing product is provisioned. Reintroducing a paid tier would be a new scoped
release requiring a live checkout and its own sandbox claim tests.
