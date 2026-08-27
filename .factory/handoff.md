# Handoff — cooldown-registry-proxy v0.1.0

## Delivery-blocker repair — ready to deploy

Repaired from verifier base `b335860476561a046aa7a307b96c782c12c19daa`.
The Rust CLI/proxy source and release packaging surface were deliberately not
changed.

- `site/public/staticwebapp.config.json` is copied by Vite to the actual
  `dist/site/` deploy root. It gives `/assets/*` a one-year immutable cache
  policy and keeps pages and `sw.js` revalidating. Its global headers provide
  a self-only CSP (with `frame-ancestors 'none'`), `X-Frame-Options: DENY`,
  a restrictive Permissions-Policy, HSTS, Referrer-Policy, and `nosniff`.
- The worker is generated only after Vite has emitted its final manifest, so
  its precache contains the real hashed JS/CSS filenames rather than guessed
  names. The `cooldown-shell-<sha>` cache revision hashes that shell and the
  local shell assets, and old cooldown caches are removed on activation.
- An updated worker waits. The controlled page exposes an accessible “Update
  now” notice; its button sends `COOLDOWN_ACTIVATE_UPDATE`, after which the
  worker calls `skipWaiting`, claims clients, and the page reloads on
  `controllerchange`. This avoids both automatic mid-session takeover and a
  client silently remaining on the obsolete worker.

### Repair verification

Executed successfully in this repair workspace:

```sh
npm ci
cargo test
cargo clippy --all-targets -- -D warnings
npm test
npm run build
cargo package --allow-dirty
```

`npm test` now includes six site tests, including static-host header policy,
shell JS/CSS precaching, versioned worker rendering, and explicit update
activation. A production-output assertion verified every precache path exists
in `dist/site`, including the final hashed JS and CSS files.

Chromium/Playwright exercised the built site through a local static host:
one `<h1>`/`main`/`lang=en`, no page or console errors, zero axe violations,
an offline reload after worker control, and a simulated new worker. The
simulated worker displayed the update notice and activated only after the
button click. The factory `verify-url.sh` also passed against the current
live URL (title/lang/main/alt/console checks). The standalone axe CLI could
not use its bundled ChromeDriver with the available Chromium, so axe was run
through the equivalent Playwright injection instead.

The live URL is still the pre-deploy artifact at handoff time: its header
check correctly still reports `max-age=30` and lacks the new CSP/frame and
Permissions-Policy headers. After deployment, re-run:

```sh
curl -sSI https://cooldown-registry-proxy.sociobot.in/
curl -sSI https://cooldown-registry-proxy.sociobot.in/assets/<hashed-file>.js
```

The first response must include the configured CSP, frame protection,
Permissions-Policy, and HSTS; the second must include
`Cache-Control: public, max-age=31536000, immutable`.

## Independent verification status — FAIL

Verified 2026-08-27 against commit
`93b88fa9790959d012bdcc555e820692a9265fe1` and
<https://cooldown-registry-proxy.sociobot.in>. The CLI/product paths, real
package-manager smoke tests, build, package verification, browser checks, and
live-to-build artifact hashes passed. **Do not release as verified**: the live
host gives hashed static assets only `max-age=30` rather than immutable
caching, and omits CSP/frame/Permissions-Policy browser hardening. The worker
also does not precache its JS/CSS shell or use a per-build cache version.
Exact evidence, test commands, and severity-ranked defects are in
[`verification.md`](verification.md).

Date: 2026-08-27

Work order: `cooldown-registry-proxy-build-1`

Deploy type: static site from `dist/site`

## What shipped

