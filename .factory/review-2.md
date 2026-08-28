# Adversarial first-read review 2

Date: 2026-08-28
Work order: `cooldown-registry-proxy-review-2`
Base reviewed: `da745481f6f9982c2b5cec7a15d8faa8f39866e0`
Live target: <https://cooldown-registry-proxy.sociobot.in>

## Verdict: FAIL

The product is clear, tryable, and technically sound in the checks performed.
It nevertheless has three unlisted, broader-than-tested production claims in
the landing copy and README. The claims manifest proves isolated sample
behaviour, not the unqualified production statements. A PASS requires zero
findings and zero untested claims.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900. No scrolling
occurred before recording this result.

| Question | What a first-time visitor can answer from the first screen |
| --- | --- |
| What does this do? | It blocks npm, PyPI, and Cargo package releases until their configured cooldown ends. |
| For whom? | Platform and security teams controlling developer laptops and CI. |
| What should I click first? | **Try it with sample data**; it says that the next screen will show one allowed release, one cooldown block, and one advisory block. |

The exact supporting copy is: “Block new packages until their cooldown ends.”
“For platform and security teams enforcing one npm, PyPI, and Cargo cooldown
across laptops and CI.” “Try it with sample data.” “See an allowed release, a
cooldown block, and an advisory block.” The headline is seven words; the
supporting sentence is 16 words. This passes the first-screen test at both
viewports.

## Findings

### F-2-1 — MINOR: landing claim is broader than its listed sample test

**Location and exact quote:** landing, “How requests are checked,” step 3:
“Each blocked request adds a refusal record.”

**Why this is a finding:** `.factory/claims.json` has `refusal-jsonl`, but its
claim is explicitly “Every blocked **sample** request adds a JSONL refusal
record.” Its test exercises four bundled demo refusals. The landing sentence
does not say “sample”; a security operator can reasonably rely on it for every
production request. The listed test therefore does not prove the public claim.

**Concrete fix:** either narrow the landing text to “Each blocked sample
request adds a refusal record.” or add a production-path `refusal-jsonl` claim
test that creates every supported refusal through `serve` and asserts one JSONL
row per request.

### F-2-2 — MINOR: README makes an unlisted build-output claim

**Location and exact quote:** README, “Test, build, and deploy”: “`npm run
build` writes the binary to `dist/bin/`.” “It writes the static site to
`dist/site/`.”

**Why this is a finding:** `binary-build` asserts that `cargo build --release`
creates `target/release/cooldown-registry-proxy`; no manifest entry asserts
either public `npm run build` output path. The clean-clone build in this review
did create both paths, but that manual observation is not the required listed,
tagged evidence.

**Concrete fix:** add a `build-dist` entry to `.factory/claims.json` with a
tagged test that runs `npm run build` in a clean checkout and asserts
`dist/bin/cooldown-registry-proxy` and `dist/site/index.html`; alternatively,
remove these two outcome statements from README.

### F-2-3 — MINOR: production cache/log-location promise has only demo evidence

**Location and exact quote:** README, “Privacy and security”: “Cache and
refusal files stay in the directory you choose.” The privacy route repeats the
same promise: “Its cache and refusal log remain in the directory you choose.”

**Why this is a finding:** `local-demo-output` only proves that the **CLI demo**
keeps output inside its temporary workspace. It does not invoke `serve` with
operator-selected `--cache-dir` and `--audit-log` paths. The README and privacy
route are unqualified production statements, so the sample-only claim does not
cover them.

**Concrete fix:** add a `configured-local-output` claim and tagged test that
starts `serve` with explicit temporary cache and audit paths, makes an allowed
and a blocked request, and asserts all created cache/log files are beneath
those paths. If production persistence is intentionally outside the published
contract, rewrite both sentences as “The sample keeps cache and refusal files
in its temporary workspace.”

## Copy audit

The tables list every prose sentence or sentence fragment in the landing page
and README. Commands, URLs, proper-noun-only headings, and code blocks are not
counted as sentences. All counted items are at or below 22 words. No banned
marketing adjective appears. Technical terms such as npm, PyPI, Cargo,
registry, proxy, JSONL, and TLS are appropriate for the named platform/security
audience; the product consistently uses **cooldown**, **proxy**, **blocked by
cooldown**, **blocked by advisory**, and **refusal record**.

### Landing page

