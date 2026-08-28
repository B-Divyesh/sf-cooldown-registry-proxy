# Polish round 3 — cumulative finding closure

Date: 2026-08-28

Work order: `cooldown-registry-proxy-polish-3`

Reviewed candidate: `227950e0ddf64f93cda06b569f6c1c3f76dd8b80`

Review report: `d6e17711a12d5a8aa7f0b84a8fe7188b65fc5953`

Repair implementation: `622d892`

Verified evidence commit: `bf2c07f`

Deployment: `7e2fac8f-8709-44e4-bd8f-53934365eede`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

Evidence abbreviations:

- `CC-CLAIMS` — clean clone `/tmp/cooldown-polish3-final.Ulho3b`; all 24
  manifest commands passed separately and each selected exactly one tagged test.
- `CC-FULL` — the final clean clone passed `npm test` (7 Rust and 33 Node tests),
  strict Clippy, `npm run build`, 14 Playwright tests, and `cargo package`.
- `PW-LIVE` — cold live `npm run test:browser -- --reporter=list`, 14/14.
  Route axe scans reported zero serious or critical issues.
- `HOME-M`, `HOME-D`, `DEMO-M`, `DEMO-D`, `404-D` — screenshots under
  `.factory/evidence/polish-3/`.
- `LIVE` — `.factory/evidence/polish-3/live-home/verify.json`, route/header
  probes, local/live hash comparison, and the live Lighthouse report.

## Review 3 findings

| ID | Change made | Evidence |
| --- | --- | --- |
| F-3-1 / B2 | Added a live three-result survey strip directly below the demo heading. It updates with the controls and shows all named outcomes after one click. | PW-LIVE `one click shows all three demo outcomes…`; DEMO-M/DEMO-D; live bottoms at 390/375/390px on 390×844 and 480px on 1440×900. |
| F-3-2 / F-2-1 | Reworded the promise to one record per blocked package version. Expanded the production `serve` test across npm, PyPI, and Cargo metadata plus direct downloads, with both cooldown and advisory refusals. All 12 rows are tied to response request IDs. | CC-CLAIMS `@claim:refusal-jsonl`; `X-Request-Id` response-header assertions. |
| F-3-3 / UC-R23 | Added a compiled file/socket interception guard. CLI demo tests deny current-directory opens and non-loopback sockets. Production tests deny unconfigured traffic and exercise configured registry and remote advisory URLs. Browser tests record every Storage API read/write/remove and allow only the `demo:` key. | CC-CLAIMS `@claim:cli-demo-isolation`, `@claim:configured-outbound`; PW-LIVE `@claim:demo-isolation`, `@claim:site-privacy`. |
| F-3-4 | Reduced desktop hero type, padding, and fact spacing without changing the visual thesis. | PW-LIVE `mobile and desktop first screens…`; HOME-D; live fact bottoms 835/854/835px in a 900px viewport. |
| F-3-5 | Added `terminal-recording`; it compares the SVG with a fresh CLI JSON report. The caption now names the compared fields. | CC-CLAIMS `@claim:terminal-recording`; DEMO-D. |
| F-3-6 | Narrowed the disclosure to refusal records and added a test that finds real sample package names in JSONL output. | CC-CLAIMS `@claim:local-output-sensitive-data`; README privacy section. |
| F-3-7 / UC-R22 | Removed the unsupported factory credential-ownership statement. Deployment guidance now says only to deploy the built static files. | `reviewed dead paid and versioned-download promises are absent`; `earlier unproved claims…`; README. |

## Review 2 findings

| ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Superseded the partial npm-only proof with the 12-row production refusal matrix described under F-3-2. | CC-CLAIMS `@claim:refusal-jsonl`. |
| F-2-2 | Retained the clean nested-clone build test for both `dist/bin` and `dist/site`. | CC-CLAIMS `@claim:build-dist`; CC-FULL build. |
| F-2-3 | Retained the production `serve` test for explicit cache/audit locations and no default data directory. | CC-CLAIMS `@claim:configured-local-output`. |

