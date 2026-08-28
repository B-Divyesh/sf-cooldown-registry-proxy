# Adversarial first-read review 4

Date: 2026-08-28

Work order: `cooldown-registry-proxy-review-4`

Repository base: `5e4f5d9fec6ea7bd90354e19134f67087cf25dae`

Live target: <https://cooldown-registry-proxy.sociobot.in>

Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict: FAIL

The job, audience, first action, demo, sandbox, and all 24 listed claims verify.
The review still has one blocking and two minor findings. The shared-header part
of review-1 M3 is only partially fixed, the setup link targets a missing README
section, and a button-like source action does not use a result-naming verb. A
PASS requires zero findings.

## Findings, ordered by severity

### F-4-1 / M3 reopened — BLOCKING: the route header is not one consistent component

**Location and exact difference:** Home and Demo render the `cooldown/proxy`
wordmark with the circular contour SVG. Privacy, Terms, and the product 404
render only the text `cooldown/proxy`; their `.brand` anchors omit the SVG.

Review-1 M3 required “one header/footer component on every product route.”
The navigation, focus behavior, legal links, attribution, and build ID are now
present, but the recognisable product mark is still route-dependent. This is a
half-fix of the earlier consistency finding, so the factory rule reopens it as
blocking.

**Why this matters on first use:** legal and error routes look like reduced
copies of the product shell. A visitor cannot rely on one stable header or
brand affordance while moving between routes.

**Concrete fix:** use the exact Home/Demo brand-anchor markup, including the
same SVG and accessible home label, on Privacy, Terms, and 404. Add a route
test that compares the header brand icon, wordmark, nav destinations, and
accessible names on every route.

### F-4-2 — MINOR: the setup link has a dead destination fragment

**Location and quote:** landing, Configure each package manager:
“Read setup guidance on GitHub” links to
`https://github.com/B-Divyesh/sf-cooldown-registry-proxy#usage`.

The GitHub document returns 200, but the README has no `Usage` heading. Its
relevant heading is `Run the proxy`, so GitHub opens the top of the page rather
than the promised setup section. The current crawler checks HTTP status and
therefore misses dead fragments.

**Concrete fix:** change the target to
`https://github.com/B-Divyesh/sf-cooldown-registry-proxy#run-the-proxy` and add
an anchor-aware link test that checks the destination document contains the
fragment ID.

### F-4-3 — MINOR: the header source action is not a result-naming verb

**Location and quote:** the bordered header action says “Source on GitHub.”
The final landing action says “View source on GitHub,” so the same action also
uses inconsistent wording.

**Why this matters on first use:** the button-like control names a noun and
destination, not the result of activating it. This fails the plain-words
control rule even though the destination itself is honest.

**Concrete fix:** use “View source on GitHub” in the shared header. Keep that
wording everywhere the link is presented as an action.

## Cold first read

No scrolling or interaction occurred before these observations. Both responses
were HTTP 200 and produced no console or page errors.

| Question | 390 × 844 | 1440 × 900 |
| --- | --- | --- |
| What does it do? | Blocks new npm, PyPI, and Cargo packages until their cooldown ends. | Same. The map shows packages stopped at the boundary. |
| For whom? | Platform and security teams controlling laptops and CI. | Same. |
| What should I click first? | **Try it with sample data**; the adjacent line promises one allowed release, one cooldown block, and one advisory block. | Same. |

Exact first-screen text:

> “Block new packages until their cooldown ends.”
>
> “For platform and security teams enforcing one npm, PyPI, and Cargo cooldown
> across laptops and CI.”
>
> “Try it with sample data”
>
> “See an allowed release, a cooldown block, and an advisory block.”

The headline is 7 words and the audience sentence is 16. Privacy, Offline, and
Price facts end at y=675 on mobile and y=854 on desktop, within both initial
viewports. The first-read requirement passes.

## Copy audit

Word counts treat hyphenated identifiers and URLs as one word. Commands inside
backticks retain their space-separated words. Sentence fragments used as facts
or actions are included because a visitor reads them as standalone copy.

