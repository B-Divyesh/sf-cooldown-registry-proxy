# Adversarial first-read review 1

Date: 2026-08-28

Work order: cooldown-registry-proxy-review-1

Repository base: e8db3ea53f3e8634c4d391a87b5af391d506e73d

Live target: https://cooldown-registry-proxy.sociobot.in

Viewports: 390 × 844 and 1440 × 900, each in a fresh Chromium context

## Verdict: FAIL

The review found five blocking failures: the first screen does not identify the
intended user or a clear first action; the required web and CLI demo contracts
do not exist; the claims manifest and tagged claim tests do not exist; the
required demo route and designed 404 are broken; and the paid purchase action
returns HTTP 404. The live site also has more than three non-blocking findings.

## Findings, ordered by severity

### B1 — BLOCKING: the first screen does not answer all three first-read questions

Quoted first-screen copy:

> “New dependencies wait at the boundary.”
>
> “One self-hosted binary enforces a release cooldown for npm, PyPI, and
> Cargo—across every laptop and CI runner behind it.”
>
> “Deploy the proxy” / “Test the policy”

Cold read, before scrolling:

| Question | 390 px | Desktop |
| --- | --- | --- |
| What does it do? | A self-hosted proxy delays new npm, PyPI, and Cargo releases before laptops and CI can install them. | Same answer; the map reinforces a boundary. |
| For whom? | Cannot confirm. “Every laptop and CI runner” describes coverage, not the platform/security operator named in the brief. | Cannot confirm for the same reason. |
| What should I click first? | Cannot confirm. Orange “Deploy the proxy” is primary, while “Test the policy” is secondary; neither explains the next result. | Cannot confirm for the same reason. |

At 390 px, the value “None” under the third fact, “Telemetry,” begins below the
844 px viewport. The three fact labels are Ecosystems, Policy point, and
Telemetry; they do not cover the required privacy, offline, and price facts.

Why this loses a first-time visitor: the headline uses the boundary metaphor
instead of naming the job, the intended operator is absent, and evaluation is
visually subordinate to deployment.

Concrete fix:

- Headline: “Block new packages until their cooldown ends.”
- Supporting sentence: “For platform and security teams enforcing one npm,
  PyPI, and Cargo policy across laptops and CI.”
- Primary action: “Try it with sample data.”
- Adjacent outcome: “See an allowed release, a cooldown block, and a malware
  block.”
- Make setup secondary: “View setup commands.”

### B2 — BLOCKING: there is no isolated one-click demo for this CLI product

Quote:

> “Test the policy”

Observed after clicking:

- The URL becomes only /#demo.
- The first 390 px screen after the click shows two realistic sample rows:
  signal-router and field-notes. This is useful sample content.
- The required “Demo — sample data, nothing is saved” banner count is 0.
- “Reset demo” count is 0.
- “Start for real” count is 0.
- The slider and outage switch change the three sample decisions, but there is
  no reset control or separate demo state.
- /demo returns HTTP 404 instead of a directly loadable demo.
- .factory/demo.md is absent.
- In a temporary directory, both CLI entry points fail:
  cooldown-registry-proxy demo exits 2 with “unrecognized subcommand 'demo'”;
  cooldown-registry-proxy --demo exits 2 with “unexpected argument '--demo'”.
- The site has no self-hosted terminal recording of the real binary.

The widget made zero network requests during slider/outage interaction and
wrote no localStorage, sessionStorage, or IndexedDB data in a fresh context.
That is a narrow pass for the widget, not an isolated demo pass. The same page
reads the real sb_license:cooldown-registry-proxy key on load. With a sentinel
value preloaded, the page attempted a request to
api.sociobot.in/api/v1/products/cooldown-registry-proxy/verify before entering
/#demo. There is no demo namespace that prevents real state from being read or
updated.

Why this misleads a visitor: “Test the policy” looks like a demo, but it cannot
be opened at a verifier URL, reset, distinguished from real state, or used to
run the shipped CLI’s actual network behavior.

Concrete fix: add a first-screen “Try it with sample data” link to /demo; give
that route the persistent banner, “Reset demo,” and “Start for real”; isolate
all state under demo: keys and skip license initialization there. Add a
cooldown-registry-proxy demo command that creates a temporary sample
workspace, runs the real proxy against bundled examples, prints its path, and
leaves real config/cache/logs untouched. Add a self-hosted recording of that
command and document all of this in .factory/demo.md.

### B3 — BLOCKING: no claim can be verified through the required claims contract

.factory/claims.json is absent in both the working tree and a clean clone at
the requested base. A repository search finds no @claim: tags. Therefore
there were zero listed claim commands to run, and every claim-like sentence
on the live landing page and in README is unlisted. Passing general tests does
not provide the one-claim/one-test traceability required by the claims
contract.