- A Rust 2021 `cooldown-registry-proxy` executable with `serve` and `validate` commands, useful `--help`, non-zero configuration failures, and JSON output for automation.
- npm packument filtering and proxy-owned tarball URLs; PyPI simple-index generation and file proxying; Cargo sparse-index filtering and crate downloads.
- Publish-time cooldown checks on both discovery and direct artifact requests. Cooldown blocks return 404, advisory blocks return 451, and each response includes a clear JSON reason/request ID.
- Version-specific exclusions with reasons and UTC expiry. Hard advisory blocks always win. Local policy files are re-read for each decision, invalid live policy fails closed, and remote normalized advisory feeds refresh on an interval with a persistent stale-cache fallback.
- Persistent SHA-256-addressed metadata/artifact cache, immutable artifact caching, stale metadata fallback, explicit offline mode, `/healthz`, `/readyz`, and append-only JSONL refusal auditing.
- Rootless container recipe, Compose deployment, policy examples, and client configuration for npm/pnpm/Bun, pip/uv, and Cargo.
- A static, responsive topographic-cartography product site with a local policy simulator, package-manager configuration switcher, copy feedback, offline simulation, privacy and terms pages, service-worker shell cache, and no analytics/CDNs.
- Optional $49 one-time Operator Pack license flow: Sociobot checkout, query-token capture and URL cleanup, local storage, optimistic cached unlock, once-daily verification, invalid/revoked state, restore-by-paste, and a concrete production runbook download. No safety behavior is paid-gated.
- Original generated topographic hero at `site/public/topographic-quarantine.webp` (141 KB). Full prompt, deployment, date, rationale, and licensing provenance are in `.factory/design.md` and `.factory/assets/topographic-quarantine.provenance.json`.

## Build and verification

Exact clean-clone build command:

```sh
npm ci && npm run build
```

Outputs:

- `dist/site/index.html` — static deploy root
- `dist/bin/cooldown-registry-proxy` — optimized Linux binary (4.1 MB in this environment)

Executed successfully:

```sh
npm test
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
```

Results: 6 Rust tests, including a local mock-registry metadata/direct-download integration test; 3 browser-policy unit tests; no failures. `cargo package` produced and verified the 0.1.0 crate package (196.6 KB compressed).

Real-client smoke tests against the running proxy also passed:

- `npm install is-number@7.0.0` installed through `/npm/` and fetched its rewritten tarball from the proxy cache.
- `pip download requests==2.31.0` resolved the generated simple index and fetched the wheel through `/pypi-files/`.
- `cargo fetch` for `itoa` used a source replacement at `/cargo/`, consumed the filtered sparse index, followed the crates.io download pointer internally, and verified the crate checksum.

Browser verification used production output at 390 px and desktop widths. The home, privacy, and terms routes each had zero axe violations and zero console/page errors. Keyboard tests covered the cooldown slider, offline toggle, ecosystem selector, and license-return flow.

Lighthouse 12.8.2 mobile production results:

| Category/metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.0 s |
| Largest Contentful Paint | 1.7 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |

Static budgets: initial JS 5.3 KB (2.5 KB gzip), CSS 13.5 KB (3.8 KB gzip), no webfonts, and hero WebP 141 KB.

## Operational notes and honest boundaries

- The proxy intentionally has no auth/users, private package hosting, Maven, Go modules, Composer, or code scanning. Put it behind an authenticated/private TLS ingress and enforce registry egress at the network layer. Composer remains the planned next ecosystem.
- Remote advisory URLs consume the documented normalized `{ "blocked": [...] }` format. Organizations should export their chosen OSV/GitHub Advisory malware sources into that small feed; native database cloning/normalization is not embedded in v0.1.
- `--public-url` should be set in production. Without it, links are derived from the request `Host` and plain HTTP.
- Docker Compose syntax is provided but a Docker daemon was unavailable in the worker container, so image construction was not executed. The native release build and all protocol clients were exercised.
- The factory must register the paid product/return URL. The checkout and verification code intentionally uses the slug, not a hard-coded provider product ID.

## Recommended next steps

1. Publish signed binaries for Linux/macOS/Windows and attach checksums/SBOMs to the GitHub release.
2. Add a maintained first-party normalizer for OSV/GitHub Advisory Database malware records and sign feed snapshots.
3. Add bounded worker concurrency and Prometheus-format operational metrics before high-volume use.
4. Add Composer metadata/artifact support without widening v0.1’s private-package boundary.