## Review 1 product and structure findings

| ID | Change retained or completed | Evidence |
| --- | --- | --- |
| B1 | The first screen names the job, platform/security user, sample action, outcome, and privacy/offline/price facts. | PW-LIVE first-screen test; HOME-M/HOME-D. |
| B2 | `?demo=1` redirects to the isolated demo with sample state, banner, reset, exit, visible decisions, CLI demo, and local recording. | PW-LIVE demo tests; CC-CLAIMS demo tests; DEMO-M/DEMO-D. |
| B3 | The manifest now has 24 unique claims and exactly one tagged test for each. | CC-CLAIMS 24/24; `claims manifest has one and only one tagged test…`. |
| B4 | Real Demo, Privacy, and Terms routes return 200; the designed product 404 returns 404. | PW-LIVE route test; live route probe. |
| B5 | The unprovisioned paid offer and dead checkout remain absent. | `reviewed dead paid and versioned-download promises are absent`; live link crawl. |
| M1 | The source action accurately says “View source on GitHub.” | PW-LIVE link test; GitHub returned 200. |
| M2 | Every route retains its title, description, canonical, OG/Twitter metadata, favicon, touch icon, and social card. | PW-LIVE route metadata tests; live asset probes. |
| M3 | All routes retain the shared header/footer, announcement region, h1 focus, and Back scroll restoration. | PW-LIVE route/back/focus test. |
| M4 | The limits/privacy section remains before the final action. | HOME-M/HOME-D; `@claim:unsupported-scope`. |
| M5 | Static client configuration remains labeled as an example. | `reviewed dead paid…`; HOME-D. |
| m01 | “How requests are checked” remains exactly three ordered steps. | PW-LIVE semantic/axe scan; HOME-M/HOME-D. |
| m02 | External actions visibly name GitHub. | PW-LIVE link test. |

## Review 1 copy findings

| ID | Change retained | Evidence |
| --- | --- | --- |
| C01 | Uses “Block new packages until their cooldown ends.” | HOME-M/HOME-D; `@claim:cooldown-block`. |
| C02 | Names platform and security teams in a 16-word sentence. | PW-LIVE first-screen test; `.factory/copy-audit.md`. |
| C03 | Uses “View setup commands.” | HOME-M/HOME-D. |
| C04 | Uses “Try it with sample data” beside its three-result outcome. | PW-LIVE first-screen and click-through tests. |
| C05 | Uses “View source on GitHub.” | PW-LIVE link test. |
| C06 | Keeps the README user and mechanism in separate short sentences. | `public copy uses plain words…`. |
| C07 | Keeps metadata, download, and refusal statements separate; refusal wording now matches exhaustive evidence. | `@claim:metadata-filter`, `@claim:direct-downloads`, `@claim:refusal-jsonl`. |
| C08 | The untested deployment-time number remains absent. | `earlier unproved claims…`. |
| C09 | Paid and “unlock” wording remains absent. | `reviewed dead paid…`. |
| C10 | Uses “Package release cooldown proxy.” | HOME-M/HOME-D; copy audit. |
| C11 | Names npm, PyPI, Cargo, or package registries. | `public copy uses plain words…`. |
| C12 | Uses “proxy” for the network service. | Copy audit; `earlier unproved claims…`. |
| C13 | Uses “blocked by cooldown” and “cooldown ends.” | Demo; sample/cooldown claims. |
| C14 | Uses “Minimum release age.” | DEMO-M/DEMO-D; keyboard range test. |
| C15 | Uses “Blocked by cooldown” and “Allowed by age.” | DEMO-M/DEMO-D; `@claim:sample-values`. |
| C16 | Uses “How requests are checked.” | HOME-M/HOME-D; axe heading scan. |
| C17 | Uses “Check release age.” | HOME-M/HOME-D. |
| C18 | Uses “Configure each package manager.” | HOME-M/HOME-D. |
| C19 | Runbook sales copy remains absent. | `reviewed dead paid…`. |
| C20 | Uses “Try the policy” and “See three package decisions.” | HOME-M/HOME-D; sample claim. |
| C21 | Copy control names the selected package manager. | Browser interaction source and keyboard suite. |
| C22 | Uses the exact MIT-license fact instead of vague tier language. | `@claim:mit-license`. |
| C23 | Subjective size/trust language remains absent. | `earlier unproved claims…`; build/license claims. |