Why this misleads a visitor: the page makes operational, privacy, response-code,
cache, audit, paid-entitlement, and quantitative claims without a maintained
way to prove each observable result.

Concrete fix: create .factory/claims.json; give every retained claim below one
entry and one matching @claim test; run those tests only through the CLI demo
and bundled local registries in a fresh temporary directory. Split sentences
that currently make several claims so each maps to one test.

The following are the live-page unlisted-claim findings. Each quoted item needs
the stated observable test or removal.

| ID | Exact live copy | Required test |
| --- | --- | --- |
| UC-L01 | “New dependencies wait at the boundary.” | A fresh version is unavailable until the configured cooldown elapses. |
| UC-L02 | “One self-hosted binary enforces a release cooldown for npm, PyPI, and Cargo—across every laptop and CI runner behind it.” | Real npm, pip/uv, and Cargo clients all receive the same decision through one demo proxy. |
| UC-L03 | “Releases cross only after policy clearance” | A blocked fixture becomes available only when its age meets the policy. |
| UC-L04 | “One network choke point” | Multiple configured clients use one proxy address and cannot obtain the fresh fixtures through it. |
| UC-L05 | “Telemetry / None” | Intercept proxy and site traffic and assert only configured upstreams and same-origin assets. |
| UC-L06 | “No TLS interception” | Run real clients without installing a proxy CA and confirm normal registry protocol behavior. |
| UC-L07 | “Immutable artifact cache” | Cache an artifact, mutate the mock upstream, and confirm the cached bytes and digest do not change. |
| UC-L08 | “Advisory blocks win” | Give one version both an exclusion and advisory; assert HTTP 451. |
| UC-L09 | “JSONL refusal trail” | Cause each refusal type and assert one complete JSONL record per refusal. |
| UC-L10 | “This local simulation shows exactly what package managers see.” | Compare every simulator decision and message with the real demo proxy fixtures. |
| UC-L11 | “No request leaves your browser.” | Intercept the complete simulator flow and assert zero requests after the demo loads. |
| UC-L12 | “7d until this version crosses the contour.” | Fix the clock and assert the displayed remaining duration. |
| UC-L13 | “Older than the active cooldown.” | Fix the clock and assert the ten-day fixture is allowed under seven days. |
| UC-L14 | “Advisory MAL-2026-041 wins over age and exclusions.” | Seed that advisory plus an exclusion and assert the hard block. |
| UC-L15 | “Direct URLs do not bypass the boundary.” | Request a fresh artifact URL directly and assert the cooldown refusal. |
| UC-L16 | “Every tarball or crate download is checked again against current publish time, exclusions, and advisory blocks.” | Exercise direct npm, PyPI, and Cargo files against all three policy inputs. |
| UC-L17 | “Keep your existing public registries.” | Configure mock public upstreams and confirm clients need no replacement repository. |
| UC-L18 | “Change one registry URL at the organization edge.” | Run each documented client using only the proxy URL change. |
| UC-L19 | “npm, pip, uv, and Cargo speak their normal registry protocols.” | Run all four real clients against the demo server. |
| UC-L20 | “No wrapper or local plugin.” | Assert the real-client tests install no product wrapper or plugin. |
| UC-L21 | “Publish time, a live exclusion file, and refreshed advisory feeds resolve to one decision.” | Change each input independently and assert the resulting decision. |
| UC-L22 | “Old releases pass.” | Assert an old fixture downloads successfully. |
| UC-L23 | “Young versions disappear or return 404.” | Assert metadata omission and direct HTTP 404 for a young fixture. |
| UC-L24 | “Known malware returns 451.” | Assert advisory-listed metadata/artifact access returns HTTP 451. |
| UC-L25 | “Artifacts cache on disk and every refusal lands in an append-only JSONL audit trail.” | Restart the demo with its temp directory and verify cache persistence and appended audit rows. |
| UC-L26 | “Five-minute deployment” | Time a documented clean deployment and assert completion within five minutes, or remove the number. |
| UC-L27 | “The proxy remains fully open and ungated.” | Exercise every safety feature with no license present. |
| UC-L28 | “A one-time $49 Operator Pack unlocks the hardened ingress checklist, SIEM mappings, incident-response runbook, and hosted-dashboard early access.” | Complete a sandbox license flow and assert every named deliverable; replace “unlocks” with “includes.” |
| UC-L29 | “One-time purchase.” | Verify the sandbox checkout amount and absence of recurring billing. |
| UC-L30 | “Sociobot/Dodo is the merchant of record and handles refunds; refunded licenses are revoked automatically.” | Use billing sandbox fixtures to assert merchant display, refund handling, and revoked verification. |
| UC-L31 | “No license stored.” | In a fresh context, assert both license keys are absent. |
| UC-L32 | “The full proxy remains free.” | Run all proxy safety paths without a license. |
| UC-L33 | “Download the production runbook for ingress hardening, SIEM fields, incident response, and rollout checks.” | With a sandbox-valid license, assert the download contains every named section. |
| UC-L34 | “Make ‘too new’ unreachable.” | Assert metadata and direct artifact paths both block a fresh fixture. |
| UC-L35 | “Open source, self-hosted, and small enough to understand before you trust it.” | Test the build/self-host path and replace the subjective “small enough” phrase with a measurable statement. |
| UC-L36 | “Dependency age is a policy, not a suggestion.” | Replace this slogan with a concrete tested behavior, such as direct downloads receive HTTP 404 while blocked. |
| UC-L37 | “Get v0.1.0 on GitHub” | Assert a v0.1.0 tag or release asset exists and the action lands on it. |
| UC-L38 | “registry.internal · policy active · 7d” | Connect the display to the isolated demo and assert live health/policy state, or relabel it as an example. |

