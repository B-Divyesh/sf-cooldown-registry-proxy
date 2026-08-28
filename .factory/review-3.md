# Adversarial first-read review 3

Date: 2026-08-28

Work order: `cooldown-registry-proxy-review-3`

Repository base: `227950e0ddf64f93cda06b569f6c1c3f76dd8b80`

Live target: <https://cooldown-registry-proxy.sociobot.in>

Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict: FAIL

The landing page is clear and the browser and CLI demos work, but this round
has three blocking findings and four minor findings. The mobile demo does not
show a decision result in its first viewport. Broad operational and privacy
claims also remain unproved by passing tests that do not observe all refusal
paths or all network/file/storage reads. A PASS requires zero findings and no
untested claim.

## Findings, ordered by severity

### F-3-1 / B2 reopened — BLOCKING: the first demo screen does not show the promised decisions

Location and exact copy:

> “Try it with sample data”
>
> “See an allowed release, a cooldown block, and an advisory block.”
>
> Demo h1: “Check three package decisions.”

The one-click route, realistic sample, banner, Reset, and Start for real all
work. The immediate result does not. At 390 × 844, the first result label,
“Blocked by cooldown,” starts at y=864; “Allowed” starts at y=1015 and
“Blocked by advisory” at y=1166. The first viewport shows the banner, h1,
instructions, controls, and only the identity of `signal-router`. It shows no
decision result. At 1440 × 900, only the first decision is fully visible;
“Allowed” begins at y=896 and “Blocked by advisory” at y=988.

Why this blocks acceptance: the demo-sandbox contract requires the first
screen after the click to show the product already being used with sample
data. The page instead requires scrolling to see even one result on a phone.
This reopens review-1 B2, which required the sample to show its value on the
first screen.

Concrete fix: compact the banner, heading, and controls or place a three-result
summary directly below the banner. At 390 × 844, show all three named outcomes
without scrolling. Add a browser test that clicks the landing action and
asserts the bottom edge of “Blocked by cooldown,” “Allowed,” and “Blocked by
advisory” is at or above 844px.

### F-3-2 / F-2-1 reopened — BLOCKING: “Every blocked request” still has only a two-request npm test

Locations and exact copy:

> Landing: “Each blocked request adds a refusal record.”
>
> README: “Every blocked request adds a JSONL refusal record.”
>
> Claim: “Every request blocked by cooldown or advisory adds a JSONL refusal
> record.”

The listed `@claim:refusal-jsonl` command passes. Its production test sends
only two direct npm tarball requests: one cooldown refusal and one advisory
refusal. It does not send refused PyPI or Cargo downloads, and it does not
exercise npm, PyPI, or Cargo metadata filtering through `serve`. A defect in
any unexercised refusal path would leave this universal claim green.

Why this blocks acceptance: review-2 F-2-1 explicitly required “every
supported refusal through `serve`.” The repair moved the test to a production
process but did not cover every supported refusal path, so the earlier finding
is half-fixed. The passing command is not complete evidence for “every.”

Concrete fix: create a production `serve` matrix for npm, PyPI, and Cargo,
covering cooldown and advisory refusals on metadata and direct-download paths.
For every refused version/request, match the response request ID and decision
to exactly one appended JSONL row. If only direct download refusals are meant,
narrow the landing, README, and manifest wording to say so.

### F-3-3 / UC-R23 reopened — BLOCKING: privacy claims are not tested with read/network interception

Locations and exact copy:

> README: “The proxy contacts only registry and advisory URLs in its
> configuration.”
>
> README: “Existing configuration, caches, and logs are never read.”
>
> Privacy: “It never reads or changes a real license, cache, or proxy setting.”

Both listed commands pass, but neither observes the prohibited behavior:

- `@claim:configured-outbound` checks the request paths received by the one
  configured mock registry. It does not deny or record other sockets or DNS
  requests. An additional telemetry connection could occur without failing
  the test, and no configured remote advisory URL is exercised.
- `@claim:cli-demo-isolation` confirms one sentinel file is unchanged and the
  output workspace is elsewhere. It cannot detect a read of that file or of a
  different existing configuration/cache/log path.
- `@claim:demo-isolation` confirms real browser keys remain unchanged. It does
  not record `localStorage.getItem` calls, so it cannot prove the Privacy
  page's broader “never reads” wording.