## Review 1 landing claim findings

| ID | Resolution | Evidence |
| --- | --- | --- |
| UC-L01 | Replaced the boundary slogan with direct cooldown wording. | `@claim:cooldown-block`. |
| UC-L02 | Narrowed to one proxy checking three registry paths. | `@claim:registry-paths`. |
| UC-L03 | Removed clearance metaphor; states cooldown behavior. | `@claim:cooldown-block`. |
| UC-L04 | Removed choke-point wording. | `earlier unproved claims…`; `@claim:registry-paths`. |
| UC-L05 | Replaced telemetry shorthand with separate demo data. | `@claim:demo-isolation`, `@claim:site-privacy`. |
| UC-L06 | Removed the TLS-interception promise. | `earlier unproved claims…`. |
| UC-L07 | Removed the immutable-cache promise. | `earlier unproved claims…`. |
| UC-L08 | Retained advisory precedence with a collision fixture. | `@claim:advisory-block`. |
| UC-L09 | Retained JSONL refusals with the full production matrix. | `@claim:refusal-jsonl`. |
| UC-L10 | Removed exact simulator-equivalence wording. | `earlier unproved claims…`. |
| UC-L11 | Replaced zero-request wording with same-origin runtime wording. | `@claim:site-privacy`. |
| UC-L12 | Retained and tested the seven-day remaining value. | `@claim:sample-values`. |
| UC-L13 | Retained and tested the allowed older sample. | `@claim:sample-values`, `@claim:sample-decisions`. |
| UC-L14 | Retained and tested `MAL-2026-041` precedence. | advisory and sample-value claims. |
| UC-L15 | Replaced the metaphor with direct-download checks. | `@claim:direct-downloads`. |
| UC-L16 | Split metadata and direct-download behavior. | metadata/direct claims plus refusal matrix. |
| UC-L17 | Removed the public-registry migration promise. | `earlier unproved claims…`. |
| UC-L18 | Uses exact proxy URL instructions per package manager. | `@claim:registry-paths`; README examples. |
| UC-L19 | Removed the broad normal-protocol promise. | `earlier unproved claims…`. |
| UC-L20 | Removed the wrapper/plugin promise. | `earlier unproved claims…`. |
| UC-L21 | Removed the live refreshed-feed promise. | `earlier unproved claims…`. |
| UC-L22 | Retained and tested the allowed older release. | sample claims. |
| UC-L23 | Retained metadata omission and direct 404 for the fresh sample. | metadata/cooldown claims. |
| UC-L24 | Retained and tested advisory HTTP 451. | direct/advisory claims. |
| UC-L25 | Split output-location and refusal behavior into exact claims. | local-output and refusal claims. |
| UC-L26 | Removed the untested five-minute number. | `earlier unproved claims…`. |
| UC-L27 | Replaced vague ungated wording with the MIT fact. | `@claim:mit-license`. |
| UC-L28 | Removed the unavailable Operator Pack. | `reviewed dead paid…`. |
| UC-L29 | Removed the purchase claim. | `reviewed dead paid…`. |
| UC-L30 | Removed merchant/refund claims with the unavailable offer. | `reviewed dead paid…`. |
| UC-L31 | Removed license UI; browser instrumentation proves only the demo key is accessed. | PW-LIVE `@claim:demo-isolation`. |
| UC-L32 | Replaced the vague free claim with MIT licensing. | `@claim:mit-license`. |
| UC-L33 | Removed the unavailable runbook download. | `reviewed dead paid…`. |
| UC-L34 | Replaced the slogan with concrete cooldown behavior. | cooldown/metadata/direct claims. |
| UC-L35 | Removed subjective trust wording. | `earlier unproved claims…`. |
| UC-L36 | Removed the policy slogan. | `earlier unproved claims…`; concrete outcome claims. |
| UC-L37 | Renamed the action to “View source on GitHub.” | PW-LIVE link test. |
| UC-L38 | Labels the terminal configuration and cooldown as examples. | `reviewed dead paid…`; HOME-D. |