The following README sentences are also unlisted claims:

| ID | Exact README copy | Required test |
| --- | --- | --- |
| UC-R01 | “Put one enforceable waiting period between public package registries and every developer or CI runner.” | Real-client end-to-end test through one demo proxy. |
| UC-R02 | “cooldown-registry-proxy is a self-hosted Rust binary for teams that want new npm, PyPI, and crates.io releases to age before installation—without trusting per-developer settings or installing a TLS interception certificate.” | Release-binary plus npm/PyPI/Cargo client test with no proxy CA or per-developer helper. |
| UC-R03 | “It filters registry metadata, re-checks direct artifact requests, caches immutable package files, supports time-limited emergency exclusions, consumes a simple advisory blocklist feed, and records every refusal as JSONL.” | Split into six claims and test each observable output. |
| UC-R04 | “It does not host private packages, authenticate users, scan code, or claim to replace a full artifact repository.” | Boundary test/documentation check for unsupported private/auth/scanning paths. |
| UC-R05 | “Build the single binary with Rust 1.85 or newer:” | CI build matrix starting at Rust 1.85. |
| UC-R06 | “Or build and run the container:” | Build the image and check health through the documented Compose path. |
| UC-R07 | “Start a seven-day policy on port 8787:” | Run the exact command and assert listen address and 604800-second cooldown. |
| UC-R08 | “The process is intentionally non-interactive and exits non-zero for invalid configuration.” | Run invalid configurations without a TTY and assert non-zero exit. |
| UC-R09 | “Add --json for machine-readable startup and validation output.” | Parse every --json command result as JSON. |
| UC-R10 | “cooldown-registry-proxy --help documents every command.” | Compare help output with the command tree. |
| UC-R11 | “Exclusions are explicit, version-specific, expire automatically, and require an operator reason:” | Fixed-clock validation for scope, expiry, and required reason. |
| UC-R12 | “Advisory files and remote --advisory-url feeds share one deliberately small schema.” | Validate the same fixtures through local and remote inputs; remove subjective “deliberately small.” |
| UC-R13 | “A hard block always wins over an exclusion:” | Advisory/exclusion collision returns HTTP 451. |
| UC-R14 | “Use cooldown-registry-proxy validate --exclusions ... --advisories ... --json in CI before deploying a policy change.” | Run the exact command on valid and invalid fixtures and parse its exit/output. |
| UC-R15 | “Multiple --advisory-url options may point at internally curated OSV/GitHub Advisory exports; feeds refresh without a restart.” | Serve multiple local feeds, update them, and assert live refresh without process restart. |
| UC-R16 | “Registry metadata omits cooldown-blocked versions and logs each decision.” | Assert metadata absence and corresponding audit rows for each registry. |
| UC-R17 | “Direct downloads return 404 for cooldown blocks and 451 for advisory hard blocks, with a JSON explanation and request ID.” | Assert both statuses and the full response schema. |
| UC-R18 | “Upstream errors use a stale cached response when one exists.” | Seed cache, fail upstream, and compare the stale response. |
| UC-R19 | “--offline serves cache only and returns 503 with a clear cache-miss error otherwise.” | Assert cached hit and uncached 503 body with network disabled. |
| UC-R20 | “/healthz is a liveness endpoint; /readyz verifies the cache directory and loaded policy.” | Toggle cache/policy readiness and assert both endpoints. |
| UC-R21 | “The integration suite uses local mock registries and does not depend on public package services.” | Deny external network during the integration suite. |
| UC-R22 | “Package readiness can be checked with cargo package --allow-dirty (the factory owns publishing credentials; this repository does not publish automatically).” | Run cargo package and assert no publish workflow/credential use. |
| UC-R23 | “The proxy has no telemetry and receives no package-manager credentials by design.” | Intercept all outbound traffic and send credential-bearing client requests; assert no telemetry and no credential retention/logging. |