The browser network path is properly intercepted and passed. The gaps are
storage reads and CLI process traffic/file reads. The sandbox did not provide
`strace`, and unprivileged network namespaces were denied, so the review could
not substitute independent process-level interception for the missing product
tests.

Why this blocks acceptance: these are privacy claims. The claims contract
requires traffic interception, and the demo contract says real data is never
read or written. This reopens review-1 UC-R23's outbound/privacy evidence.

Concrete fix: run the CLI claim tests inside a harness that records or denies
all DNS/socket calls except explicitly configured loopback registries and an
advisory fixture. Trace file opens as well, seed identifiable real config,
cache, license, and log paths, and assert the demo opens none of them. Keep the
existing sentinel and output-path assertions as write-isolation checks. In the
browser test, instrument storage reads and assert that demo mode reads only the
`demo:` key.

### F-3-4 — MINOR: the desktop first screen omits all three plain facts

Location: landing hero at 1440 × 900.

The fact values “Separate demo data,” “Demo reloads after one visit,” and
“MIT-licensed source” begin at y=918, below the 900px viewport. Their labels
begin at y=899 and are clipped at the bottom edge. The same facts are fully
visible at 390 × 844.

Why this is a finding: the required first-screen shape includes three short
privacy, offline, and price facts at both requested widths. The three core
first-read questions still pass, so this is not blocking.

Concrete fix: reduce the desktop hero's vertical padding/type scale or move the
facts alongside the action. Add a 1440 × 900 bounds assertion for all three
fact values, matching the existing mobile assertion.

### F-3-5 — MINOR: the terminal-recording parity claim is unlisted

Location: `/demo/`, terminal figure caption.

> “The recording shows the same output as the bundled command.”

No claim entry or test compares `demo-terminal.svg` with the current CLI demo
output. The `cli-demo-workspace` and `sample-decisions` tests verify the
command, not the recording.

Why this is a finding: a visitor can rely on the recording as a preview of the
binary, so its asserted parity is a claim.

Concrete fix: add a `terminal-recording` claim whose test compares the
recording's package names, decisions, statuses, and workspace wording with a
fresh `cooldown-registry-proxy --json demo` result; or rewrite the caption to
“Example output from the bundled command.”

### F-3-6 — MINOR: the README package-name disclosure is an unlisted claim

Location: README, “Privacy and security.”

> “They can contain package names, so protect that directory.”

No manifest entry asserts that the cache or refusal file contains a package
name. `@claim:refusal-jsonl` currently checks actions and request IDs only.

Why this is a finding: this is useful security guidance, but the claims
contract still requires evidence for the factual reason given.

Concrete fix: add a `local-output-sensitive-data` claim test that makes one
known request and finds its package name in the configured refusal/cache
output, or use the non-claim instruction “Protect cache and refusal files as
operational data.”

### F-3-7 / UC-R22 reopened — MINOR: deployment and credential ownership remain an unlisted README claim

Location: README, “Test, build, and deploy.”

> “The factory deploys the site and owns publishing credentials.”

No claim entry verifies either statement. `@claim:build-dist` ends after local
artifacts are created. This is the retained administrative part of review-1
UC-R22, not evidence produced by that build test.

Why this is a finding: contributors may rely on the sentence when deciding
whether they must publish or handle secrets.

Concrete fix: remove the credential-ownership sentence from public product
documentation, or replace it with a repository-scoped statement such as
“This repository has no publish command,” backed by a manifest/workflow test.

## Cold first read

No scrolling occurred before recording the answers.

| Question | 390 × 844 | 1440 × 900 |
| --- | --- | --- |
| What does it do? | Blocks npm, PyPI, and Cargo packages until their cooldown ends. | Same. |
| For whom? | Platform and security teams controlling laptops and CI. | Same. |
| What should I click first? | “Try it with sample data”; the adjacent note promises one allow and two kinds of block. | Same. |

Exact first-screen copy:

> “Block new packages until their cooldown ends.”
>
> “For platform and security teams enforcing one npm, PyPI, and Cargo cooldown
> across laptops and CI.”
>
> “Try it with sample data”
>
> “See an allowed release, a cooldown block, and an advisory block.”

The headline is seven words, the audience sentence is 16 words, and the action
is unambiguous. The three required questions pass. F-3-4 records the separate
desktop fact-placement defect.

## Copy audit