### Landing page sentence inventory

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 7 | Block new packages until their cooldown ends. | Pass |
| 2 | 16 | For platform and security teams enforcing one npm, PyPI, and Cargo cooldown across laptops and CI. | Pass |
| 3 | 5 | Try it with sample data. | Pass |
| 4 | 11 | See an allowed release, a cooldown block, and an advisory block. | Pass |
| 5 | 3 | View setup commands. | Pass |
| 6 | 3 | Separate demo data. | Pass |
| 7 | 5 | Demo reloads after one visit. | Pass |
| 8 | 2 | MIT-licensed source. | Pass |
| 9 | 2 | 7-day cooldown. | Pass |
| 10 | 4 | Newer releases stop here. | Pass |
| 11 | 3 | Filters registry lists. | Pass |
| 12 | 3 | Checks direct downloads. | Pass |
| 13 | 3 | Records blocked requests. | Pass |
| 14 | 14 | One proxy checks npm, PyPI, and Cargo requests before packages reach laptops or CI. | Pass |
| 15 | 10 | Use its npm, PyPI, or Cargo URL in client configuration. | Pass |
| 16 | 8 | The proxy compares publish time with your cooldown. | Pass |
| 17 | 3 | Allowed files download. | Pass |
| 18 | 8 | Each blocked package version adds a refusal record. | Pass |
| 19 | 7 | Run the binary on a trusted network. | Pass |
| 20 | 7 | Then point clients at its registry path. | Pass |
| 21 | 5 | Read setup guidance on GitHub. | F-4-2 target |
| 22 | 4 | Example: 7-day cooldown. | Pass |
| 23 | 12 | Private package hosting, user authentication, and code scanning are outside its scope. | Pass |
| 24 | 8 | You operate its network, cache, and refusal log. | Pass |
| 25 | 4 | Read the privacy notice. | Pass |
| 26 | 10 | The isolated sample shows one allowed package and two blocks. | Pass |
| 27 | 5 | Release-age checks for package registries. | Pass |
| 28 | 6 | Built by Param Factory · v0.1.0. | Pass |

No landing sentence exceeds 22 words or contains a banned marketing word.
npm, PyPI, Cargo, proxy, cooldown, advisory, registry, JSONL, and TLS are
necessary domain terms for the named platform/security audience, not alternate
marketing names.

### README sentence inventory

| # | Words | Exact copy | Result |
| ---: | ---: | --- | --- |
| 1 | 7 | Block new packages until their cooldown ends. | Pass |
| 2 | 9 | Cooldown Registry Proxy is for platform and security teams. | Pass |
| 3 | 13 | One Rust binary checks npm, PyPI, and Cargo requests through a network proxy. | Pass |
| 4 | 9 | It filters registry lists and rechecks direct package downloads. | Pass |
| 5 | 9 | Each blocked package version adds one JSONL refusal record. | Pass |
| 6 | 12 | Private package hosting, user authentication, and code scanning are outside its scope. | Pass |
| 7 | 6 | Build the single binary with Cargo. | Pass |
| 8 | 7 | Run the bundled sample from any directory. | Pass |
| 9 | 7 | The command creates a new temporary workspace. | Pass |
| 10 | 13 | It runs the actual proxy paths against bundled npm, PyPI, and Cargo fixtures. | Pass |
| 11 | 13 | The report shows an allowed download, a cooldown block, and an advisory block. | Pass |
| 12 | 11 | It also records cache files and JSONL refusals inside the workspace. | Pass |
| 13 | 16 | The demo does not open configuration, caches, or logs in the directory where you run it. | Pass |
| 14 | 6 | Open https://cooldown-registry-proxy.sociobot.in/?demo=1 for the browser sample. | Pass |
| 15 | 8 | Its state uses a separate `demo:` browser key. | Pass |
| 16 | 8 | The sample reloads offline after the first visit. | Pass |
| 17 | 9 | See `.factory/demo.md` for the sample contract and reset steps. | Pass |
| 18 | 3 | Example proxy command. | Pass |
| 19 | 8 | Use HTTP only on a trusted private network. | Pass |
| 20 | 8 | Add TLS at your ingress for other networks. | Pass |
| 21 | 9 | Each exclusion needs a package version, expiry, and reason. | Pass |
| 22 | 9 | Advisory blocks override exclusions for the same package version. | Pass |
| 23 | 8 | `npm run build` writes the binary to `dist/bin/`. | Pass |
| 24 | 7 | It writes the static site to `dist/site/`. | Pass |
| 25 | 5 | Deploy `dist/site/` as static files. | Pass |
| 26 | 10 | The documentation site loads no analytics or third-party runtime code. | Pass |
| 27 | 11 | The proxy contacts only registry and advisory URLs in its configuration. | Pass |
| 28 | 10 | Cache and refusal files stay in the directory you choose. | Pass |
| 29 | 9 | Refusal records can contain package names, so protect them. | Pass |
| 30 | 6 | Read `SECURITY.md` before reporting a vulnerability. | Pass |
| 31 | 1 | MIT. | Pass |
| 32 | 2 | See `LICENSE`. | Pass |