### B4 — BLOCKING: demo and unknown routes expose broken provider routing

Evidence:

- GET /demo returns HTTP 404, title “Azure Static Web Apps - 404: Not found,”
  no h1, and no demo banner.
- GET /definitely-not-a-route returns the same generic Azure page. It loads
  Azure and Microsoft-hosted scripts/styles rather than the product’s
  self-contained visual system.
- site/public/staticwebapp.config.json has no navigationFallback or custom
  response override.

Why this loses a visitor: the required deep link is dead, and a mistyped URL
drops the visitor into an unrelated hosting-provider page with no product
navigation or way back.

Concrete fix: ship /demo as a real route, add a designed product-specific 404
with a home/demo action, configure the host to serve it, and add route tests
for direct load, reload, back/forward, title, h1, and focus.

### B5 — BLOCKING: the purchase action is dead

Quote:

> “Buy Operator Pack”

The rendered link
https://api.sociobot.in/api/v1/products/cooldown-registry-proxy/checkout
returns HTTP 404. All other crawled landing/privacy/terms links returned 200
and all in-page fragments had targets.

Why this misleads a visitor: the page offers a specific $49 purchase, but the
only purchase action cannot begin checkout.

Concrete fix: register the product through the Sociobot billing API, point the
button to the confirmed checkout route, and add a non-purchasing claim/link
test that asserts a valid checkout response or expected redirect.

### M1 — MAJOR: “Get v0.1.0 on GitHub” does not provide v0.1.0

The repository has no git tags, and the GitHub release API returns 404 for
v0.1.0. The button opens the repository root.

Why this misleads a visitor: “Get” implies a versioned release or binary, not a
source tree with no matching tag.

Concrete fix: publish a signed v0.1.0 release and link directly to it, or rename
the action “View source on GitHub.”

### M2 — MAJOR: required route metadata is incomplete

The home title is 67 characters and uses the slug:

> “cooldown-registry-proxy — dependency quarantine at the network edge”

It exceeds the 60-character limit and “dependency quarantine at the network
edge” is not plain wording. Home, Privacy, and Terms have descriptions,
lang=en, theme color, and an SVG favicon. All three lack canonical links, Open
Graph tags, Twitter card tags, and a 180 px apple-touch icon. There is no
1200 × 630 social image. /demo has no product title because it is a 404.

Concrete fix: use a title such as “Cooldown Proxy — block packages that are
too new” and add route-specific canonical/social metadata plus branded social
and touch assets.

### M3 — MAJOR: route focus and shared navigation do not meet the site skeleton

After following Privacy, focus remained on BODY rather than the new h1. After
browser Back, scroll was restored to 5960 px but focus again remained on BODY.
There is no route announcement region on Privacy or Terms.

Headers are not consistent: Home provides How it works, Install, and View
source; legal pages provide only Back to product. Footers are also
route-dependent, omit the current legal link, and all omit “Built by Param
Factory” plus a version/build id.

Concrete fix: use one header/footer component on every product route. On every
navigation and popstate, focus a tabindex=-1 h1 and announce its text. Retain
Privacy and Terms in every footer and add factory attribution plus build id.

### M4 — MAJOR: the landing skeleton omits a plain limitations/privacy section

The page moves from setup directly to the paid Operator Pack. Product
limitations appear only in README (“It does not host private packages,
authenticate users, scan code…”), and privacy detail is available only through
the footer.

Why this matters: a security operator cannot assess boundaries before reaching
the paid offer.

Concrete fix: before the paid section, add “What the proxy does not do” with
the private-package/auth/code-scanning limits, deployment responsibility, local
cache/log sensitivity, and a link to Privacy.

### M5 — MAJOR: a static example is presented as a live active registry

Quote:

> “registry.internal · policy active · 7d”

No registry is connected to the landing page. The adjacent control only swaps
static client configuration text.

Why this misleads a visitor: a green status dot and “active” describe current
operational state, not an example.

Concrete fix: label the entire panel “Example client configuration” and change
the status to “Example: 7-day cooldown.” If live status is intended, connect it
to the isolated demo proxy and add a claim test.

### m01 — MINOR: the How it works section has four steps, not the required three

The section lists Client asks, Proxy surveys, Policy answers, and Evidence
remains. Concrete fix: merge “Evidence remains” into the Policy answers result,
or explain why a fourth step is necessary in the product structure contract.

