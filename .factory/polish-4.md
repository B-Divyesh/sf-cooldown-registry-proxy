# Polish round 4 — cumulative finding closure

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-4`

Reviewed candidate: `5e4f5d9fec6ea7bd90354e19134f67087cf25dae`

Review report: `5b2f0edb575603d86c4560fb6409d44d5f7f3cf0`

Repair implementation: `d3dee84be15d61c04d3d925dcddef58151282971`

Deployment: `7f8115d3-0b1e-4320-9f88-74dd8b83e5a9`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

Evidence abbreviations:

- `CC-CLAIMS` — clean clone `/tmp/cooldown-polish4-claims.eYHVcJ` at
  `d3dee84`; all 24 manifest commands passed separately.
- `CC-FULL` — the same clean clone passed `cargo fmt --check`, strict Clippy,
  7 Rust tests, 35 Node tests, `npm run build`, 15 Playwright tests, and
  `cargo package --allow-dirty`.
- `PW-LIVE` — cold custom-domain Playwright, 15/15. Axe found zero serious or
  critical issues across Home, Demo, Privacy, Terms, and 404.
- `HOME-M`, `HOME-D`, `DEMO-M`, `DEMO-D`, and `404-D` — screenshots in
  `.factory/evidence/polish-4/`.
- `LIVE` — custom-domain route/source probes, exact local/live Home SHA-256
  `1589622c85acabebfc4d224cecaef1e6143e2b8db23811baeac373c31423249c`,
  and `.factory/evidence/polish-4/live-home/verify.json`.

## Review 4 findings

| ID | Change made | Evidence |
| --- | --- | --- |
| F-4-1 / M3 | Privacy, Terms, and 404 now use the exact contour SVG, wordmark, home label, and navigation destinations used by Home and Demo. Added static and rendered-route parity tests for icon paths, wordmark, accessible names, and links. | CC-FULL `all public routes share the marked header…`; PW-LIVE `every route uses the same marked header…`; HOME-M and 404-D; live `/privacy/`, `/terms/`, and unknown-route source checks. |
| F-4-2 | Changed the setup destination from dead `#usage` to `#run-the-proxy`. Added an anchor-aware test that derives GitHub-style IDs from README headings. | CC-FULL `GitHub links with fragments target a real README heading`; HOME-D; live Home contains `#run-the-proxy`, the pushed README contains `## Run the proxy`, and the GitHub URL returned 200. |
| F-4-3 | Renamed every header and footer source action to “View source on GitHub,” matching the final landing action. | CC-FULL `all public routes share the marked header and result-naming source action`; PW-LIVE header parity test; HOME-M and 404-D; live Home/Privacy/404 source checks. |

## Review 3 findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| F-3-1 / B2 | The live three-decision strip remains above the fold after one click at phone and desktop sizes. | PW-LIVE `one click shows all three demo outcomes…`; DEMO-M/DEMO-D; live `/demo/`. |
| F-3-2 / F-2-1 | One refusal row per blocked version remains covered across npm, PyPI, and Cargo metadata/direct paths and both refusal reasons. | CC-CLAIMS `@claim:refusal-jsonl`; CC-FULL. |
| F-3-3 / UC-R23 | File/socket/DNS and browser Storage API interception still enforce the narrowed privacy claims. | CC-CLAIMS `@claim:cli-demo-isolation`, `@claim:configured-outbound`; PW-LIVE `@claim:demo-isolation`, `@claim:site-privacy`; DEMO-M. |
| F-3-4 | Privacy, offline, and price facts remain inside both required first viewports. | PW-LIVE `mobile and desktop first screens…`; HOME-M/HOME-D. |
| F-3-5 | Terminal artwork parity remains a listed claim checked against fresh CLI output. | CC-CLAIMS `@claim:terminal-recording`; DEMO-D; live `/demo/`. |
| F-3-6 | Package-name disclosure remains scoped to refusal records and tested from generated JSONL. | CC-CLAIMS `@claim:local-output-sensitive-data`; live README. |
| F-3-7 / UC-R22 | Unsupported deployment/credential ownership copy remains absent. | CC-FULL `reviewed dead paid and versioned-download promises are absent`; live README. |