## Review 1 README claim findings

| ID | Resolution | Evidence |
| --- | --- | --- |
| UC-R01 | Narrowed to one proxy checking three registry paths. | `@claim:registry-paths`. |
| UC-R02 | Split audience, binary, and path statements; removed the TLS-certificate promise. | plain-words, binary-build, and registry-path claims. |
| UC-R03 | Split metadata, downloads, and JSONL behavior. | metadata/direct/refusal claims. |
| UC-R04 | Retained exact unsupported scope. | `@claim:unsupported-scope`. |
| UC-R05 | Removed the Rust-version promise. | `earlier unproved claims…`; `@claim:binary-build`. |
| UC-R06 | Removed public container-build copy. | `earlier unproved claims…`. |
| UC-R07 | Labels the serve command as an example. | Rust `documented_durations_parse`. |
| UC-R08 | Removed the broad non-interactive claim. | `earlier unproved claims…`. |
| UC-R09 | Keeps `--json` only on the exercised validation command. | `@claim:policy-files`. |
| UC-R10 | Removed the exhaustive-help claim. | `earlier unproved claims…`. |
| UC-R11 | Retained exact exclusion fields. | `@claim:policy-files`. |
| UC-R12 | Removed the remote schema claim. | claim cross-check/source audit. |
| UC-R13 | Retained advisory-over-exclusion precedence. | `@claim:advisory-block`. |
| UC-R14 | Runs the documented validation on valid and invalid fixtures. | `@claim:policy-files`. |
| UC-R15 | Removed multi-feed/live-refresh copy. | `earlier unproved claims…`. |
| UC-R16 | Split metadata filtering from refusal recording. | metadata/refusal claims. |
| UC-R17 | Retained exact 404/200/451 outcomes and request IDs. | direct/refusal claims. |
| UC-R18 | Removed the stale-cache promise. | `earlier unproved claims…`. |
| UC-R19 | Removed proxy offline-server copy; browser offline behavior is separate. | `@claim:offline-sample`; `earlier unproved claims…`. |
| UC-R20 | Removed health/readiness marketing copy. | prior source audit; route is not marketed. |
| UC-R21 | Production process traffic is denied unless it targets configured loopback fixtures. | `@claim:configured-outbound`. |
| UC-R22 | Removed factory credential ownership from public documentation. Package creation remains local-only. | `earlier unproved claims…`; CC-FULL `cargo package`. |
| UC-R23 | Narrowed the claim to configured URLs and proves it with socket/DNS interception. | `@claim:configured-outbound`; `@claim:cli-demo-isolation`. |

## Final live evidence

- The custom domain returned 200 after deployment. Named routes and assets
  returned 200; `/not-a-real-route` returned the designed 404.
- Local and live home HTML hashes matched at
  `d03aa4284c687d87d17dbdead7bf22485424a6461bad4beafaac01341ac7d4e2`.
  Local and live JS hashes matched at
  `8d18be6ecd9e197ee5fc857150d27b61fac26835391c8309cdca9a2e5a8694ef`.
- `verify-url.sh` recorded 856 ms, no console errors, one h1, `lang=en`, a
  main landmark, complete alt text, and named buttons.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.5 s, CLS 0, TBT 40 ms, Speed Index 1.3 s. Report:
  `.factory/evidence/polish-3/lighthouse/report.json`.
- Built JS is 5.86 kB raw / 2.55 kB gzip; CSS is 17.71 kB raw / 4.49 kB gzip;
  the hero image is 141,096 bytes.

Every current and earlier finding is closed. No severity is deferred.
