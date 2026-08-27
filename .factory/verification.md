# Independent verification — FAIL

Date: 2026-08-27  
Verifier work order: `cooldown-registry-proxy-verify-1`  
Candidate commit: `93b88fa9790959d012bdcc555e820692a9265fe1`  
Live URL: <https://cooldown-registry-proxy.sociobot.in>

## Verdict

**FAIL.** The CLI and deployed static site substantially work, and the live
site is an exact byte-for-byte match for the built site artifacts. Release is
blocked by the production static-cache and browser-security-header defects
below. They violate the stated long-lived immutable-cache requirement for
hashed assets and leave a public site without a Content Security Policy or
clickjacking protection.

## Evidence

Clean checkout state was `HEAD = 93b88fa9790959d012bdcc555e820692a9265fe1`
with no pre-existing worktree changes. `npm ci` completed with 0 reported npm
vulnerabilities. The following all passed:

```text
npm test                                  6 Rust tests + 3 site tests passed
cargo clippy --all-targets -- -D warnings passed
npm run build                             passed; dist/bin and dist/site produced
cargo package --allow-dirty               passed; 37 files, 196.6 KiB compressed
```

`cargo install --path . --root <clean temporary root>` installed the packaged
CLI. `--help`, valid `validate --json`, and invalid `serve --cooldown 0d
--json` behaved as documented; invalid configuration exited 2 with a JSON
error. A directory supplied as a policy file also exited 2.

Local mock-registry end-to-end exercise, with a seven-day policy:

| Case | Result |
| --- | --- |
| npm 10-day old version | discovery and direct tarball: 200 |
| npm 1-day old, active version-specific exclusion | discovery and direct tarball: 200 |
| npm 1-day old ordinary version | omitted from metadata; direct tarball: 404 |
| PyPI advisory-listed `example-package==1.2.0` | omitted from simple index; direct wheel: 451 with `MAL-2026-0042` |
| Cargo old/fresh sparse records | only old record exposed; old crate 200, fresh crate 404 |
| audit log | contained npm/Cargo cooldown and PyPI advisory refusal JSONL events |
| stale recovery | upstream loss after a 1-second TTL returned `X-Cooldown-Cache: stale` |
| offline persistence | restarted `--offline` proxy served cached metadata 200; miss returned 503 `offline_cache_miss` |
| concurrency/identity | 50 parallel `/healthz` calls all succeeded; `/healthz` returned version `0.1.0`, `/readyz` returned ready |

Real package-manager smoke tests through a locally running candidate binary
also passed: `npm install is-number@7.0.0`, `pip download --no-deps
requests==2.31.0`, and Cargo source-replacement `cargo fetch` for `itoa`.

The production build matched the live deployment exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `556155faa757a61a469e08c8fd0813086184059d40e37fefa41355583f36efe1` |
| `assets/main-xvhcHXL4.js` | `a9310637f027bcdcd1448696fbb457f78e7c908d8c1d0cc33e3d9debf0b9bd41` |
| `assets/main-DCsieKnd.css` | `cd050843a6c3bf83278af7471e6d2b3d0edf5e0997b87d5efa910c1817e97fc8` |
| `topographic-quarantine.webp` | `eaa00c607e99e578ca661b3518114ee99ede011bb6fd09459989670075dd01cb` |

Browser verification used Chromium at 1440px and 390px. Home, privacy, and
terms had no console/page errors and axe had zero violations (therefore zero
serious/critical findings). Each page had `lang=en`, one `h1`, and `main`.
Keyboard focus on the skip link was a visible 3px solid ring; ArrowRight on
the cooldown slider changed 7 days to 8 days. Reduced motion set the hero
animation duration to `0.01ms`. The service worker installed, an online
reload was controlled, `registration.update()` resolved with an activated
worker, and an immediate offline reload rendered the home page in Chromium.
The offline result is qualified by the cache defect below: it can rely on the
browser HTTP cache rather than the declared shell cache.

Lighthouse mobile on the live URL: Performance 96, Accessibility 100, Best
Practices 100, SEO 100; FCP 1027 ms, LCP 1707 ms, TBT 147 ms, CLS 0. The built
initial JS is 5,255 B (2,508 B gzip), CSS 13,494 B (3,774 B gzip), and hero
image 141,096 B, all within declared size budgets. Runtime outbound requests
from an unlicensed page were same-origin only; source inspection found no
analytics, third-party scripts, fonts, or telemetry. The only configured
cross-origin runtime request is Sociobot license verification after a user
supplies a license, which the privacy page discloses.

Docker was not installed in the verification environment, so image/Compose
execution was not possible. Native production build, package verification,
and proxy protocol paths were exercised instead.

## Defects

### Medium — hashed static assets are not immutably cached

Live `main-xvhcHXL4.js`, `main-DCsieKnd.css`, and the content-addressed hero
all return `Cache-Control: public, must-revalidate, max-age=30`, rather than
a long-lived immutable policy. This misses the stated static-product caching
requirement and needlessly forces revalidation of hashed artifacts.

### Medium — missing browser hardening headers on the live site

Live responses include HSTS, `Referrer-Policy`, and `X-Content-Type-Options`,
but omit `Content-Security-Policy`, `frame-ancestors`/`X-Frame-Options`, and
`Permissions-Policy`. The absent CSP leaves the page without a browser
enforced script/source boundary; the absent frame restriction permits
clickjacking of the Operator Pack license form/link.

### Low — service-worker precache is not a complete, versioned app shell

`cooldown-shell-v1` precaches only `/`, legal documents, hero, and logo. It
does not precache the hashed JS or CSS referenced by `/`, and the cache name
does not encode a release revision. The immediate offline browser reload
passed only after its online first load, while the actual Cache Storage list
confirmed no JS/CSS shell assets. A cold/evicted HTTP cache can therefore
produce an unstyled/non-interactive offline page, and an update has no
versioned shell boundary.

## Required remediation and recheck

1. Configure immutable cache headers for hashed assets/media (for example
   `public, max-age=31536000, immutable`) while keeping HTML and `sw.js`
   short-lived.
2. Set a restrictive CSP suited to this no-CDN site, a frame restriction, and
   a Permissions-Policy at the static host/ingress.
3. Generate the service-worker precache list from the production manifest,
   including JS/CSS, and version it per build; then retest cold offline reload
   and a worker update.