## Review 2 findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| F-2-1 | The version-scoped refusal claim keeps its exhaustive production matrix. | CC-CLAIMS `@claim:refusal-jsonl`; CC-FULL. |
| F-2-2 | A nested clean checkout still builds `dist/bin` and `dist/site`. | CC-CLAIMS `@claim:build-dist`; CC-FULL `npm run build`. |
| F-2-3 | Production `serve` still writes cache/refusal data only to explicit paths. | CC-CLAIMS `@claim:configured-local-output`; live Privacy wording. |

## Review 1 product and structure findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| B1 | The first screen names the job, user, sample action, outcome, and three facts. | PW-LIVE `mobile and desktop first screens…`; HOME-M/HOME-D; live Home. |
| B2 | Browser and CLI demos retain direct entry, sample data, banner, reset, exit, and isolated state. | PW-LIVE `@claim:demo-isolation`, `@claim:offline-sample`; CC-CLAIMS CLI demo claims; DEMO-M/DEMO-D; live `/?demo=1` and `/demo/`. |
| B3 | The manifest retains 24 unique claims with exactly one tagged test each. | CC-CLAIMS 24/24; CC-FULL `claims manifest has one and only one tagged test…`. |
| B4 | Demo, Privacy, Terms, and the product 404 remain real routes with correct status. | PW-LIVE `direct routes…designed 404`; 404-D; live named routes 200 and `/not-a-real-route` 404. |
| B5 | The unprovisioned paid offer, checkout, and license UI remain absent. | CC-FULL dead-paid test; PW-LIVE link crawl; live Home. |
| M1 | Source actions make no unavailable version promise. | CC-FULL dead-version test; PW-LIVE links; HOME-D. |
| M2 | Route titles and complete local metadata/assets remain present. | PW-LIVE four route metadata/axe tests; live asset probes. |
| M3 | Header parity is now complete; footer links, focus, announcements, and Back restoration remain correct. | F-4-1 evidence; PW-LIVE route/focus and shared-header tests; 404-D. |
| M4 | Limits and privacy remain before the final action. | HOME-M/HOME-D; `@claim:unsupported-scope`; live Home. |
| M5 | Static client configuration and cooldown remain labelled as examples. | CC-FULL dead-claim test; HOME-D; live Home. |
| m01 | “How requests are checked” remains exactly three ordered steps. | PW-LIVE semantic/axe checks; HOME-M/HOME-D. |
| m02 | Every external destination visibly names GitHub. | PW-LIVE link crawl; HOME-D and 404-D; all live GitHub links returned 200. |