Word-count method: URLs and file paths count as one word; hyphenated terms
count as one; punctuation-only tokens do not count. Code blocks are commands,
not prose sentences. There are no sentences over 22 words and no banned
marketing adjectives. `npm`, `PyPI`, `Cargo`, `registry`, `proxy`, `JSONL`,
`TLS`, and `fixture` are appropriate technical terms for the named audience.

### Landing page sentence inventory

| # | Words | Exact copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 7 | Block new packages until their cooldown ends. | — |
| 2 | 16 | For platform and security teams enforcing one npm, PyPI, and Cargo cooldown across laptops and CI. | — |
| 3 | 5 | Try it with sample data. | — |
| 4 | 11 | See an allowed release, a cooldown block, and an advisory block. | F-3-1 outcome not visible in the next phone viewport |
| 5 | 3 | View setup commands. | — |
| 6 | 3 | Separate demo data. | F-3-4 desktop placement |
| 7 | 5 | Demo reloads after one visit. | F-3-4 desktop placement |
| 8 | 2 | MIT-licensed source. | F-3-4 desktop placement |
| 9 | 2 | 7-day cooldown. | — |
| 10 | 4 | Newer releases stop here. | — |
| 11 | 3 | Filters registry lists. | — |
| 12 | 3 | Checks direct downloads. | — |
| 13 | 3 | Records blocked requests. | — |
| 14 | 14 | One proxy checks npm, PyPI, and Cargo requests before packages reach laptops or CI. | — |
| 15 | 10 | Use its npm, PyPI, or Cargo URL in client configuration. | — |
| 16 | 8 | The proxy compares publish time with your cooldown. | — |
| 17 | 3 | Allowed files download. | — |
| 18 | 7 | Each blocked request adds a refusal record. | F-3-2 |
| 19 | 7 | Run the binary on a trusted network. | — |
| 20 | 7 | Then point clients at its registry path. | — |
| 21 | 5 | Read setup guidance on GitHub. | — |
| 22 | 3 | Example: 7-day cooldown. | — |
| 23 | 12 | Private package hosting, user authentication, and code scanning are outside its scope. | — |
| 24 | 8 | You operate its network, cache, and refusal log. | — |
| 25 | 4 | Read the privacy notice. | — |
| 26 | 10 | The isolated sample shows one allowed package and two blocks. | F-3-1 placement |
| 27 | 5 | Release-age checks for package registries. | — |
| 28 | 5 | Built by Param Factory · v0.1.0. | — |

### README sentence inventory

| # | Words | Exact copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 7 | Block new packages until their cooldown ends. | — |
| 2 | 9 | Cooldown Registry Proxy is for platform and security teams. | — |
| 3 | 13 | One Rust binary checks npm, PyPI, and Cargo requests through a network proxy. | — |
| 4 | 9 | It filters registry lists and rechecks direct package downloads. | — |
| 5 | 8 | Every blocked request adds a JSONL refusal record. | F-3-2 |
| 6 | 12 | Private package hosting, user authentication, and code scanning are outside its scope. | — |
| 7 | 6 | Build the single binary with Cargo. | — |
| 8 | 7 | Run the bundled sample from any directory. | — |
| 9 | 7 | The command creates a new temporary workspace. | — |
| 10 | 13 | It runs the actual proxy paths against bundled npm, PyPI, and Cargo fixtures. | — |
| 11 | 13 | The report shows an allowed download, a cooldown block, and an advisory block. | — |
| 12 | 11 | It also records cache files and JSONL refusals inside the workspace. | — |
| 13 | 8 | Existing configuration, caches, and logs are never read. | F-3-3 |
| 14 | 6 | Open https://cooldown-registry-proxy.sociobot.in/?demo=1 for the browser sample. | — |
| 15 | 8 | Its state uses a separate `demo:` browser key. | — |
| 16 | 8 | The sample reloads offline after the first visit. | — |
| 17 | 9 | See `.factory/demo.md` for the sample contract and reset steps. | — |
| 18 | 3 | Example proxy command. | — |
| 19 | 8 | Use HTTP only on a trusted private network. | — |
| 20 | 8 | Add TLS at your ingress for other networks. | Technical instruction; acceptable for the audience |
| 21 | 9 | Each exclusion needs a package version, expiry, and reason. | — |
| 22 | 9 | Advisory blocks override exclusions for the same package version. | — |
| 23 | 8 | `npm run build` writes the binary to `dist/bin/`. | — |
| 24 | 7 | It writes the static site to `dist/site/`. | — |
| 25 | 9 | The factory deploys the site and owns publishing credentials. | F-3-7 |
| 26 | 10 | The documentation site loads no analytics or third-party runtime code. | — |
| 27 | 11 | The proxy contacts only registry and advisory URLs in its configuration. | F-3-3 |
| 28 | 10 | Cache and refusal files stay in the directory you choose. | — |
| 29 | 9 | They can contain package names, so protect that directory. | F-3-6 |
| 30 | 6 | Read `SECURITY.md` before reporting a vulnerability. | — |
| 31 | 1 | MIT. | — |
| 32 | 2 | See `LICENSE`. | — |