### m02 — MINOR: external destinations are not consistently identified

The footer “Source” link and operator-guide link do not state that they leave
the product site. Concrete fix: append visible “on GitHub” wording or accessible
external-link text consistently.

## Copy findings

Word counts below treat hyphenated, slash-joined, and dotted identifiers as one
word. Punctuation such as an em dash still separates words. Landing sentences
average 8 words; README sentences average 12 words. The averages pass the
14-word target, but two README sentences exceed the hard 22-word cap.

### Major copy findings

| ID | Flagged copy | Why it fails | Proposed rewrite |
| --- | --- | --- | --- |
| C01 | “New dependencies wait at the boundary.” | The metaphor does not name the job, and the headline does not start with a verb. | “Block new packages until their cooldown ends.” |
| C02 | “One self-hosted binary enforces a release cooldown for npm, PyPI, and Cargo—across every laptop and CI runner behind it.” | It describes coverage but not the intended user; “behind it” depends on understanding the proxy topology. | “For platform and security teams enforcing one npm, PyPI, and Cargo cooldown across laptops and CI.” |
| C03 | “Deploy the proxy” | The action only scrolls to client configuration; it does not deploy anything. | “View setup commands.” |
| C04 | “Test the policy” | It does not name the sample result or disclose that this is a local simulation. | “Try it with sample data.” Add “See three package decisions in your browser.” |
| C05 | “Get v0.1.0 on GitHub” | It promises a versioned result that does not exist at the destination. | “View source on GitHub,” or publish and link the release. |
| C06 | README: “cooldown-registry-proxy is a self-hosted Rust binary for teams that want new npm, PyPI, and crates.io releases to age before installation—without trusting per-developer settings or installing a TLS interception certificate.” (30 words) | It exceeds 22 words and combines user, job, mechanism, and two constraints. | “Cooldown Registry Proxy is for teams that delay new npm, PyPI, and crates.io releases. One self-hosted Rust binary enforces the rule without per-developer settings or TLS interception.” |
| C07 | README: “It filters registry metadata, re-checks direct artifact requests, caches immutable package files, supports time-limited emergency exclusions, consumes a simple advisory blocklist feed, and records every refusal as JSONL.” (28 words) | It exceeds 22 words and stacks six behaviors into one sentence. | “It filters registry metadata and checks direct artifact requests. It caches package files, supports expiring exclusions, reads an advisory blocklist, and records refusals as JSONL.” |
| C08 | “Five-minute deployment” | This is a quantitative promise with no claim entry or timing test. | “Deploy the proxy,” or add a clean-environment test that proves five minutes. |
| C09 | “A one-time $49 Operator Pack unlocks…” | “Unlocks” is banned marketing copy and implies gating. | “The optional $49 Operator Pack includes…” |

### Minor copy findings

Each row is a separate copy finding with a concrete replacement.

| ID | Flagged copy | Flag | Proposed rewrite |
| --- | --- | --- | --- |
| C10 | “Network-level package quarantine” | Jargon and another name for cooldown blocking. | “Block packages by release age.” |
| C11 | “Ecosystems” | Abstract/banned terminology for a concrete list. | “Package registries.” |
| C12 | “Policy point / One network choke point” | “Policy point” and “choke point” require infrastructure context. | “Proxy / One proxy for all clients.” |
| C13 | “Releases cross only after policy clearance” | Cartographic metaphor obscures the behavior. | “Versions remain blocked until their cooldown ends.” |
| C14 | “Move the age contour” | The heading does not make sense outside the map metaphor. | “Choose the minimum release age.” |
| C15 | “Fresh ridge / Safe basin” | The key describes artwork, not package states. | “Blocked by cooldown / Allowed by age.” |
| C16 | “A small enforcement plane” | Infrastructure jargon does not identify the section. | “How requests are checked.” |
| C17 | “Policy before package” | The heading is a slogan, not a standalone explanation. | “Check every package before download.” |
| C18 | “One binary. One boundary.” | The heading does not describe the setup section out of context. | “Configure each package manager.” |
| C19 | “Production runbooks, once.” | The comma construction is ambiguous without the price paragraph. | “Buy the production runbook once.” |
| C20 | “Hold the line” | Metaphor adds no instruction. | “Start enforcing a cooldown.” |
| C21 | “Copy” | The control does not name what will be copied. | Dynamically use “Copy npm config,” “Copy pip config,” or “Copy Cargo config.” |
| C22 | “The proxy remains fully open and ungated.” | “Fully” and “ungated” are vague; the next sentence uses the banned word “unlocks.” | “All proxy safety features remain free and open source.” |
| C23 | “Open source, self-hosted, and small enough to understand before you trust it.” | “Small enough to understand” is subjective and untestable. | “The source and self-hosting files are public on GitHub.” |