| Words | Copy |
| ---: | --- |
| 7 | Block new packages until their cooldown ends. |
| 16 | For platform and security teams enforcing one npm, PyPI, and Cargo cooldown across laptops and CI. |
| 5 | Try it with sample data. |
| 11 | See an allowed release, a cooldown block, and an advisory block. |
| 3 | View setup commands. |
| 3 | Separate demo data. |
| 5 | Demo reloads after one visit. |
| 2 | MIT-licensed source. |
| 2 | 7-day cooldown. |
| 4 | Newer releases stop here. |
| 3 | Filters registry lists. |
| 3 | Checks direct downloads. |
| 3 | Records blocked requests. |
| 14 | One proxy checks npm, PyPI, and Cargo requests before packages reach laptops or CI. |
| 10 | Use its npm, PyPI, or Cargo URL in client configuration. |
| 8 | The proxy compares publish time with your cooldown. |
| 3 | Allowed files download. |
| 7 | Each blocked request adds a refusal record. |
| 7 | Run the binary on a trusted network. |
| 7 | Then point clients at its registry path. |
| 5 | Read setup guidance on GitHub. |
| 4 | Example: 7-day cooldown. |
| 12 | Private package hosting, user authentication, and code scanning are outside its scope. |
| 8 | You operate its network, cache, and refusal log. |
| 4 | Read the privacy notice. |
| 10 | The isolated sample shows one allowed package and two blocks. |
| 5 | Release-age checks for package registries. |
| 5 | Built by Param Factory · v0.1.0. |

Landing headings are concise and work as an outline: “How requests are
checked,” “Configure each package manager,” “What the proxy does not do,” and
“See three package decisions.” Controls use result-naming verbs: “Try it with
sample data,” “View setup commands,” and “Copy npm config.” “Source on
GitHub” is a destination-naming external link, not a generic button. No copy
finding beyond F-2-1 was recorded.

### README

| Words | Copy |
| ---: | --- |
| 7 | Block new packages until their cooldown ends. |
| 9 | Cooldown Registry Proxy is for platform and security teams. |
| 13 | One Rust binary checks npm, PyPI, and Cargo requests through a network proxy. |
| 9 | It filters registry lists and rechecks direct package downloads. |
| 8 | Every blocked request adds a JSONL refusal record. |
| 12 | Private package hosting, user authentication, and code scanning are outside its scope. |
| 5 | Build the single binary with Cargo. |
| 7 | Run the bundled sample from any directory. |
| 7 | The command creates a new temporary workspace. |
| 12 | It runs the actual proxy paths against bundled npm, PyPI, and Cargo fixtures. |
| 13 | The report shows an allowed download, a cooldown block, and an advisory block. |
| 11 | It also records cache files and JSONL refusals inside the workspace. |
| 8 | Existing configuration, caches, and logs are never read. |
| 5 | Open <https://cooldown-registry-proxy.sociobot.in/?demo=1> for the browser sample. |
| 8 | Its state uses a separate `demo:` browser key. |
| 8 | The sample reloads offline after the first visit. |
| 9 | See `.factory/demo.md` for the sample contract and reset steps. |
| 3 | Example proxy command. |
| 8 | Use HTTP only on a trusted private network. |
| 8 | Add TLS at your ingress for other networks. |
| 9 | Each exclusion needs a package version, expiry, and reason. |
| 8 | Advisory blocks override exclusions for the same package version. |
| 8 | `npm run build` writes the binary to `dist/bin/`. |
| 6 | It writes the static site to `dist/site/`. |
| 7 | The factory deploys the site and owns publishing credentials. |
| 10 | The documentation site loads no analytics or third-party runtime code. |
| 11 | The proxy contacts only registry and advisory URLs in its configuration. |
| 10 | Cache and refusal files stay in the directory you choose. |
| 9 | They can contain package names, so protect that directory. |
| 6 | Read `SECURITY.md` before reporting a vulnerability. |
| 1 | MIT. |
| 2 | See `LICENSE`. |

README headings (“Install,” “Try the isolated sample,” “Run the proxy,”
“Policy files,” “Test, build, and deploy,” “Privacy and security,” and
“License”) remain understandable out of context. The only README audit flags
are F-2-1’s unqualified equivalent and F-2-2/F-2-3.

## Demo and sandbox verification

- The first-screen “Try it with sample data” link reached `/demo/` in one
  navigation. At 390 px, its first screen already showed realistic npm
  `signal-router` 4.8.0 (cooldown block), PyPI `field-notes` 2.3.1 (allowed),
  and Cargo `vault-door` 0.9.6 (advisory block).
- The persistent banner read “Demo — sample data, nothing is saved.” It exposed
  **Reset demo** and **Start for real**.