### Headings, terminology, and controls

All landing headings and eyebrow labels make sense out of context: “Package
release cooldown proxy,” “Request path,” “How requests are checked,” “Point
clients at the proxy,” “Check release age,” “Return a decision,” “Self-hosted
setup,” “Configure each package manager,” “Limits and privacy,” “What the
proxy does not do,” “Try the policy,” and “See three package decisions.”
README headings are “Install,” “Try the isolated sample,” “Run the proxy,”
“npm,” “pip and uv,” “Cargo,” “Policy files,” “Test, build, and deploy,”
“Privacy and security,” and “License.” None requires a rewrite.

The landing controls use result-naming verbs: “Try it with sample data,” “View
setup commands,” “Copy npm config,” “Read the privacy notice,” and “View source
on GitHub.” Navigation links name destinations. The demo uses the contract's
required “Reset demo” and “Start for real.” Terminology remains consistent:

| Concept | Public term |
| --- | --- |
| Release-age rule | cooldown |
| Network service | proxy |
| Age refusal | blocked by cooldown |
| Security refusal | blocked by advisory |
| Denial evidence | refusal record / JSONL refusal record |

## Demo and sandbox verification

| Check | Result | Evidence |
| --- | --- | --- |
| One-click landing action | PASS | Primary action navigated directly to `/demo/`. |
| Realistic sample exists | PASS | npm `signal-router` 4.8.0, PyPI `field-notes` 2.3.1, Cargo `vault-door` 0.9.6. |
| Value visible in first demo viewport | **BLOCKING FAIL** | No result at 390 × 844; only one result at 1440 × 900. See F-3-1. |
| Persistent banner | PASS | “Demo — sample data, nothing is saved.” remained visible after scrolling. |
| Reset | PASS | Changed cooldown 7 → 14; Reset restored 7. |
| Start for real | PASS | Returned home and deleted only `demo:cooldown-registry-proxy:policy`. |
| Browser real-data isolation | PASS | `real:sentinel` and `cooldown-registry-proxy:real-config` remained unchanged. |
| Browser network privacy | PASS | Complete landing → demo → reset → exit flow made only same-origin requests. |
| Offline reload | PASS | Live Playwright test reloaded `/demo/` with three samples after network disable. |
| CLI demo in temp directory | PASS | Exit 0; generated one allow, cooldown 404, advisory 451, report, cache, and four refusal rows. |
| CLI write isolation | PASS | A sentinel in the invocation directory remained unchanged; output was under a unique `/tmp/cooldown-registry-proxy-demo-*` workspace. |
| Read/network interception | **BLOCKING UNTESTED** | Existing tests do not trace browser storage reads or all CLI file/socket access. See F-3-3. |

## Claims verification

Clean clone: `/tmp/cooldown-review3-clean.ghnajR` at the requested base.
Every command in `.factory/claims.json` was run separately. All 22 commands
exited successfully and each selected one tagged test.