No README sentence exceeds 22 words or contains a banned marketing word.
All headings make sense in the document outline. Domain terms are used
consistently.

### Heading and control audit

The standalone headings “How requests are checked,” “Point clients at the
proxy,” “Check release age,” “Return a decision,” “Configure each package
manager,” “What the proxy does not do,” and “See three package decisions” are
clear out of context. README headings are also direct.

“Try it with sample data,” “View setup commands,” “Read setup guidance on
GitHub,” “Copy npm config,” “Read the privacy notice,” “Reset demo,” and “Start
for real” use result-naming verbs. The bordered header action “Source on
GitHub” is the sole control failure and is recorded as F-4-3.

Terminology remains consistent: **cooldown** for the release-age rule,
**proxy** for the network service, **blocked by cooldown**, **blocked by
advisory**, and **refusal record** for denial evidence.

## Demo and sandbox verification

| Check | Result and evidence |
| --- | --- |
| One-click entry | Pass. The first-screen action reaches `/demo/` in one click. `/?demo=1` also redirects there. |
| Immediate realistic result | Pass. At both viewports the first demo screen shows `signal-router` blocked by cooldown, `field-notes` allowed, and `vault-door` blocked by advisory. |
| Banner/actions | Pass. “Demo — sample data, nothing is saved,” Reset demo, and Start for real remain visible. |
| Reset | Pass. Changing Minimum release age and resetting restores 7 days and the original three decisions. |
| Browser isolation | Pass. Instrumented reads/writes/removals touched only `demo:cooldown-registry-proxy:policy`; a `real:operator-settings` sentinel remained intact. Exit removed only demo state. |
| Browser network privacy | Pass. The complete Home → Demo → change → outage → reset flow made only same-origin requests. |
| Offline | Pass. After service-worker control, `/demo/` reloaded offline with its h1 and all three samples. |
| CLI sandbox | Pass. The release binary ran `demo` from `/tmp/cooldown-review4-demo.Jc8Hn1`, created `/tmp/cooldown-registry-proxy-demo-7905-1787926789027614616`, and left only `real-sentinel.log` in the invocation directory. |
| CLI result | Pass. It reported npm cooldown/404, PyPI allowed/200, Cargo advisory/451, four refusal records, and five cached files. |

No demo mode operation reached real browser storage or existing CLI files.

## Claims audit