## Review 1 copy findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| C01 | Direct seven-word verb-first cooldown headline. | `@claim:cooldown-block`; HOME-M; live Home. |
| C02 | The 16-word support line names platform and security teams. | PW-LIVE first-screen test; HOME-M. |
| C03 | Setup action remains “View setup commands.” | HOME-M/HOME-D; live Home. |
| C04 | Sample action names sample data and its three outcomes. | PW-LIVE click-through; HOME-M and DEMO-M. |
| C05 | All action-style source links now say “View source on GitHub.” | F-4-3 evidence; HOME-M and 404-D. |
| C06 | README audience and mechanism remain separate short sentences. | CC-FULL plain-words test; live README. |
| C07 | Metadata, direct-download, and refusal behavior remain separate. | Their three CC-CLAIMS tests; live Home/README. |
| C08 | The untested deployment-time number remains absent. | CC-FULL earlier-claims test; live copy. |
| C09 | Paid and banned “unlock” wording remains absent. | CC-FULL dead-paid test; live copy. |
| C10 | Product label remains “Package release cooldown proxy.” | `.factory/copy-audit.md`; HOME-M. |
| C11 | Copy names npm, PyPI, Cargo, or package registries. | CC-FULL plain-words test; live Home. |
| C12 | Network service terminology remains “proxy.” | `.factory/copy-audit.md`; live Home/README. |
| C13 | Age behavior remains “blocked by cooldown” and “cooldown ends.” | Cooldown/sample claims; DEMO-M. |
| C14 | Control remains “Minimum release age.” | PW-LIVE keyboard/sample tests; DEMO-M. |
| C15 | Sample states remain “Blocked by cooldown” and “Allowed by age.” | `@claim:sample-values`; DEMO-M. |
| C16 | Section remains “How requests are checked.” | PW-LIVE outline/axe; HOME-M. |
| C17 | Step remains “Check release age.” | HOME-M; live Home. |
| C18 | Setup remains “Configure each package manager.” | HOME-M/HOME-D; live Home. |
| C19 | Unavailable runbook sales heading remains absent. | CC-FULL dead-paid test; live Home. |
| C20 | Final action remains “Try the policy” / “See three package decisions.” | `@claim:sample-decisions`; HOME-M. |
| C21 | Copy button names the selected package manager. | PW-LIVE keyboard/UI suite; live Home. |
| C22 | Precise MIT wording replaces vague tier wording. | `@claim:mit-license`; HOME-M. |
| C23 | Subjective size/trust language remains absent. | CC-FULL earlier-claims test; live copy. |
| Terminology | Public behavior consistently uses cooldown, proxy, blocked by cooldown, blocked by advisory, and refusal record. | `.factory/copy-audit.md`; CC-FULL plain-words test; HOME-M/DEMO-M. |

## Review 1 landing claim findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| UC-L01 | Direct tested cooldown headline. | `@claim:cooldown-block`; HOME-M; live Home. |
| UC-L02 | Exact one-proxy/three-registry claim. | `@claim:registry-paths`; HOME-M; live Home. |
| UC-L03 | Clearance metaphor remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L04 | Choke-point wording remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L05 | Precise separate-demo-data fact. | `@claim:demo-isolation`, `@claim:site-privacy`; HOME-M. |
| UC-L06 | TLS-interception promise remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L07 | Immutable-cache promise remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L08 | Advisory precedence retains a collision fixture. | `@claim:advisory-block`; DEMO-M. |
| UC-L09 | Refusal behavior retains exhaustive production evidence. | `@claim:refusal-jsonl`; live Home/README. |
| UC-L10 | Exact simulator-equivalence wording remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L11 | Same-origin runtime wording retains interception evidence. | `@claim:site-privacy`; live demo flow. |
| UC-L12 | Seven-day remaining value remains tested. | `@claim:sample-values`; DEMO-M. |
| UC-L13 | Allowed older sample remains tested. | Sample claims; DEMO-M. |
| UC-L14 | `MAL-2026-041` precedence remains tested. | Advisory/sample claims; DEMO-M. |
| UC-L15 | Direct-download behavior remains concrete and tested. | `@claim:direct-downloads`; live Home. |
| UC-L16 | Metadata and download claims remain split and tested. | Metadata/direct claims; live Home. |
| UC-L17 | Public-registry migration promise remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L18 | Exact client proxy paths remain exercised. | `@claim:registry-paths`; HOME-D. |
| UC-L19 | Broad normal-protocol promise remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L20 | Wrapper/plugin promise remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L21 | Live refreshed-feed promise remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L22 | Allowed older release remains in both demos. | `@claim:sample-decisions`; DEMO-M. |
| UC-L23 | Fresh metadata omission/direct 404 remain tested. | Metadata/cooldown claims; live Home. |
| UC-L24 | Advisory direct 451 remains tested. | Direct/advisory claims; DEMO-M. |
| UC-L25 | Output location and refusals remain separate exact claims. | Local-output/refusal claims; live README. |
| UC-L26 | Untested five-minute number remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L27 | Vague ungated wording remains replaced by MIT licensing. | `@claim:mit-license`; HOME-M. |
| UC-L28 | Unavailable Operator Pack remains absent. | CC-FULL dead-paid test; live Home. |
| UC-L29 | Purchase claim remains absent. | CC-FULL dead-paid test; live Home. |
| UC-L30 | Merchant/refund claim remains absent. | CC-FULL dead-paid test; live Home. |
| UC-L31 | License UI remains absent and demo storage access stays isolated. | `@claim:demo-isolation`; DEMO-M. |
| UC-L32 | Vague free claim remains replaced by tested MIT wording. | `@claim:mit-license`; HOME-M. |
| UC-L33 | Unavailable runbook download remains absent. | CC-FULL dead-paid test; live Home. |
| UC-L34 | Concrete cooldown behavior remains the headline. | Cooldown/metadata/direct claims; HOME-M. |
| UC-L35 | Subjective trust wording remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L36 | Policy slogan remains absent. | CC-FULL earlier-claims test; live copy. |
| UC-L37 | No unavailable versioned source promise remains. | CC-FULL dead-version test; HOME-D. |
| UC-L38 | Configuration and status remain explicitly examples. | CC-FULL dead-claim test; HOME-D. |