| Claim ID | Command result | Scope result |
| --- | --- | --- |
| `cooldown-block` | PASS | Proves sample npm metadata omission and direct 404. |
| `registry-paths` | PASS | Proves all three demo handler paths. |
| `metadata-filter` | PASS | Proves the three sample metadata outcomes. |
| `direct-downloads` | PASS | Proves sample statuses 404, 200, and 451. |
| `advisory-block` | PASS | Proves advisory precedence over one active exclusion. |
| `sample-decisions` | PASS | Proves one allow and two distinct blocks. |
| `refusal-jsonl` | PASS command | Incomplete universal evidence; F-3-2. |
| `cli-demo-workspace` | PASS | Proves unique workspace and three decisions. |
| `cli-demo-isolation` | PASS command | Proves no write to one sentinel, not “never reads”; F-3-3. |
| `local-demo-output` | PASS | Proves policy, cache, report, and log paths stay under the workspace. |
| `configured-outbound` | PASS command | Mock receipt is not complete process interception; F-3-3. |
| `policy-files` | PASS | Proves required fields and advisory precedence. |
| `unsupported-scope` | PASS | Confirms the CLI command surface omits the named unsupported features. |
| `binary-build` | PASS | Produces the release executable. |
| `build-dist` | PASS | Fresh nested clone produces both required `dist/` outputs. |
| `configured-local-output` | PASS | Production `serve` writes to explicit cache/audit paths and not default `data/`. |
| `mit-license` | PASS | LICENSE grant and Cargo metadata match. |
| `demo-isolation` | PASS command | Browser key/reset/write isolation pass; real-key reads are not observed under the broader Privacy wording; F-3-3. |
| `offline-sample` | PASS | Browser demo reloads offline. |
| `site-privacy` | PASS | Browser flow is same-origin only. |
| `sample-values` | PASS | Browser names, ages, decisions, cooldown, and advisory ID match. |
| `release-version` | PASS | Footer v0.1.0 matches Cargo metadata. |

No command failed. F-3-2 and F-3-3 are blocking because a green command does
not cover the full public wording. F-3-5 through F-3-7 identify claim-like
sentences without exact manifest entries.

## Structure, links, accessibility, privacy, and identity

| Check | Result |
| --- | --- |
| Home title | PASS: “Cooldown Proxy — block packages that are too new” (51 characters). |
| Route titles | PASS: Demo, Privacy, Terms, and 404 use route-specific titles. |
| Metadata | PASS: descriptions, canonicals, OG/Twitter, social image, SVG favicon, touch icon, lang and theme color are present. |
| Semantic structure | PASS: one h1 and one main on each product route; heading order passed axe/browser checks. |
| Deep links | PASS: `/demo`, `/privacy`, `/terms`, slash variants, reload, and direct entry return 200. |
| Back/focus/announcement | PASS: route h1 receives focus; Back restores home scroll and h1 focus; live region exists. |
| Designed 404 | PASS: unknown route returns HTTP 404 with product title, h1, shared shell, and return actions. |
| Link crawl | PASS: all internal targets/fragments and GitHub destinations returned 200; the current-page 404 skip link correctly remains on the 404 response. |
| Header/footer | PASS: shared navigation, Privacy, Terms, Factory credit, and v0.1.0 appear on all routes. |
| Accessibility | PASS with one layout finding: four route axe scans and the 404 scan found zero serious/critical issues; keyboard and focus checks passed. |
| Reduced motion | PASS: animation/transition and smooth scrolling are disabled under `prefers-reduced-motion`. |
| Browser privacy | PASS: same-origin runtime only, no analytics or third-party scripts/fonts. |
| Security headers | PASS: self-only CSP, HSTS, DENY framing, nosniff, Referrer-Policy, and restrictive Permissions-Policy. |
| Build budget | PASS: JS 5.58 kB raw / 2.49 kB gzip; CSS 16.38 kB raw / 4.27 kB gzip. |
| Visual identity | PASS: dark survey-map palette, clipped geometry, vermilion boundary, and original topographic art are product-specific rather than a generic SaaS template. |

The live HTML, JS, and CSS hashes match the clean local build. The live smoke
test loaded in 567ms with no console errors, one h1, `lang=en`, a main
landmark, no missing alt text, and no unnamed buttons. F-3-4 records the one
first-screen structure defect.

## Earlier-finding verification

Every earlier review and polish report plus the prior handoff was read. The
checks below use the current live site and current source/tests, not the prior
status labels.

### Review 1 blocking, major, and minor findings

| Earlier ID | Current result |
| --- | --- |
| B1 | Fixed for the three first-read questions and at 390px. The new desktop fact-placement issue is F-3-4. |
| B2 | **Reopened by F-3-1**: route/isolation/reset/CLI work, but the first phone viewport shows no decision result. |
| B3 | Fixed: manifest exists with 22 unique tagged commands; coverage defects are separately recorded in F-3-2/F-3-3. |
| B4 | Fixed: Demo deep link and product 404 return the correct status and shell. |
| B5 | Fixed: paid offer and dead checkout remain absent. |
| M1 | Fixed: action says “View source on GitHub” and resolves. |
| M2 | Fixed: titles and complete route metadata/assets are live. |
| M3 | Fixed: shared shell, route announcement, focus, and Back scroll work. |
| M4 | Fixed: limits/privacy section precedes the final action. |
| M5 | Fixed: static configuration is labeled as an example. |
| m01 | Fixed: request explanation has three steps. |
| m02 | Fixed: external destinations visibly name GitHub. |