All commands were run individually after `npm ci` from clean local clone
`/tmp/cooldown-review4-clean.MCkUoD`. Each command selected one tagged test.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `cooldown-block` | PASS | Fresh npm version omitted; direct file returned 404. |
| `registry-paths` | PASS | One sample proxy handled npm, PyPI, and Cargo paths. |
| `metadata-filter` | PASS | Cooldown/advisory versions absent; allowed version present. |
| `direct-downloads` | PASS | Sample direct statuses were 404, 200, and 451. |
| `advisory-block` | PASS | Advisory beat the matching active exclusion. |
| `sample-decisions` | PASS | Ordered outcomes were cooldown, allowed, advisory. |
| `refusal-jsonl` | PASS | Twelve production rows covered three registries, metadata/direct paths, and both block reasons with matching request IDs. |
| `cli-demo-workspace` | PASS | Fresh temporary workspace contained policy, report, and three decisions. |
| `cli-demo-isolation` | PASS | File/socket guard denied current-directory access and non-loopback traffic. |
| `local-demo-output` | PASS | Cache, policy, report, and audit paths resolved inside the workspace. |
| `configured-outbound` | PASS | Guard allowed only configured registry/advisory fixture endpoints. |
| `policy-files` | PASS | Required fields rejected invalid input; advisory precedence verified. |
| `unsupported-scope` | PASS | CLI exposed serve, validate, demo; no hosting/auth/scanning feature. |
| `binary-build` | PASS | Release build produced one executable file. |
| `build-dist` | PASS | Nested clean checkout produced `dist/bin` and `dist/site`. |
| `configured-local-output` | PASS | Production cache/refusal data stayed at explicit configured paths. |
| `mit-license` | PASS | LICENSE grant and Cargo metadata matched MIT. |
| `demo-isolation` | PASS | Fresh browser sentinel/reset/exit storage flow passed. |
| `offline-sample` | PASS | Fresh browser demo reloaded with network disabled. |
| `site-privacy` | PASS | Full browser flow used same-origin requests only. |
| `sample-values` | PASS | Seven-day setting, versions, ages, decisions, and advisory ID matched. |
| `terminal-recording` | PASS | SVG names, outcomes, statuses, evidence counts, and workspace wording matched the CLI report. |
| `local-output-sensitive-data` | PASS | Refusal JSONL contained the known npm and Cargo package names. |
| `release-version` | PASS | Footer `v0.1.0` matched Cargo package metadata. |

Every claim-like sentence on the live landing page, Demo, Privacy, Terms, and
README maps to one or more entries above. No unlisted claim or untested claim
was found. Instructions such as “Use HTTP only on a trusted private network”
are operator guidance, not product outcome claims.

## Structure, links, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | Pass. Home is “Cooldown Proxy — block packages that are too new”; Demo, Privacy, Terms, and 404 are route-specific and under 60 characters. |
| Semantics | Pass. Every route has `lang=en`, one h1, one main, ordered headings, and named controls. |
| Metadata | Pass. Every route has a description, canonical, OG/Twitter fields, SVG favicon, 180×180 touch icon, and 1200×630 product social image. |
| 404 | Pass. An unknown URL returns HTTP 404 with the designed map-language page and Home/Demo actions. |
| Deep links/history/focus | Pass. Direct routes load, Back restores scroll, route h1 receives focus, and a polite route announcement is created. |
| Link crawl | Fail only for the fragment in F-4-2. All route/assets and other GitHub destinations return their expected 200/404 statuses. |
| Header/footer | Fail for the inconsistent brand mark in F-4-1. Navigation, Privacy, Terms, Factory credit, and build ID otherwise remain present. |
| Keyboard/touch | Pass. Skip link, range control, links, and buttons work by keyboard; no trap was found. |
| Accessibility scan | Pass. Live Playwright axe scans found zero serious/critical issues on Home, Demo, Privacy, Terms, and 404. |
| Runtime smoke | Pass. `verify-url.sh` recorded 853 ms, no console errors, one h1, main, complete alt text, and named buttons. |
| Security/privacy | Pass. Self-only CSP, frame denial, HSTS, nosniff, Referrer-Policy, and Permissions-Policy are live. |
| Static budget | Pass. Built JS is 5.86 kB raw / 2.57 kB gzip; CSS is 17.71 kB raw. |
| Visual identity | Pass. The dark topographic quarantine map, vermilion checkpoint, clipped controls, and survey labels match `.factory/design.md` and do not resemble a generic SaaS template. |

The generated Home HTML hash matches production exactly. `npm test` passed 7
Rust and 33 Node tests in the clean clone. `npm run build` passed and produced
the documented artifacts.

## Earlier-finding verification

Every prior review, polish report, verification record, and handoff was read.
The checks below use current live behavior plus current source/tests, not prior
status labels.

### Review 3

| Earlier ID | Current result and direct recheck |
| --- | --- |
| F-3-1 / B2 | Fixed. All three decisions end inside both initial demo viewports. |
| F-3-2 / F-2-1 | Fixed. The 12-row production matrix covers every supported block path and request ID. |
| F-3-3 / UC-R23 | Fixed. File/socket/DNS and Storage API interception are active tests. |
| F-3-4 | Fixed. All three facts end within both cold Home viewports. |
| F-3-5 | Fixed. `terminal-recording` is listed and passed. |
| F-3-6 | Fixed. `local-output-sensitive-data` is listed and passed. |
| F-3-7 / UC-R22 | Fixed. Unsupported credential-ownership copy is absent. |