### Terminology inconsistency finding

The same concepts receive several names:

| Concept | Terms currently used | Use consistently |
| --- | --- | --- |
| Release-age rule | waiting period, release cooldown, minimum release age, age contour, active cooldown, seven-day policy | cooldown |
| Network service | proxy, boundary, enforcement plane, policy point, network choke point | proxy |
| Cooldown result | quarantine, cooldown block, filtered/refused, young version disappears | blocked by cooldown |
| Security result | advisory block, hard block, known malware returns 451 | blocked by advisory |

Why this slows a first read: a visitor must decide whether each metaphor names
a different feature. Concrete fix: apply the “Use consistently” column across
the landing page, README, simulator labels, errors, and audit documentation.

## Landing-page sentence inventory

The inventory includes initial dynamic status text and copy revealed by the
licensed-content container because both ship in the landing DOM.

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 6 | New dependencies wait at the boundary. | C01, UC-L01 |
| 2 | 20 | One self-hosted binary enforces a release cooldown for npm, PyPI, and Cargo—across every laptop and CI runner behind it. | B1, C02, UC-L02 |
| 3 | 6 | Releases cross only after policy clearance. | C13, UC-L03 |
| 4 | 9 | This local simulation shows exactly what package managers see. | UC-L10 |
| 5 | 5 | No request leaves your browser. | UC-L11 |
| 6 | 7 | 7d until this version crosses the contour. | C13, UC-L12 |
| 7 | 5 | Older than the active cooldown. | UC-L13 |
| 8 | 7 | Advisory MAL-2026-041 wins over age and exclusions. | UC-L14 |
| 9 | 13 | Policy recalculated: 1 allowed, 1 quarantined, 1 hard blocked, 0 offline cache misses. | terminology, simulator test needed |
| 10 | 7 | Direct URLs do not bypass the boundary. | C13, UC-L15 |
| 11 | 16 | Every tarball or crate download is checked again against current publish time, exclusions, and advisory blocks. | UC-L16 |
| 12 | 5 | Keep your existing public registries. | UC-L17 |
| 13 | 8 | Change one registry URL at the organization edge. | UC-L18 |
| 14 | 10 | npm, pip, uv, and Cargo speak their normal registry protocols. | UC-L19 |
| 15 | 5 | No wrapper or local plugin. | UC-L20 |
| 16 | 14 | Publish time, a live exclusion file, and refreshed advisory feeds resolve to one decision. | jargon, UC-L21 |
| 17 | 3 | Old releases pass. | UC-L22 |
| 18 | 6 | Young versions disappear or return 404. | terminology, UC-L23 |
| 19 | 4 | Known malware returns 451. | terminology, UC-L24 |
| 20 | 14 | Artifacts cache on disk and every refusal lands in an append-only JSONL audit trail. | jargon, UC-L25 |
| 21 | 2 | One binary. | UC-L02 |
| 22 | 2 | One boundary. | C18 |
| 23 | 14 | Run behind your existing TLS ingress, then point package managers at its protocol-specific path. | jargon |
| 24 | 7 | The proxy remains fully open and ungated. | C22, UC-L27 |
| 25 | 18 | A one-time $49 Operator Pack unlocks the hardened ingress checklist, SIEM mappings, incident-response runbook, and hosted-dashboard early access. | banned “unlocks,” jargon, C09, UC-L28 |
| 26 | 2 | One-time purchase. | UC-L29 |
| 27 | 14 | Sociobot/Dodo is the merchant of record and handles refunds; refunded licenses are revoked automatically. | jargon, UC-L30 |
| 28 | 3 | Have a license? | — |
| 29 | 2 | Paste it. | — |
| 30 | 3 | No license stored. | UC-L31 |
| 31 | 5 | The full proxy remains free. | UC-L32 |
| 32 | 14 | Download the production runbook for ingress hardening, SIEM fields, incident response, and rollout checks. | jargon, UC-L33 |
| 33 | 4 | Make “too new” unreachable. | UC-L34 |
| 34 | 12 | Open source, self-hosted, and small enough to understand before you trust it. | C23, UC-L35 |
| 35 | 8 | Dependency age is a policy, not a suggestion. | slogan, UC-L36 |

No landing sentence exceeds 22 words. Its sentence average is 8 words.

## README sentence inventory

Code blocks are commands/data, not prose sentences, and are excluded. Headings
are audited separately below.