### Review 1 copy findings

| Earlier ID | Current verification |
| --- | --- |
| C01 | Fixed: direct seven-word verb-first headline. |
| C02 | Fixed: 16-word sentence names platform/security teams. |
| C03 | Fixed: “View setup commands.” |
| C04 | Fixed copy; its promised next-screen placement fails under F-3-1. |
| C05 | Fixed: “View source on GitHub.” |
| C06 | Fixed: README user and mechanism are split. |
| C07 | Fixed copy split; refusal evidence breadth fails separately under F-3-2. |
| C08 | Fixed: “Five-minute deployment” absent. |
| C09 | Fixed: paid/unlock wording absent. |
| C10 | Fixed: “Package release cooldown proxy.” |
| C11 | Fixed: public copy names npm, PyPI, Cargo, or package registries. |
| C12 | Fixed: behavior copy consistently says proxy. |
| C13 | Fixed: age result says blocked by cooldown/cooldown ends. |
| C14 | Fixed: “Minimum release age.” |
| C15 | Fixed: sample states use “Blocked by cooldown” and “Allowed by age.” |
| C16 | Fixed: “How requests are checked.” |
| C17 | Fixed: “Check release age.” |
| C18 | Fixed: “Configure each package manager.” |
| C19 | Fixed: sales heading absent. |
| C20 | Fixed: “Try the policy” / “See three package decisions.” |
| C21 | Fixed: copy control names the selected manager. |
| C22 | Fixed: tested MIT fact replaces vague free-tier language. |
| C23 | Fixed: subjective size/trust wording absent. |

### Review 1 landing claim findings

| Earlier ID | Current verification |
| --- | --- |
| UC-L01 | Fixed: direct cooldown headline and tagged test. |
| UC-L02 | Fixed: narrowed one-proxy/three-path claim and tagged test. |
| UC-L03 | Fixed: clearance metaphor absent. |
| UC-L04 | Fixed: choke-point copy absent. |
| UC-L05 | Fixed: privacy fact maps to browser traffic test. |
| UC-L06 | Fixed: TLS-interception promise absent. |
| UC-L07 | Fixed: immutable-cache marketing claim absent. |
| UC-L08 | Fixed: advisory precedence fixture/test passes. |
| UC-L09 | **Reopened through F-3-2**: production JSONL test does not cover every supported refusal path. |
| UC-L10 | Fixed: exact-simulator-equivalence wording absent. |
| UC-L11 | Fixed: zero-request wording replaced with tested same-origin wording. |
| UC-L12 | Fixed: seven-day sample value is tested. |
| UC-L13 | Fixed: allowed-by-age sample is tested. |
| UC-L14 | Fixed: MAL-2026-041 precedence is tested. |
| UC-L15 | Fixed: direct download behavior is tested. |
| UC-L16 | Fixed: metadata/direct behavior split and tested. |
| UC-L17 | Fixed: public-registry retention promise absent. |
| UC-L18 | Fixed: setup uses explicit client proxy URLs. |
| UC-L19 | Fixed: broad normal-protocol promise absent. |
| UC-L20 | Fixed: wrapper/plugin promise absent. |
| UC-L21 | Fixed: live refreshed-feed promise absent. |
| UC-L22 | Fixed: old allowed sample tested. |
| UC-L23 | Fixed: sample metadata omission/direct 404 tested. |
| UC-L24 | Fixed: sample advisory 451 tested. |
| UC-L25 | Fixed for output paths; universal refusal breadth fails under F-3-2. |
| UC-L26 | Fixed: untested timing number absent. |
| UC-L27 | Fixed: vague ungated wording absent. |
| UC-L28 | Fixed: unavailable paid bundle absent. |
| UC-L29 | Fixed: purchase claim absent. |
| UC-L30 | Fixed: merchant/refund claim absent. |
| UC-L31 | Fixed: license UI absent and demo key is separate. |
| UC-L32 | Fixed: precise MIT statement used. |
| UC-L33 | Fixed: Operator Pack promise absent. |
| UC-L34 | Fixed: concrete cooldown behavior replaces slogan. |
| UC-L35 | Fixed: subjective trust wording absent. |
| UC-L36 | Fixed: slogan replaced by observable behavior. |
| UC-L37 | Fixed: honest GitHub source action. |
| UC-L38 | Fixed: terminal configuration/status labeled as examples. |