### Review 2

| Earlier ID | Current result and direct recheck |
| --- | --- |
| F-2-1 | Fixed. Refusal wording is version-scoped and production evidence is exhaustive. |
| F-2-2 | Fixed. Clean nested build wrote both documented output paths. |
| F-2-3 | Fixed. Production serve wrote only configured cache/audit paths. |

### Review 1 — product and structure

| Earlier ID | Current result and direct recheck |
| --- | --- |
| B1 | Fixed. Job, audience, action, result, and three facts are in both first viewports. |
| B2 | Fixed. Browser and CLI demos meet entry, sample, banner, reset, exit, and isolation checks. |
| B3 | Fixed. The manifest has 24 unique entries and exactly one tag per entry. |
| B4 | Fixed. Named routes work and unknown paths return the product HTTP 404. |
| B5 | Fixed. Paid offer and dead checkout are absent. |
| M1 | Fixed. Source actions make no versioned-download promise. |
| M2 | Fixed. Route metadata and local social/touch assets are complete. |
| M3 | **Reopened by F-4-1.** Focus/navigation/footer behavior passes, but the route header mark still differs. |
| M4 | Fixed. Limits/privacy precede the final action. |
| M5 | Fixed. Client configuration and cooldown status are labelled examples. |
| m01 | Fixed. “How requests are checked” has exactly three ordered steps. |
| m02 | Fixed. External destinations visibly name GitHub. F-4-2 is a separate fragment defect. |

### Review 1 — copy

| Earlier ID | Current result and direct recheck |
| --- | --- |
| C01 | Fixed: direct verb-first cooldown headline. |
| C02 | Fixed: 16-word sentence names platform/security teams. |
| C03 | Fixed: “View setup commands.” |
| C04 | Fixed: sample-data action names its three results. |
| C05 | Fixed for truthfulness: no nonexistent version is promised. F-4-3 is the new verb-label issue. |
| C06 | Fixed: README audience and mechanism are separate short sentences. |
| C07 | Fixed: metadata, downloads, and refusal behavior are separate sentences. |
| C08 | Fixed: untested deployment-time number is absent. |
| C09 | Fixed: paid and “unlock” copy is absent. |
| C10 | Fixed: “Package release cooldown proxy.” |
| C11 | Fixed: package registries are named directly. |
| C12 | Fixed: network service is consistently “proxy.” |
| C13 | Fixed: states cooldown outcome without clearance metaphor. |
| C14 | Fixed: “Minimum release age.” |
| C15 | Fixed: “Blocked by cooldown” / “Allowed by age.” |
| C16 | Fixed: “How requests are checked.” |
| C17 | Fixed: “Check release age.” |
| C18 | Fixed: “Configure each package manager.” |
| C19 | Fixed: runbook sales copy is absent. |
| C20 | Fixed: “Try the policy” / “See three package decisions.” |
| C21 | Fixed: copy control names the selected package manager. |
| C22 | Fixed: exact MIT fact replaces vague gating copy. |
| C23 | Fixed: subjective size/trust copy is absent. |

### Review 1 — landing claims

