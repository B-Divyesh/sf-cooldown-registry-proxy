# Handoff — polish round 3

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-3`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

Implementation commit: `622d892`

Deployment: `7e2fac8f-8709-44e4-bd8f-53934365eede`

## Delivered

- Added a compact, live decision strip so the one-click browser demo shows its
  cooldown, allowed, and advisory outcomes inside the first mobile and desktop
  viewport.
- Kept the quarantine-contour visual identity while fitting all three hero
  privacy/offline/price facts inside 390×844 and 1440×900 first screens.
- Expanded production refusal evidence to npm, PyPI, and Cargo metadata and
  direct-download paths for cooldown and advisory decisions. Each of 12
  blocked-version events is matched to its response request ID and one JSONL row.
- Added a Linux test guard that records file opens, DNS, and sockets. The CLI
  demo test denies current-directory access and non-loopback traffic. The
  production outbound test permits only the configured private fixture and
  includes the remote advisory route.
- Instrumented browser Storage API calls. Demo entry, change, reset, and exit
  read or mutate only `demo:cooldown-registry-proxy:policy` while preserving a
  real-data sentinel.
- Added claim tests for terminal-recording parity and package names in refusal
  records. Removed the unproved public credential-ownership statement.
- Added `X-Request-Id` to proxy responses so production audit rows can be tied
  to metadata and direct-download requests.
- Updated `.factory/claims.json`, `.factory/demo.md`, `.factory/design.md`, the
  copy audit, and the verb-first catalog description.

Every review-1, review-2, and review-3 finding is mapped in
`.factory/polish-3.md`. No finding or TODO remains.

## Verification

Fresh clone: `/tmp/cooldown-polish3-clean.62GsPO`.

- Every one of the 24 `.factory/claims.json` commands passed separately and
  selected exactly one tagged test.
- `npm test`: passed 7 Rust tests and 33 Node tests in the final clean clone.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `npm run build`: passed and wrote `dist/bin/cooldown-registry-proxy` plus
  `dist/site/`.
- `npm run test:browser -- --reporter=line`: 14/14 passed, including four route
  axe scans, keyboard/focus, routing/404, mobile/desktop bounds, demo isolation,
  same-origin privacy, and offline reload.
- `cargo package --allow-dirty`: packaged and verified the crate.
- Static budgets: JS 5.86 kB raw / 2.55 kB gzip; CSS 17.71 kB raw / 4.49 kB
  gzip; hero WebP 141,096 bytes.

Cold live verification after deployment:

- `verify-url.sh`: 856 ms load, no console errors, one h1, `lang=en`, one main,
  no missing alt text, and no unnamed buttons.
- Live Playwright: 14/14 passed. Axe reported zero serious or critical issues
  on Home, Demo, Privacy, Terms, and the product 404.
- Home facts ended at 675px on 390×844 and at most 854px on 1440×900.
- Demo decisions ended at most 390px on 390×844 and 480px on 1440×900.
- `/`, `/?demo=1`, `/demo`, `/demo/`, `/privacy`, `/privacy/`, `/terms`,
  `/terms/`, `robots.txt`, `sitemap.xml`, and social/touch assets returned 200.
  `/not-a-real-route` returned 404. The GitHub destination returned 200.
- CSP, HSTS, frame denial, nosniff, Referrer-Policy, and Permissions-Policy
  headers were present.
- Local/live SHA-256 matched for home HTML and generated JS.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.5 s, CLS 0, TBT 40 ms, Speed Index 1.3 s.

Evidence is under `.factory/evidence/polish-3/`, including responsive screenshots,
the live smoke report, and the Lighthouse JSON report.

## Run and verify

```sh
npm ci
npm test
npm run test:claims
npm run test:browser
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
```

Run the isolated CLI sample with:

```sh
./dist/bin/cooldown-registry-proxy demo
```

Deploy the static artifact from `dist/site/` through the factory work order.

## Known gaps and next steps

None for the reviewed product contract. Registry operators still own TLS,
network access, cache protection, and log retention as documented.
