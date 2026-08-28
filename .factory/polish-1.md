# Polish round 1 — finding closure

Date: 2026-08-28  
Work order: `cooldown-registry-proxy-polish-1-all-findings`  
Reviewed report: `.factory/review-1.md` at `a583a174cfcb1a22d12d3f986733d7a8017b9d89`  
Implementation: `99143b3`, `c34344e`  
Live URL: <https://cooldown-registry-proxy.sociobot.in>

No earlier `.factory/review-*.md` or `.factory/polish-*.md` exists in the
repository or its Git history. Every ID in review 1 is mapped below.

Evidence abbreviations:

- `PW` — live and local `npm run test:browser -- --reporter=list`, 13/13.
- `CC` — clean clone `/tmp/cooldown-polish-clean.XVRljr`; every one of the 20
  claim commands ran separately and passed exactly one tagged test.
- `HOME-M` — `.factory/evidence/polish-1/home-mobile.png`.
- `DEMO-M` — `.factory/evidence/polish-1/demo-mobile.png`.
- `404-D` — `.factory/evidence/polish-1/404-desktop.png`.
- `LIVE` — `.factory/evidence/polish-1/live-home/verify.json` and cold live
  Playwright run against the URL above.

## Blocking, major, and minor findings

| ID | Change made | Evidence |
| --- | --- | --- |
| B1 | Replaced the metaphor headline, named platform/security teams, made the sample primary, stated its result, and fitted privacy/offline/price facts in the 390×844 first screen. | PW `mobile first screen…`; HOME-M; LIVE |
| B2 | Added `?demo=1` and `/demo`, persistent banner, reset/exit, `demo:` storage, real-data preservation, state disposal, embedded CLI fixtures, real proxy-path execution, report/cache/log evidence, and updated terminal recording. | PW `@claim:demo-isolation`, `@claim:sample-values`; CC `@claim:cli-demo-workspace`, `@claim:cli-demo-isolation`; DEMO-M; live `/demo` 200 |
| B3 | Added 20 claims with exactly one tagged test each. Retained claims now run through the browser or isolated CLI demo. Removed unsupported promises. | CC all 20 `CLAIM_PASS`; `claims manifest has one and only one tagged test…` |
| B4 | Added direct route rewrites, built route documents, and a product-designed HTTP 404. | PW `direct routes, back navigation…`; live `/demo` 200 and `/definitely-not-a-route` 404; 404-D |
| B5 | Removed the unprovisioned paid offer, checkout link, license code, and stale public Operator Pack. The product is honestly MIT-only until billing exists. | `reviewed dead paid…promises are absent`; live link crawl |
| M1 | Renamed the false version action to “View source on GitHub.” | `reviewed dead paid and versioned-download promises are absent`; PW link crawl |
| M2 | Added route-specific titles, descriptions, canonicals, complete OG/Twitter tags, social image, and touch icon. | PW four `route … has complete metadata…`; live route run |
| M3 | Unified header/footer/legal links, added factory/version text, focused each route h1, announced it, and preserved scroll on Back. | PW `direct routes, back navigation…`; `every internal and legal link…` |
| M4 | Added “What the proxy does not do” before the final action, including scope and operator responsibility. | HOME-M; `@claim:unsupported-scope` |
| M5 | Labeled the terminal as “Example client configuration” and “Example: 7-day cooldown.” | `reviewed dead paid…promises are absent`; HOME-M |
| m01 | Reduced “How requests are checked” to three numbered steps. | PW route semantics; HOME-M |
| m02 | Every external action visibly names GitHub. | PW `every internal and legal link resolves and external links name GitHub` |

## Copy findings

