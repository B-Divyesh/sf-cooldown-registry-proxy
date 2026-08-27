# Independent verification 2 — PASS

Date: 2026-08-27  
Verifier work order: `cooldown-registry-proxy-verify-2`  
Candidate commit: `ba2b395f5ce9ce8d3547fbb351859d92aec3e16f`  
Live URL: <https://cooldown-registry-proxy.sociobot.in>

## Verdict

**PASS.** The candidate meets the researched v1 job: a single self-hosted
binary enforces an age policy for npm, PyPI, and Cargo at registry and direct
artifact paths, permits narrow expiring exclusions, gives advisory blocks
precedence, persists a cache and JSONL refusal trail, and documents the
network-level client configuration. The static documentation deployment is
the exact build of this candidate. The deployment-only failures in
[`verification.md`](verification.md) are remediated.

No product source was modified during this verification. This report and the
handoff are the only working-tree changes.

## Clean-checkout quality gates

The checkout started clean at the candidate SHA. `npm ci` completed with no
npm audit vulnerabilities. All available checks and the exact production
build passed:

```text
cargo test                                  6 passed; 0 failed
cargo clippy --all-targets -- -D warnings   passed
npm test                                    6 Rust + 6 site tests passed
npm run build                               passed; dist/site and dist/bin produced
cargo package --allow-dirty                 passed; package recompiled and verified
```

The release build emitted a 4.1 MB `dist/bin/cooldown-registry-proxy`.
`cargo package` produced and verified
`target/package/cooldown-registry-proxy-0.1.0.crate` (202.5 KiB compressed).
It was then installed from that clean packaged source into an independent
`/tmp/crp-consumer` root with `cargo install --path
target/package/cooldown-registry-proxy-0.1.0 --root /tmp/crp-consumer --force`.
Its `--help`, valid `validate --json`, and malformed
`serve --cooldown zero` paths worked; the malformed configuration exited 2.

## Proxy end-to-end evidence

An independent local mock upstream exposed old (2026-08-01) and fresh
(2026-08-27) versions and the installed consumer binary ran with a seven-day
policy. The following results were observed:

| Case | Result |
| --- | --- |
| npm metadata | old `1.0.0` exposed; fresh `2.0.0` removed; `latest` rewritten to `1.0.0` |
| npm direct tarballs | old 200 (`npm-old`); fresh 404 |
| PyPI simple index/files | old wheel linked/downloaded 200; fresh wheel omitted and direct request 404 |
| PyPI advisory block | `example-package==1.2.0` direct request 451; advisory wins over age |
| Cargo sparse index/crates | old record only; old crate 200 (`cargo-old`); fresh direct crate 404 |
| malformed method | `POST /healthz` returned 405 |
| audit log | 32 JSONL refusal events across discovery/direct paths |
| concurrency | 25 concurrent npm metadata requests all returned 200 |
| identity/readiness | `/healthz` and `/readyz` both returned 200 |
| restart/offline recovery | cached metadata returned 200 with `X-Cooldown-Cache: hit`; uncached metadata returned 503 `offline_cache_miss` |

Actual package-manager clients were also exercised against an independently
running candidate binary: `npm install --ignore-scripts is-number@7.0.0`,
`python3 -m pip download --no-deps requests==2.31.0`, and Cargo
source-replacement `cargo fetch` for `itoa` all completed via `/npm/`,
`/pypi/simple/`, and `/cargo/` respectively.

The brief's deliberate v1 boundaries remain accurate: no auth, private
package hosting, Maven, Go, Composer, or code scanning. Remote advisory URLs
consume the documented normalized advisory feed; operators must supply their
chosen OSV/GitHub Advisory export.

## Live deployment, browser, privacy, and security

The production build matched the live deployment byte-for-byte for the HTML,
hashed JavaScript/CSS, worker, legal pages, icon, hero image, and operator
pack. Representative SHA-256 values:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `72a3187aacf3ed5fb777109e9151a3a75957b3643357040b2f0264410e31aa7f` |
| `assets/main-Cvw5RglT.js` | `966f3b034875e6ff1f79093357303e99314df6f6bb9d3690a2e0798fbbffbf50` |
| `assets/main-2qu7Ji2W.css` | `60c8642c88c2a1287128b6e858cb651ba2a2d480a0e8cb56183c7c08839d4591` |
| `sw.js` | `f799e584b734bc988a99cacaf6e2b1b3dd1577f8080b9634fd5e051af896890e` |
| `topographic-quarantine.webp` | `eaa00c607e99e578ca661b3518114ee99ede011bb6fd09459989670075dd01cb` |

At both 1440px desktop and 390px mobile, Chromium found no console or page
errors, no horizontal overflow, and zero axe violations (therefore zero
serious/critical findings). The first keyboard target is the skip link with a
visible `3px solid` focus ring; ArrowRight changes the cooldown demo from 7
to 8 days; the package-manager selector updates the Cargo configuration.
Reduced-motion mode sets animation/transition duration to `0.01ms` and scroll
behavior to `auto`.

The service worker controlled the live page, `registration.update()` completed
without a pending worker, and an offline reload rendered the cached home page
with its expected title and h1. The generated-worker test verifies that a
waiting update activates only after the explicit `Update now` message; a real
waiting-worker transition cannot be induced without changing the production
deployment, which was outside this verifier's authority.

Mobile Lighthouse returned Performance 100, Accessibility 100, Best
Practices 100, and SEO 100; LCP was 0.2 s, TBT 0 ms, and CLS 0 in this
environment. Built initial JS is 6.01 KB (2.76 KB gzip), CSS is 14.04 KB
(3.87 KB gzip), and the hero WebP is 141,096 B: all within the stated
budgets. There are no shipped webfonts.

Live headers include HSTS (`max-age=31536000; includeSubDomains`), a
self-only CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, restrictive Permissions-Policy, and
Referrer-Policy. Hashed JS/CSS uses
`Cache-Control: public, max-age=31536000, immutable`; HTML and `sw.js` are
revalidating. The un-hashed hero is short-lived and is also in the revisioned
service-worker shell cache.

An unlicensed page made same-origin requests only. Source and network review
found no analytics, tracking pixels, telemetry, CDN fonts, or third-party
runtime scripts. The one possible cross-origin request is the disclosed
Sociobot license-verification call after a user provides a token; privacy and
terms accurately describe localStorage, worker cache, and that flow.

## Defects and limitations

No release-blocking, high, medium, or low defects were found.

- Docker/Compose execution was not possible because Docker is not installed
  in this disposable verifier environment (`docker: command not found`). The
  Compose file was inspected; native release build, package installation, all
  three registry protocols, persistence, recovery, and real clients were
  exercised instead.
- Lighthouse desktop generated a report but its Chromium tab crashed during
  final screenshot capture; the full mobile audit completed successfully.
  This is recorded as an environment/tool limitation, not a page error;
  direct desktop browser/axe/error checks passed.

## Reproduction

```sh
npm ci
cargo test
cargo clippy --all-targets -- -D warnings
npm test
npm run build
cargo package --allow-dirty
curl -sSI https://cooldown-registry-proxy.sociobot.in/
curl -sSI https://cooldown-registry-proxy.sociobot.in/assets/main-Cvw5RglT.js
```