## Review 1 README claim findings

| ID | Change retained and rechecked | Evidence |
| --- | --- | --- |
| UC-R01 | Exact three-registry proxy claim remains tested. | `@claim:registry-paths`; live README. |
| UC-R02 | Audience, binary, and registry paths remain split and tested. | Binary/registry claims; live README. |
| UC-R03 | Metadata, download, and refusal claims remain separate. | Three matching claim tests; live README. |
| UC-R04 | Unsupported scope remains listed and tested. | `@claim:unsupported-scope`; live README. |
| UC-R05 | Unsupported Rust-version promise remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R06 | Untested container promise remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R07 | Serve command remains labelled an example. | Rust `documented_durations_parse`; live README. |
| UC-R08 | Broad non-interactive claim remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R09 | `--json` remains only on the exercised validation path. | `@claim:policy-files`; live README. |
| UC-R10 | Exhaustive-help claim remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R11 | Exclusion fields remain exact and validated. | `@claim:policy-files`; live README. |
| UC-R12 | Remote-schema claim remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R13 | Advisory/exclusion precedence remains tested. | `@claim:advisory-block`; live README. |
| UC-R14 | Documented validation remains exercised for valid/invalid files. | `@claim:policy-files`; live README. |
| UC-R15 | Multi-feed/live-refresh claim remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R16 | Metadata omission and refusal recording remain separately tested. | Metadata/refusal claims; live README. |
| UC-R17 | Direct 404/200/451 and refusal request IDs remain asserted. | Direct/refusal claims; live README. |
| UC-R18 | Stale-cache promise remains absent. | CC-FULL earlier-claims test; live README. |
| UC-R19 | Proxy offline-server claim remains absent; browser offline claim stays exact. | `@claim:offline-sample`; DEMO-M. |
| UC-R20 | Health/readiness marketing claim remains absent. | CC-FULL source audit; live README. |
| UC-R21 | Outbound interception still denies unconfigured traffic. | `@claim:configured-outbound`; live Privacy. |
| UC-R22 | Credential-ownership claim remains absent; package creation passes locally. | CC-FULL dead-version test and `cargo package`; live README. |
| UC-R23 | Configured URLs/file reads/browser storage retain interception evidence. | Configured-outbound, CLI-isolation, and demo-isolation claims; live Privacy/Demo. |

## Final evidence

- Every `.factory/claims.json` command passed separately: 24/24.
- Clean-clone aggregate passed: formatting, strict Clippy, 7 Rust tests,
  35 Node tests, full build, 15 browser tests, and package verification.
- Built JS is 5,864 bytes raw / 2.55 kB gzip; CSS is 17,713 bytes raw /
  4.49 kB gzip; the hero image is 141,096 bytes.
- Cold live `verify-url.sh`: 820 ms, no console errors, one h1, `lang=en`,
  main landmark, complete alt text, and named buttons.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.502 s, CLS 0, TBT 8 ms, Speed Index 0.814 s.
- Security headers include self-only CSP, HSTS, frame denial, nosniff,
  Referrer-Policy, and restrictive Permissions-Policy.
- No current or earlier finding remains open.