| ID | Change made | Evidence |
| --- | --- | --- |
| C01 | “Block new packages until their cooldown ends.” | PW mobile first screen; `@claim:cooldown-block` |
| C02 | Named platform and security teams in a 16-word sentence. | PW mobile first screen; copy audit |
| C03 | “View setup commands.” | HOME-M; copy audit |
| C04 | “Try it with sample data” plus the three-result note. | PW mobile first screen; `@claim:sample-decisions` |
| C05 | “View source on GitHub.” | PW link crawl; no versioned-download promise test |
| C06 | Split the README introduction into short user/mechanism sentences. | `public copy uses plain words…` |
| C07 | Split metadata, direct-download, and refusal behavior into separate sentences and claims. | `@claim:metadata-filter`, `@claim:direct-downloads`, `@claim:refusal-jsonl` |
| C08 | Removed “Five-minute deployment.” | `reviewed dead paid…promises are absent`; repository search |
| C09 | Removed the broken paid offer and banned “unlocks” wording. | dead-paid test; live link crawl |
| C10 | Replaced “Network-level package quarantine” with “Package release cooldown proxy.” | copy audit; HOME-M |
| C11 | Uses “npm, PyPI, and Cargo” or “package registries,” never the abstract label. | copy audit plain-word test |
| C12 | Uses “proxy,” never “policy point” or “choke point.” | terminology table; repository search |
| C13 | Uses “blocked by cooldown” and “cooldown ends.” | `@claim:cooldown-block`; browser demo |
| C14 | “Minimum release age.” | DEMO-M; keyboard range test |
| C15 | “Blocked by cooldown” and “Allowed by age.” | `@claim:sample-values`; DEMO-M |
| C16 | “How requests are checked.” | heading/axe route tests |
| C17 | “Check release age.” | HOME-M; copy audit |
| C18 | “Configure each package manager.” | HOME-M; mobile layout test |
| C19 | Removed the unprovisioned runbook sales heading. | dead-paid test |
| C20 | “Try the policy” and “See three package decisions.” | `@claim:sample-decisions`; HOME-M |
| C21 | Copy button names the selected manager, such as “Copy npm config.” | browser DOM and install control code |
| C22 | Replaced vague “open and ungated” copy with the tested MIT fact. | `@claim:mit-license` |
| C23 | Removed subjective size/trust copy; source and build claims are concrete. | `@claim:binary-build`, `@claim:mit-license` |
| Terminology | Standardized visible behavior to cooldown, proxy, blocked by cooldown, blocked by advisory, and refusal record. Cartography remains only visual description. | `.factory/copy-audit.md`; plain-word test |

## Former landing claim findings

| ID | Change made | Evidence |
| --- | --- | --- |
| UC-L01 | Replaced with the direct cooldown headline. | `@claim:cooldown-block` |
| UC-L02 | Narrowed to one proxy checking three registry paths. | `@claim:registry-paths` |
| UC-L03 | Replaced with blocked-until-cooldown wording. | `@claim:cooldown-block` |
| UC-L04 | Replaced with one-proxy/three-path wording. | `@claim:registry-paths` |
| UC-L05 | Replaced “Telemetry / None” with a same-origin privacy fact. | `@claim:site-privacy`; live CSP `connect-src 'self'` |
| UC-L06 | Removed the TLS-interception promise; setup now gives concrete TLS guidance. | plain-word test; README |
| UC-L07 | Removed the unproved immutable-cache marketing claim. | claim cross-check test |
| UC-L08 | Retained advisory precedence with matching exclusion fixture. | `@claim:advisory-block` |
| UC-L09 | Retained refusal records as a discrete claim. | `@claim:refusal-jsonl` |
| UC-L10 | Removed “exactly what package managers see”; browser values and CLI outcomes are tested separately. | `@claim:sample-values`, `@claim:sample-decisions` |
| UC-L11 | Replaced zero-request wording with the accurate same-origin runtime claim. | `@claim:site-privacy` |
| UC-L12 | Retained and tested the displayed seven-day remaining value. | `@claim:sample-values` |
| UC-L13 | Retained the allowed-by-age result in plain words. | `@claim:sample-decisions`, `@claim:sample-values` |
| UC-L14 | Retained advisory `MAL-2026-041` with exclusion precedence. | `@claim:advisory-block`, `@claim:sample-values` |
| UC-L15 | Replaced boundary metaphor with direct-download checks. | `@claim:direct-downloads` |
| UC-L16 | Split into metadata filtering and direct-download checks. | `@claim:metadata-filter`, `@claim:direct-downloads` |
| UC-L17 | Removed the unproved public-registry migration promise. | claim cross-check test |
| UC-L18 | Setup now says to point each client at the proxy. | `@claim:registry-paths`; README examples |
| UC-L19 | Removed the broad “normal protocols” promise; claims exact registry paths instead. | `@claim:registry-paths` |
| UC-L20 | Removed the wrapper/plugin claim. | claim cross-check test |
| UC-L21 | Removed the unproved refreshed-feed copy. | claim cross-check test |
| UC-L22 | Retained the allowed old sample. | `@claim:sample-decisions` |
| UC-L23 | Retained metadata omission and direct 404. | `@claim:metadata-filter`, `@claim:cooldown-block` |
| UC-L24 | Retained advisory HTTP 451. | `@claim:direct-downloads`, `@claim:advisory-block` |
| UC-L25 | Split cache location and refusal logging. | `@claim:local-demo-output`, `@claim:refusal-jsonl` |
| UC-L26 | Removed the untested five-minute number. | plain-word and claim cross-check tests |
| UC-L27 | Replaced vague free/gated copy with MIT-licensed source. | `@claim:mit-license` |
| UC-L28 | Removed the unavailable paid bundle. | dead-paid test |
| UC-L29 | Removed the unavailable purchase claim. | dead-paid test |
| UC-L30 | Removed merchant/refund copy because checkout is not provisioned. | dead-paid test |
| UC-L31 | Removed license UI/copy; demo still proves unrelated real keys remain untouched. | `@claim:demo-isolation` |
| UC-L32 | Replaced with the precise MIT-license fact. | `@claim:mit-license` |
| UC-L33 | Deleted the stale Operator Pack asset and download promise. | dead-paid test |
| UC-L34 | Made the concrete cooldown behavior the headline. | `@claim:cooldown-block` |
| UC-L35 | Removed subjective “small enough”; retained build and MIT facts. | `@claim:binary-build`, `@claim:mit-license` |
| UC-L36 | Removed the slogan and states direct observable outcomes. | `@claim:cooldown-block`, `@claim:direct-downloads` |
| UC-L37 | Renamed to “View source on GitHub.” | PW link crawl; dead-version-promise test |
| UC-L38 | Explicitly labels the panel and status as examples. | `reviewed dead paid…promises are absent`; HOME-M |