| # | Words | Sentence | Flag |
| ---: | ---: | --- | --- |
| 1 | 15 | Put one enforceable waiting period between public package registries and every developer or CI runner. | terminology, UC-R01 |
| 2 | 30 | cooldown-registry-proxy is a self-hosted Rust binary for teams that want new npm, PyPI, and crates.io releases to age before installation—without trusting per-developer settings or installing a TLS interception certificate. | >22, C06, UC-R02 |
| 3 | 28 | It filters registry metadata, re-checks direct artifact requests, caches immutable package files, supports time-limited emergency exclusions, consumes a simple advisory blocklist feed, and records every refusal as JSONL. | >22, jargon, C07, UC-R03 |
| 4 | 18 | It does not host private packages, authenticate users, scan code, or claim to replace a full artifact repository. | UC-R04 |
| 5 | 9 | Build the single binary with Rust 1.85 or newer: | UC-R05 |
| 6 | 6 | Or build and run the container: | UC-R06 |
| 7 | 7 | Start a seven-day policy on port 8787: | terminology, UC-R07 |
| 8 | 11 | The process is intentionally non-interactive and exits non-zero for invalid configuration. | UC-R08 |
| 9 | 8 | Add --json for machine-readable startup and validation output. | UC-R09 |
| 10 | 5 | cooldown-registry-proxy --help documents every command. | UC-R10 |
| 11 | 9 | HTTP is suitable only on a trusted private network. | — |
| 12 | 13 | Put the binary behind your existing TLS ingress for use across untrusted networks. | jargon |
| 13 | 11 | Exclusions are explicit, version-specific, expire automatically, and require an operator reason: | UC-R11 |
| 14 | 11 | Advisory files and remote --advisory-url feeds share one deliberately small schema. | subjective, jargon, UC-R12 |
| 15 | 8 | A hard block always wins over an exclusion: | UC-R13 |
| 16 | 13 | Use cooldown-registry-proxy validate --exclusions ... --advisories ... --json in CI before deploying a policy change. | UC-R14 |
| 17 | 16 | Multiple --advisory-url options may point at internally curated OSV/GitHub Advisory exports; feeds refresh without a restart. | jargon, UC-R15 |
| 18 | 9 | Registry metadata omits cooldown-blocked versions and logs each decision. | UC-R16 |
| 19 | 20 | Direct downloads return 404 for cooldown blocks and 451 for advisory hard blocks, with a JSON explanation and request ID. | UC-R17 |
| 20 | 10 | Upstream errors use a stale cached response when one exists. | UC-R18 |
| 21 | 13 | --offline serves cache only and returns 503 with a clear cache-miss error otherwise. | UC-R19 |
| 22 | 13 | /healthz is a liveness endpoint; /readyz verifies the cache directory and loaded policy. | jargon, UC-R20 |
| 23 | 15 | The integration suite uses local mock registries and does not depend on public package services. | UC-R21 |
| 24 | 20 | Package readiness can be checked with cargo package --allow-dirty (the factory owns publishing credentials; this repository does not publish automatically). | UC-R22 |
| 25 | 11 | See docker-compose.yml for a persistent-cache deployment and examples/ for policy templates. | — |
| 26 | 10 | Terminate TLS and apply network access control at your ingress. | jargon |
| 27 | 10 | The static documentation site deploys from dist/site to https://cooldown-registry-proxy.sociobot.in. | — |
| 28 | 12 | The proxy has no telemetry and receives no package-manager credentials by design. | UC-R23 |
| 29 | 13 | Treat registry URLs, package names, audit logs, and cache contents as operationally sensitive. | — |
| 30 | 7 | See SECURITY.md for reporting and threat-model boundaries. | jargon |
| 31 | 1 | MIT. | — |
| 32 | 2 | See LICENSE. | — |

README has two sentences over 22 words and averages 12 words.

## Heading and control audit

The headings “Move the age contour,” “Policy before package,” “One binary. One
boundary.,” “Production runbooks, once.,” and the eyebrow “Hold the line” do
not make sense as a context-free screen-reader heading list. Findings C14 and
C16–C20 provide replacements. “Test the policy,” “Deploy the proxy,” “Copy,”
and “Get v0.1.0 on GitHub” fail the result-naming or destination-accuracy
check; findings C03–C05 and C21 provide replacements. “View source,” “Read the
operator guide,” “Buy Operator Pack,” “Verify license,” and “See client config”
name a result, although Buy Operator Pack is broken as recorded in B5.

README headings—Install, Usage, npm, pip / uv, Cargo, Policy files, Response
behavior, Development and verification, Deployment, Security and privacy, and
License—remain understandable out of context.

## Demo and sandbox evidence