### Review 1 README claim findings

| Earlier ID | Current verification |
| --- | --- |
| UC-R01 | Fixed: one-proxy/three-path claim is tested. |
| UC-R02 | Fixed: audience, binary, and paths are split; TLS-certificate promise absent. |
| UC-R03 | Fixed copy split; universal refusal breadth fails under F-3-2. |
| UC-R04 | Fixed: unsupported scope is explicit and tested. |
| UC-R05 | Fixed: Rust-version claim absent. |
| UC-R06 | Fixed: untested container claim absent. |
| UC-R07 | Fixed: command labeled as an example; durations unit-tested. |
| UC-R08 | Fixed: broad non-interactive claim absent. |
| UC-R09 | Fixed: validation JSON path is exercised. |
| UC-R10 | Fixed: exhaustive-help claim absent. |
| UC-R11 | Fixed: exclusion fields tested. |
| UC-R12 | Fixed: remote-schema claim absent. |
| UC-R13 | Fixed: advisory precedence tested. |
| UC-R14 | Fixed: validation command tested on valid/invalid files. |
| UC-R15 | Fixed: multi-feed/live-refresh copy absent. |
| UC-R16 | Fixed metadata split; universal refusal breadth fails under F-3-2. |
| UC-R17 | Fixed for sample statuses and npm request IDs; broader refusal coverage is F-3-2. |
| UC-R18 | Fixed: stale-cache claim absent. |
| UC-R19 | Fixed: proxy offline-server claim absent; browser offline claim tested. |
| UC-R20 | Fixed: health/readiness marketing copy absent. |
| UC-R21 | Fixed: demo mock receives the expected configured registry requests; process-wide privacy is F-3-3. |
| UC-R22 | **Reopened by F-3-7**: deployment/credential ownership remains unlisted. |
| UC-R23 | **Reopened by F-3-3**: configured-mock receipt is not process-wide network interception. |

### Review 2 findings

| Earlier ID | Current result |
| --- | --- |
| F-2-1 | **Reopened by F-3-2**: production process added, but only two npm direct refusals are checked. |
| F-2-2 | Fixed: clean nested clone builds `dist/bin/cooldown-registry-proxy` and `dist/site/index.html`. |
| F-2-3 | Fixed: production `serve` uses explicit cache/audit paths and does not create default `data/`. |

## Quality-gate evidence

- All 22 manifest commands: command PASS from the clean clone.
- `npm test`: PASS, 7 Rust tests and 30 Node tests.
- `npm run build`: PASS; binary and static site written under `dist/`.
- Live Playwright, excluding the old screenshot-only test: PASS, 12/12.
- Axe integration: zero serious/critical findings on Home, Demo, Privacy,
  Terms, and the designed 404.
- Live route probe: all named routes/assets returned 200; unknown route returned
  the designed HTTP 404.
- All crawled internal fragments and GitHub destinations resolved.
- Live/local build hashes matched for every HTML route and generated JS/CSS.

These green gates do not override F-3-1 through F-3-3.

## Missed leverage

No AI feature is warranted. Cooldown and advisory decisions must be
deterministic, auditable, and offline-capable; model inference would weaken the
core job. No provider keys or decorative AI feature are present. The brief's
obvious import/output needs are already covered by JSON policy files, remote
advisory configuration, JSONL refusals, and the JSON demo report. No separate
missed-leverage finding was identified.

## What would make this perfect

1. Put all three sample decisions in the first 390 × 844 demo viewport and
   enforce their bounds in a click-through test.
2. Exercise every production refusal path before retaining “every blocked
   request.”
3. Add browser storage-read and CLI process file/network interception for the
   privacy claims, including configured advisory traffic.
4. Fit the three hero facts inside the 1440 × 900 first screen.
5. Test or remove the terminal-recording parity, package-name disclosure, and
   factory credential-ownership statements.
6. Rerun every claim command from a clean clone and repeat the cold live audit.

Until all six items leave zero findings, the required verdict remains FAIL.