## Former README claim findings

| ID | Change made | Evidence |
| --- | --- | --- |
| UC-R01 | Rewritten as one proxy checking npm, PyPI, and Cargo requests. | `@claim:registry-paths` |
| UC-R02 | Split user, binary, and path statements; removed TLS-certificate promise. | plain-word test; `@claim:binary-build`, `@claim:registry-paths` |
| UC-R03 | Split retained metadata, direct-download, and refusal behaviors. Removed unproved feed/cache language. | three corresponding claim tests |
| UC-R04 | Retained the three explicit scope limits. | `@claim:unsupported-scope` |
| UC-R05 | Removed the Rust 1.85 marketing sentence; tests the actual Cargo release build. | `@claim:binary-build` |
| UC-R06 | Removed the untested container claim from public usage. | claim cross-check test |
| UC-R07 | Labels the command as an example; duration parsing remains unit-tested. | Rust `documented_durations_parse` |
| UC-R08 | Removed the broad non-interactive behavior claim. | claim cross-check test |
| UC-R09 | Kept `--json` on the validated policy example. | `@claim:policy-files` |
| UC-R10 | Removed the “documents every command” claim. | claim cross-check test |
| UC-R11 | Rewrote and retained required exclusion fields. | `@claim:policy-files` |
| UC-R12 | Removed the remote-feed schema claim. | claim cross-check test |
| UC-R13 | Retained advisory-over-exclusion precedence. | `@claim:advisory-block` |
| UC-R14 | The documented validate command is run with valid and invalid fixtures. | `@claim:policy-files` |
| UC-R15 | Removed multi-feed/live-refresh copy. | claim cross-check test |
| UC-R16 | Retained metadata omission and refusal recording as separate claims. | `@claim:metadata-filter`, `@claim:refusal-jsonl` |
| UC-R17 | Direct sample paths assert HTTP 404/200/451; refusal rows assert request IDs. | `@claim:direct-downloads`, `@claim:refusal-jsonl` |
| UC-R18 | Removed stale-cache fallback copy. | claim cross-check test |
| UC-R19 | Removed proxy offline-server copy; the browser offline claim is separate and tested. | `@claim:offline-sample` |
| UC-R20 | Removed health/readiness marketing copy. | claim cross-check test |
| UC-R21 | The CLI sample records the complete private upstream request list. | `@claim:configured-outbound` |
| UC-R22 | Clean clone ran `cargo package --allow-dirty` successfully; no publishing occurs. | CC package verification |
| UC-R23 | Narrowed to configured outbound URLs and local file locations; removed credential claim. | `@claim:configured-outbound`, `@claim:local-demo-output` |

## Final live evidence

- Deployment `cb29e7ce-91d1-4192-9d55-5cd58b96cd15` succeeded on Azure Static
  Web Apps and the custom domain returned HTTPS 200.
- Cold live Playwright: 13/13, including four axe route scans and the 404 scan
  with zero serious or critical violations.
- Live route probe: `/`, `/?demo=1`, `/demo`, `/demo/`, `/privacy`,
  `/privacy/`, `/terms`, and `/terms/` returned 200. Unknown route returned 404.
- Live `verify-url.sh`: 815 ms load, no console errors, one h1, `lang=en`, main
  landmark, no missing alt text, and no unnamed buttons.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms, Speed Index 0.9 s.