| Earlier ID | Current result and direct recheck |
| --- | --- |
| UC-L01 | Fixed: direct tested cooldown headline. |
| UC-L02 | Fixed: exact one-proxy/three-registry claim. |
| UC-L03 | Fixed: clearance metaphor absent. |
| UC-L04 | Fixed: choke-point wording absent. |
| UC-L05 | Fixed: precise separate-demo-data fact. |
| UC-L06 | Fixed: TLS-interception promise absent. |
| UC-L07 | Fixed: immutable-cache promise absent. |
| UC-L08 | Fixed: advisory precedence has a collision test. |
| UC-L09 | Fixed: refusal behavior has exhaustive production evidence. |
| UC-L10 | Fixed: simulator-equivalence wording absent. |
| UC-L11 | Fixed: same-origin privacy wording has interception evidence. |
| UC-L12 | Fixed: seven-day display and remaining time are tested. |
| UC-L13 | Fixed: allowed older sample is tested. |
| UC-L14 | Fixed: `MAL-2026-041` precedence is tested. |
| UC-L15 | Fixed: direct-download behavior is concrete and tested. |
| UC-L16 | Fixed: metadata and direct-download claims are separate. |
| UC-L17 | Fixed: public-registry migration promise absent. |
| UC-L18 | Fixed: package-manager client paths are exercised. |
| UC-L19 | Fixed: broad normal-protocol promise absent. |
| UC-L20 | Fixed: wrapper/plugin promise absent. |
| UC-L21 | Fixed: refreshed-feed promise absent. |
| UC-L22 | Fixed: allowed older release is in both demos/tests. |
| UC-L23 | Fixed: fresh metadata omission/direct 404 are tested. |
| UC-L24 | Fixed: advisory direct 451 is tested. |
| UC-L25 | Fixed: output location and refusals are separate exact claims. |
| UC-L26 | Fixed: untested five-minute number absent. |
| UC-L27 | Fixed: vague ungated wording replaced by MIT licensing. |
| UC-L28 | Fixed: unavailable Operator Pack absent. |
| UC-L29 | Fixed: purchase claim absent. |
| UC-L30 | Fixed: merchant/refund claim absent. |
| UC-L31 | Fixed: license UI absent; demo Storage API access is intercepted. |
| UC-L32 | Fixed: vague free claim replaced by tested MIT fact. |
| UC-L33 | Fixed: unavailable runbook download absent. |
| UC-L34 | Fixed: concrete cooldown behavior replaces slogan. |
| UC-L35 | Fixed: subjective trust wording absent. |
| UC-L36 | Fixed: policy slogan absent. |
| UC-L37 | Fixed: no versioned source promise remains. |
| UC-L38 | Fixed: configuration/status are explicitly examples. |

### Review 1 — README claims

| Earlier ID | Current result and direct recheck |
| --- | --- |
| UC-R01 | Fixed: exact three-registry proxy claim is tested. |
| UC-R02 | Fixed: audience, binary, and registry paths are split and tested. |
| UC-R03 | Fixed: metadata, direct download, and refusal claims are separate. |
| UC-R04 | Fixed: unsupported scope is listed and tested. |
| UC-R05 | Fixed: unsupported Rust-version promise absent. |
| UC-R06 | Fixed: untested container claim absent. |
| UC-R07 | Fixed: serve command is labelled an example. |
| UC-R08 | Fixed: broad non-interactive claim absent. |
| UC-R09 | Fixed: `--json` appears on the exercised validation command. |
| UC-R10 | Fixed: exhaustive-help claim absent. |
| UC-R11 | Fixed: exclusion fields are exact and validated. |
| UC-R12 | Fixed: remote-schema claim absent. |
| UC-R13 | Fixed: advisory/exclusion precedence is tested. |
| UC-R14 | Fixed: documented validation is exercised for valid and invalid files. |
| UC-R15 | Fixed: multi-feed/live-refresh claim absent. |
| UC-R16 | Fixed: metadata omission and refusal recording are separately tested. |
| UC-R17 | Fixed: direct 404/200/451 and request IDs are asserted. |
| UC-R18 | Fixed: stale-cache promise absent. |
| UC-R19 | Fixed: proxy offline-server claim absent; browser offline claim is exact. |
| UC-R20 | Fixed: health/readiness marketing claim absent. |
| UC-R21 | Fixed: outbound interception denies unconfigured traffic. |
| UC-R22 | Fixed: factory credential-ownership claim absent. |
| UC-R23 | Fixed: configured URLs, file reads, and browser storage are intercepted. |

## Missed leverage

No missing AI feature, import/export, or sync finding was identified. The core
decision is deterministic and must remain auditable; model output would weaken
that property. JSON policy files already provide import, JSONL provides export,
and the demo report provides a portable evaluation result. No provider key or
decorative AI feature exists.

## What would make this perfect

Use the exact same marked header on every route, repair the setup fragment, and
rename the header action to “View source on GitHub.” Extend the route test to
compare header markup and extend the link crawler to validate external
fragments. Then rerun the 24 claim commands, clean-clone gates, and live suite.
With those three findings closed, this review identified nothing else to do.