| Check | Result | Evidence |
| --- | --- | --- |
| First-screen demo action | Fail | Required label absent; secondary “Test the policy” exists. |
| Sample visible immediately after click | Pass | At 390 px, scrollY became 1857 and two of three sample releases were visible without another action. |
| Realistic sample | Pass | npm signal-router 4.8.0 at 0.8 days, PyPI field-notes 2.3.1 at 10 days, and Cargo vault-door 0.9.6 with advisory MAL-2026-041. |
| Demo banner | Fail | 0 matches. |
| Reset demo | Fail | 0 buttons. |
| Start for real | Fail | 0 links/buttons. |
| Direct demo URL | Fail | /demo returns 404. |
| Separate storage namespace | Fail | No demo namespace or route; the page reads the real license namespace. |
| Fresh-context widget persistence | Narrow pass | Storage remained empty before/after interaction. |
| Widget network privacy | Pass | Slider plus outage interaction generated zero requests. |
| Existing real storage isolation | Fail | A real license sentinel was read and triggered verification requests. |
| Offline sample after first visit | Pass, unlisted | After service-worker control, offline reload retained one h1 and all three sample rows. |
| CLI demo in temp directory | Fail | Both demo forms exit 2; no demo output is produced. |

## Claims and clean-clone execution

Clean clone: /tmp/cooldown-review-clean.xoq7fz at
e8db3ea53f3e8634c4d391a87b5af391d506e73d.

| Check | Result |
| --- | --- |
| Read .factory/claims.json | BLOCKING: file absent |
| Enumerate listed claim commands | 0 commands |
| Search for @claim tags | 0 matches |
| Run every listed claim command | Impossible because no manifest entries exist |
| npm test | Pass: 6 Rust tests and 6 Node site tests |
| npm install then npm run build | Pass; dist/bin and dist/site produced |
| Site JS budget | Pass: 6.01 KB raw, 2.76 KB gzip |
| CLI demo command in fresh temp directory | Fail with exit 2 |

The general tests cover useful internals, including one mock npm flow,
advisory precedence, cooldown decisions, service-worker generation, and header
configuration. They are not tagged claim tests and do not exercise every live
or README claim through the required demo entry point.

## Structure, links, and accessibility

| Check | Result |
| --- | --- |
| Home HTTP/title/lang/main/h1/alt/console smoke test | Pass; load 717 ms, one h1, lang=en, main present, no missing alt, no console errors |
| Home title pattern/length | Fail; slug-based, jargon-heavy, 67 characters |
| Privacy and Terms | Pass for HTTP 200, route-specific title, one h1, description |
| /demo deep link | BLOCKING fail; generic provider 404 |
| Unknown route | BLOCKING fail; generic provider 404 with external Microsoft/Azure assets |
| Canonical metadata | Fail on all product pages |
| Open Graph/Twitter metadata | Fail on all product pages |
| Favicon | Pass for SVG |
| Apple touch icon/social image | Fail |
| robots.txt | Pass |
| sitemap.xml | Partial; Home, Privacy, and Terms listed, but no Demo |
| Security headers | Pass for CSP, HSTS, frame protection, nosniff, referrer and permissions policies |
| Link crawl | Fail only at the purchase URL; every other rendered request link returned 200 and every fragment target existed |
| Back button | Partial; scroll restored, focus remained on BODY |
| Focus/announcement on route change | Fail |
| Shared header/footer | Fail |
| One h1 and heading order on Home/Privacy/Terms | Pass |
| axe-core 4.10.2, 390 px, Home/Privacy/Terms | Pass: zero violations on each route |
| Reduced-motion rule | Pass; styles include prefers-reduced-motion: reduce |
| Focus and target baseline | Pass in CSS: 3 px focus ring and 44 px controls/links |
| Visual identity | Pass |

The visual-identity pass is specific: the dark survey-map palette, clipped
controls, contour language, and original topographic quarantine artwork match
.factory/design.md and do not resemble the prohibited centered-gradient,
three-generic-card SaaS template. Asset provenance is recorded. This pass does
not offset the generic provider 404.

## Required acceptance sequence

1. Fix B1 so the 390 px first screen names the operator, job, sample action,
   next result, and three complete plain facts.
2. Implement the real /demo and CLI demo contracts in B2, including isolation,
   reset, direct entry, bundled sample data, and .factory/demo.md.
3. Add .factory/claims.json and one tagged observable test for every retained
   claim in B3; remove or split claims that cannot be tested.
4. Replace provider routing with the real Demo route and a designed 404.
5. Repair and test the Sociobot checkout route.
6. Fix version destination, metadata, focus, shared navigation, landing
   boundaries, and every copy finding.
7. Repeat the entire review in fresh mobile/desktop contexts and a clean clone.

The acceptance threshold is zero blocking findings and no more than three
minor findings. This build has five blocking findings plus multiple major and
minor findings, so the verdict is FAIL.