- With a pre-seeded `real:sentinel` key, changing the range and resetting
  restored the seven-day value; the sentinel remained `intact`. Exiting removed
  only `demo:cooldown-registry-proxy:policy` and retained the real sentinel.
- Request interception for the complete landing-to-demo interaction observed
  only `https://cooldown-registry-proxy.sociobot.in` requests and no console or
  page errors.
- After service-worker control and an online reload, offline reload of `/demo/`
  retained the demo title, h1, and all three release rows.
- From a separate temporary directory, the clean-clone release binary ran
  `--json demo`, created a unique `/tmp/cooldown-registry-proxy-demo-*`
  workspace, returned the expected `[npm, cooldown, 404]`, `[pypi, allowed,
  200]`, and `[cargo, advisory, 451]` decisions, wrote a report and four
  refusal rows, and left a pre-existing `real-sentinel.log` unchanged.

## Claims and quality gates

`.factory/claims.json` contains 20 entries. Every listed command was run
separately from clean clone `/tmp/cooldown-review2-clean.fItiXV`; all 20
passed. This included all 16 Node claim commands and all four browser claims:
demo isolation, offline sample reload, same-origin privacy, and exact sample
values. `npm test` and `npm run build` also passed; `dist/bin/` and `dist/site/`
were produced.

The live-domain browser suite passed 13/13. It verified four route metadata
sets, axe serious/critical violations (none), 390 px first-screen fit, direct
route loads, Back focus/scroll restoration, all internal links, keyboard
operation, and the designed 404. `/opt/fleet/lib/verify-url.sh` passed against
the live home page: 554 ms network-idle load, no console errors, `lang=en`, one
h1, a main landmark, and no missing image alt or unnamed buttons.

All landing claim-like text was cross-checked against the manifest. The
sample-scoped mappings pass, including cooldown, three registry paths,
metadata filtering, direct downloads, advisory precedence, sample decisions,
browser isolation/offline/privacy, scope limits, MIT, and release version.
F-2-1 through F-2-3 are the remaining scope gaps.

## Structure, privacy, and identity

- Home title is “Cooldown Proxy — block packages that are too new”; Demo,
  Privacy, Terms, and 404 have route-specific titles. Each live route has one
  h1, a description, canonical, OG/Twitter metadata, SVG icon, and 180 px
  touch icon.
- `/`, `/demo`, `/demo/`, `/privacy`, `/privacy/`, `/terms`, `/terms/`,
  `robots.txt`, `sitemap.xml`, social card, and touch icon returned 200.
  An unknown path returned the product-designed 404 with status 404 and a
  “Return home” link.
- Headers and footers are consistent, include the skip link, Demo/Privacy/Terms,
  Factory attribution, and version. Direct navigation and Back moved focus to
  the destination h1.
- The live response served self-only CSP, `frame-ancestors 'none'`,
  `X-Content-Type-Options`, and Referrer-Policy. No analytics, tracking,
  third-party runtime code, raw provider key, or AI runtime integration was
  found. An AI feature would not improve this deterministic registry-policy
  task; JSON policy files and the demo report already provide the useful import
  and observable output paths.
- The dark topographic/quarantine visual system matches `.factory/design.md`,
  uses documented original local artwork, and avoids the generic centered-hero
  / gradient-blob SaaS pattern.

## Earlier-review closure

Read in full: `.factory/review-1.md`, `.factory/polish-1.md`, and the prior
`.factory/handoff.md`, plus verification records. Live and code rechecks
confirmed the following prior findings are fixed: B1 (first-screen clarity),
B2 (browser and CLI sandbox), B3 (claim manifest/tagged tests), B4 (direct
routes and 404), B5 (dead checkout removed), M1 (honest GitHub action), M2
(metadata/assets), M3 (shared navigation and focus), M4 (limits/privacy
section), M5 (example labeling), m01/m02 (three steps/external-link labels),
C01–C23 (plain wording and terminology), UC-L01–UC-L38, and UC-R01–UC-R23.

Those closures were checked in both the rendered live product and the current
source/tests, not accepted merely from the polish table. F-2-1–F-2-3 are new
scope-precision findings: their reduced sample claims work, but the newer
unqualified production wording is not yet represented by an exact claim test.

## What would make this perfect

Add the three exact production claim tests (or narrow/remove their public
sentences), then rerun all manifest commands from a clean clone and the live
browser suite. With the stated copy-to-evidence contract restored, no other
first-read, demo, routing, accessibility, privacy, visual-identity, or
missed-leverage work was identified in this round.
