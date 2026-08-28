# Polish round 2 — cumulative finding closure

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-2`

Reviewed candidate: `da745481f6f9982c2b5cec7a15d8faa8f39866e0`

Review report: `487ec6513cb402bb6c723e10259e334b439047fa`

Repair implementation: `69d2706`, `2ae950d`, `cb3ab93`

Deployment: `66326f6b-dd3c-4095-bc3b-dbb007a54dab`
Live URL: <https://cooldown-registry-proxy.sociobot.in>

Evidence abbreviations:

- `CC` — clean clone `/tmp/cooldown-polish2-clean.AQeINw`; all 22 manifest
  commands passed separately, then the aggregate suite passed.
- `PW` — local and cold-live `npm run test:browser -- --reporter=list`, 13/13.
- `HOME-M`, `DEMO-M`, `404-D` — screenshots under
  `.factory/evidence/polish-2/`.
- `LIVE` — `.factory/evidence/polish-2/live-home/verify.json`, route probes,
  response headers, live Playwright, and live Lighthouse.

## Review 2 findings

| ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Expanded `refusal-jsonl` from sample-only evidence to a real `serve` process. The test creates cooldown and advisory refusals and matches each response request ID to one appended JSONL row. | CC `@claim:refusal-jsonl`; `round two production claims match their listed evidence` |
| F-2-2 | Added `build-dist`. Its test creates a new local clone with no dependencies or build output, runs `npm ci` and `npm run build`, and checks `dist/bin/cooldown-registry-proxy` plus `dist/site/index.html`. | CC `@claim:build-dist`; clean aggregate build |
| F-2-3 | Added `configured-local-output`. Its test starts the production `serve` command with explicit temporary cache/audit paths, makes allowed and blocked requests, verifies the files, and proves no default `data/` directory was created. | CC `@claim:configured-local-output`; `round two production claims match their listed evidence` |

## Review 1 blocking, major, and minor findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| B1 | Direct seven-word job headline, named platform/security audience, primary sample action, stated result, and three first-screen facts. | PW `mobile first screen…`; HOME-M; LIVE |
| B2 | One-click `?demo=1` and `/demo`, persistent banner, reset/exit, `demo:` storage, disposal, CLI demo, fixtures, and terminal recording. | PW `@claim:demo-isolation`, `@claim:sample-values`; CC demo claims; DEMO-M |
| B3 | Claims manifest now has 22 entries with exactly one tagged test each. | CC `ALL_CLAIMS_PASS 22`; manifest uniqueness test |
| B4 | Direct route documents, host rewrites, and product-styled HTTP 404 remain functional. | PW route/back/404 test; live route probe; 404-D |
| B5 | Unprovisioned paid offer, checkout link, license code, and Operator Pack remain absent. | dead-paid content test; PW link crawl |
| M1 | Source action remains honestly labeled “View source on GitHub.” | dead-version content test; PW link crawl |
| M2 | Route titles, descriptions, canonicals, OG/Twitter tags, social image, and touch icon remain complete. | PW four route metadata/axe tests; live asset probe |
| M3 | Shared header/footer/legal navigation, route announcement, h1 focus, and Back scroll restoration remain correct. | PW route/back/focus and link tests |
| M4 | Limits/privacy section remains before the final action and states scope plus operator responsibility. | HOME-M; `@claim:unsupported-scope` |
| M5 | Static panel remains labeled “Example client configuration” and “Example: 7-day cooldown.” | dead-claim content test; HOME-M |
| m01 | Request explanation remains exactly three numbered steps. | HOME-M; semantic route test |
| m02 | External links visibly name GitHub. | PW link test |

## Review 1 copy findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| C01 | “Block new packages until their cooldown ends.” | PW first-screen test; `@claim:cooldown-block` |
| C02 | Platform/security teams are named in a 16-word sentence. | PW first-screen test; copy audit |
| C03 | Setup action says “View setup commands.” | HOME-M; copy audit |
| C04 | Sample action and its three-result note remain adjacent. | PW first-screen test; `@claim:sample-decisions` |
| C05 | Source action says “View source on GitHub.” | PW link test |
| C06 | README introduction remains split into short user/mechanism sentences. | plain-words test |
| C07 | Metadata, downloads, and refusal behavior remain separate claims. | three matching claim tests, including production `@claim:refusal-jsonl` |
| C08 | “Five-minute deployment” remains absent. | dead-claim test |
| C09 | Paid/unlock wording remains absent. | dead-paid test |
| C10 | Product label remains “Package release cooldown proxy.” | copy audit; HOME-M |
| C11 | Public copy consistently uses npm, PyPI, Cargo, or package registries. | copy audit; plain-words test |
| C12 | Behavior copy uses “proxy,” not policy-point/choke-point jargon. | copy audit; source search |
| C13 | Age behavior uses “blocked by cooldown” and “cooldown ends.” | demo; `@claim:cooldown-block` |
| C14 | Control is labeled “Minimum release age.” | DEMO-M; keyboard range test |
| C15 | Sample states say “Blocked by cooldown” and “Allowed by age.” | DEMO-M; `@claim:sample-values` |
| C16 | Section says “How requests are checked.” | heading/axe route test |
| C17 | Step says “Check release age.” | HOME-M; copy audit |
| C18 | Setup says “Configure each package manager.” | HOME-M; mobile test |
| C19 | Runbook sales heading remains removed. | dead-paid test |
| C20 | Final action uses “Try the policy” and “See three package decisions.” | HOME-M; `@claim:sample-decisions` |
| C21 | Copy button names the selected manager. | install control behavior; browser DOM |
| C22 | Vague free-tier copy remains replaced by the tested MIT fact. | `@claim:mit-license` |
| C23 | Subjective size/trust wording remains absent; build/license claims are concrete. | `@claim:binary-build`, `@claim:build-dist`, `@claim:mit-license` |

## Review 1 landing claim findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| UC-L01 | Boundary slogan replaced by the direct cooldown headline. | `@claim:cooldown-block` |
| UC-L02 | Claim narrowed to one proxy and three registry paths. | `@claim:registry-paths` |
| UC-L03 | Clearance metaphor replaced by cooldown behavior. | `@claim:cooldown-block` |
| UC-L04 | Choke-point copy replaced by one-proxy/three-path wording. | `@claim:registry-paths` |
| UC-L05 | Telemetry shorthand replaced by the same-origin privacy fact. | `@claim:site-privacy`; live CSP |
| UC-L06 | TLS-interception promise removed; setup gives bounded TLS guidance. | plain-words test; README |
| UC-L07 | Unproved immutable-cache marketing claim remains removed. | claim cross-check test |
| UC-L08 | Advisory precedence retained with a matching exclusion fixture. | `@claim:advisory-block` |
| UC-L09 | Refusal records retained and now proven through production `serve`. | `@claim:refusal-jsonl` |
| UC-L10 | “Exactly what package managers see” remains removed. | browser/CLI sample claims |
| UC-L11 | Zero-request wording replaced by tested same-origin runtime wording. | `@claim:site-privacy` |
| UC-L12 | Seven-day remaining value retained and tested. | `@claim:sample-values` |
| UC-L13 | Allowed-by-age result retained and tested. | sample claims |
| UC-L14 | Advisory `MAL-2026-041` precedence retained and tested. | advisory/sample-value claims |
| UC-L15 | Boundary metaphor replaced by direct-download checks. | `@claim:direct-downloads` |
| UC-L16 | Metadata and direct-download behavior split into exact claims. | metadata/direct claim tests |
| UC-L17 | Public-registry migration promise remains removed. | claim cross-check test |
| UC-L18 | Setup says to point each client at the proxy. | registry-path claim; README |
| UC-L19 | Broad protocol promise remains replaced by exact paths. | `@claim:registry-paths` |
| UC-L20 | Wrapper/plugin promise remains removed. | claim cross-check test |
| UC-L21 | Refreshed-feed promise remains removed. | claim cross-check test |
| UC-L22 | Allowed old sample retained and tested. | `@claim:sample-decisions` |
| UC-L23 | Metadata omission and direct 404 retained and tested. | metadata/cooldown claims |
| UC-L24 | Advisory HTTP 451 retained and tested. | direct/advisory claims |
| UC-L25 | Cache location and refusal logging remain split; production locations now have a dedicated test. | local-demo, refusal, configured-output claims |
| UC-L26 | Untested five-minute number remains removed. | plain-words/dead-claim tests |
| UC-L27 | Free/gated copy remains replaced by MIT licensing. | `@claim:mit-license` |
| UC-L28 | Unavailable paid bundle remains removed. | dead-paid test |
| UC-L29 | Unavailable purchase claim remains removed. | dead-paid test |
| UC-L30 | Merchant/refund copy remains removed with the checkout. | dead-paid test |
| UC-L31 | License UI remains absent; demo preserves unrelated real keys. | `@claim:demo-isolation` |
| UC-L32 | “Full proxy remains free” replaced by precise MIT licensing. | `@claim:mit-license` |
| UC-L33 | Operator Pack asset/promise remains absent. | dead-paid test |
| UC-L34 | Concrete cooldown behavior remains the headline. | `@claim:cooldown-block` |
| UC-L35 | Subjective size wording remains absent. | build/license claims |
| UC-L36 | Slogan remains replaced by observable outcomes. | cooldown/direct claims |
| UC-L37 | Action remains “View source on GitHub.” | PW link test |
| UC-L38 | Panel/status remain explicitly labeled as examples. | dead-claim test; HOME-M |

## Review 1 README claim findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| UC-R01 | README says one proxy checks the three registry paths. | `@claim:registry-paths` |
| UC-R02 | User, binary, and path statements remain split; TLS-certificate promise is absent. | plain-words and build/path claims |
| UC-R03 | Metadata, downloads, and refusal behavior remain separate; production refusal proof added. | three matching claims |
| UC-R04 | Three explicit scope limits remain. | `@claim:unsupported-scope` |
| UC-R05 | Rust-version marketing removed; release build tested. | `@claim:binary-build` |
| UC-R06 | Untested container usage remains removed. | claim cross-check test |
| UC-R07 | Serve command remains labeled as an example; durations are unit-tested. | Rust `documented_durations_parse` |
| UC-R08 | Broad non-interactive claim remains removed. | claim cross-check test |
| UC-R09 | `--json` remains on the tested validation example. | `@claim:policy-files` |
| UC-R10 | Exhaustive-help claim remains removed. | claim cross-check test |
| UC-R11 | Required exclusion fields remain precise and tested. | `@claim:policy-files` |
| UC-R12 | Remote-feed schema claim remains removed. | claim cross-check test |
| UC-R13 | Advisory-over-exclusion precedence retained. | `@claim:advisory-block` |
| UC-R14 | Documented validation runs on valid and invalid fixtures. | `@claim:policy-files` |
| UC-R15 | Multi-feed/live-refresh copy remains removed. | claim cross-check test |
| UC-R16 | Metadata omission and refusal recording remain separate; refusal evidence now uses production `serve`. | metadata/refusal claims |
| UC-R17 | 404/200/451 statuses and refusal request IDs are asserted. | direct/refusal claims |
| UC-R18 | Stale-cache fallback copy remains removed. | claim cross-check test |
| UC-R19 | Proxy offline-server copy remains removed; browser offline behavior is separately tested. | `@claim:offline-sample` |
| UC-R20 | Health/readiness marketing copy remains removed. | claim cross-check test |
| UC-R21 | CLI sample still records every private fixture request. | `@claim:configured-outbound` |
| UC-R22 | Package creation succeeds without publishing. | clean-clone `cargo package --allow-dirty` |
| UC-R23 | Claims remain limited to configured outbound URLs and configured local paths; both now have production evidence. | configured-outbound/configured-output claims |

## Final evidence

- All 22 claim commands passed individually from the clean clone.
- Clean-clone aggregate: 7 Rust tests and 30 Node tests passed; strict Clippy,
  `npm run build`, 13 Playwright tests, and `cargo package` passed.
- Browser scans found zero serious or critical axe violations on Home, Demo,
  Privacy, Terms, and the product 404.
- Cold live `verify-url.sh`: 687 ms, no console errors, one h1, `lang=en`, main,
  complete image alt text, and named buttons.
- Live route probe: all named routes/assets returned 200; unknown route returned
  the product 404 with HTTP 404.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.53 s, CLS 0, TBT 0 ms, Speed Index 0.91 s.
- Built JS is 5.58 kB raw / 2.49 kB gzip; CSS is 16.38 kB raw / 4.27 kB gzip;
  hero WebP is 141,096 bytes.

No finding from review 1 or review 2 remains unresolved.
