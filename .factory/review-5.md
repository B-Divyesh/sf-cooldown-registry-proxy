# Adversarial first-read review 5

Date: 2026-08-28

Work order: `cooldown-registry-proxy-review-5`  
Repository base: `ea21b8878d89d68a0a6d63aa6cc24930dbf6fbe9`  
Live target: <https://cooldown-registry-proxy.sociobot.in>

## Verdict: PASS

No blocking, major, or minor findings remain. This is a clean first-read pass,
not a diff-only check. The full claim manifest ran from a new clone and every
listed command passed. The live site was independently checked cold at 390 ×
844 and 1440 × 900 before scrolling.

## Cold first read

At both viewports, before scrolling, the page answers all three questions:

| Question | Cold answer | Evidence visible in the first viewport |
| --- | --- | --- |
| What does it do? | It blocks newly released npm, PyPI, and Cargo packages until the configured cooldown ends. | “Block new packages until their cooldown ends.” and “One proxy checks npm, PyPI, and Cargo requests…” |
| For whom? | Platform and security teams that need the same age rule on developer laptops and CI. | “For platform and security teams…” |
| What should I do first? | Try the sample to see an allow, an age block, and an advisory block. | “Try it with sample data” beside “See an allowed release…” |

The phone viewport contains the privacy, offline, and price facts at y=606–675
of an 844 px viewport. The desktop viewport contains them at y=780–854 of a
900 px viewport. No first-read failure was observed.

## Copy audit

Word counts use word tokens, including hyphenated terms as one word. Controls,
labels, and headings were also checked for direct terms and result-naming verbs.
No sentence exceeds 22 words. The banned marketing terms are absent. `cooldown`,
`proxy`, `blocked by cooldown`, `blocked by advisory`, and `refusal record` are
used consistently. No copy finding was raised.

### Landing-page sentence inventory

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
| 8 | Each blocked package version adds a refusal record. |
| 7 | Run the binary on a trusted network. |
| 7 | Then point clients at its registry path. |
| 5 | Read setup guidance on GitHub. |
| 3 | Example: 7-day cooldown. |
| 12 | Private package hosting, user authentication, and code scanning are outside its scope. |
| 8 | You operate its network, cache, and refusal log. |
| 4 | Read the privacy notice. |
| 4 | See three package decisions. |
| 10 | The isolated sample shows one allowed package and two blocks. |
| 5 | Release-age checks for package registries. |
| 7 | Built by Param Factory · v0.1.0. |

### README sentence inventory

| Words | Copy |
| ---: | --- |
| 7 | Block new packages until their cooldown ends. |
| 9 | Cooldown Registry Proxy is for platform and security teams. |
| 13 | One Rust binary checks npm, PyPI, and Cargo requests through a network proxy. |
| 9 | It filters registry lists and rechecks direct package downloads. |
| 9 | Each blocked package version adds one JSONL refusal record. |
| 12 | Private package hosting, user authentication, and code scanning are outside its scope. |
| 6 | Build the single binary with Cargo: |
| 7 | Run the bundled sample from any directory: |
| 7 | The command creates a new temporary workspace. |
| 13 | It runs the actual proxy paths against bundled npm, PyPI, and Cargo fixtures. |
| 13 | The report shows an allowed download, a cooldown block, and an advisory block. |
| 11 | It also records cache files and JSONL refusals inside the workspace. |
| 16 | The demo does not open configuration, caches, or logs in the directory where you run it. |
| 11 | Open `https://cooldown-registry-proxy.sociobot.in/?demo=1` for the browser sample. |
| 8 | Its state uses a separate `demo:` browser key. |
| 8 | The sample reloads offline after the first visit. |
| 11 | See `.factory/demo.md` for the sample contract and reset steps. |
| 3 | Example proxy command: |
| 8 | Use HTTP only on a trusted private network. |
| 8 | Add TLS at your ingress for other networks. |
| 9 | Each exclusion needs a package version, expiry, and reason. |
| 9 | Advisory blocks override exclusions for the same package version. |
| 9 | `npm run build` writes the binary to `dist/bin/`. |
| 8 | It writes the static site to `dist/site/`. |
| 6 | Deploy `dist/site/` as static files. |
| 10 | The documentation site loads no analytics or third-party runtime code. |
| 11 | The proxy contacts only registry and advisory URLs in its configuration. |
| 10 | Cache and refusal files stay in the directory you choose. |
| 9 | Refusal records can contain package names, so protect them. |
| 7 | Read `SECURITY.md` before reporting a vulnerability. |
| 1 | MIT. |
| 2 | See `LICENSE`. |

Headings make sense out of context: “How requests are checked”, “Configure each
package manager”, and “What the proxy does not do”. Actions name their result:
“Try it with sample data”, “View setup commands”, “Copy npm config”, “Reset
demo”, and “View source on GitHub”.

## Demo and sandbox checks

- The first-screen sample action opens `/demo/` in one click.
- The first phone and desktop demo screens show realistic npm `signal-router`
  4.8.0 (cooldown block), PyPI `field-notes` 2.3.1 (allowed), and Cargo
  `vault-door` 0.9.6 (advisory block).
- The persistent banner reads “Demo — sample data, nothing is saved.” It
  includes **Reset demo** and **Start for real**. Changing 7 days to 14 days
  then resetting restored 7 days and the original decisions.
- The live flow left no localStorage after **Start for real**. While in demo it
  held only `demo:cooldown-registry-proxy:policy`.
- The live Home → Demo → reset → exit interception saw only same-origin URLs.
  After service-worker control, offline reload of `/demo/` returned 200 and
  retained its heading and three decision labels.
- From a new `/tmp/cooldown-review5-cli.*` invocation directory, the built
  binary produced a unique `/tmp/cooldown-registry-proxy-demo-*` workspace,
  five cached files, four refusal records, and the expected npm 404, PyPI 200,
  and Cargo 451 outcomes. The invocation directory was not used for output.

## Claims and clean-clone evidence

New clone: `/tmp/cooldown-review5-clone.wTNP2l` at the requested base. `npm ci`
completed there. All 24 commands from `.factory/claims.json` passed separately:

`cooldown-block`, `registry-paths`, `metadata-filter`, `direct-downloads`,
`advisory-block`, `sample-decisions`, `refusal-jsonl`, `cli-demo-workspace`,
`cli-demo-isolation`, `local-demo-output`, `configured-outbound`,
`policy-files`, `unsupported-scope`, `binary-build`, `build-dist`,
`configured-local-output`, `mit-license`, `demo-isolation`, `offline-sample`,
`site-privacy`, `sample-values`, `terminal-recording`,
`local-output-sensitive-data`, and `release-version`.

The live landing page and README were reread against that manifest. Every
observable claim maps to one listed claim: cooldown, registry paths, metadata,
downloads, advisory precedence, sample outcomes, refusals, CLI workspace and
isolation, configured outbound/local output, policy files, scope, binary/build,
MIT, browser isolation/offline/privacy, sample values, terminal parity,
sensitive local output, and version. No unlisted claim remains.

Clean-clone quality gates also passed:

- `npm test` — 7 Rust tests and all Node content, delivery, policy, service-worker,
  and claim tests passed.
- `npm run build` — produced `dist/bin/cooldown-registry-proxy` and `dist/site/`.
- `npm run test:browser` — 15/15 passed, including axe checks on Home, Demo,
  Privacy, and Terms.

## Structure, accessibility, routing, and identity

The live routes `/`, `/demo/`, `/privacy/`, and `/terms/` return 200; an
unknown route returns the product-designed 404 with status 404 and return
actions. Each checked route has one h1, one main landmark, `lang=en`, a
route-specific title, description, canonical, Open Graph/Twitter fields, local
favicon, local touch icon, and local social image. The titles are within 60
characters and follow the required route pattern.

Direct loads and reloads work. Navigation moves focus to the destination h1;
Back restored the Home h1 and its prior scroll position. Header wordmark, four
or-fewer navigation destinations, and footer Privacy/Terms/factory/version
content are consistent across Home, Demo, Privacy, Terms, and 404. The link
crawl returned 200 for all ordinary internal and external destinations; the
404 page's own skip fragment correctly remains on its HTTP-404 document.

No live console errors were observed. The original topographic quarantine art,
field-console palette, clipped contour borders, and orange boundary marks make
the site visibly product-specific rather than a generic SaaS template. The
design matches `.factory/design.md`; the asset provenance is recorded there.

## Earlier-findings closure check

Every earlier review, polish ledger, and handoff was read. The following is a
fresh live/code confirmation ledger, not an acceptance of prior status labels.

| Earlier findings | Fresh confirmation |
| --- | --- |
| Review 1 `B1`, `C01`–`C05`, `C10`–`C18`, `C20`–`C23` | Phone/desktop cold read, plain-copy inventory, visible facts, headings, actions, and topographic identity now meet the stated requirements. |
| Review 1 `B2`, `C04`, `C14`–`C15`, `C20`–`C21` | `/demo/`, one-click outcomes, persistent banner, reset/exit, `demo:` isolation, offline sample, bundled terminal recording, and the temp-directory CLI demo all functioned. |
| Review 1 `B3`, all `UC-L01`–`UC-L38`, all `UC-R01`–`UC-R23` | The 24-entry manifest and separately run claim commands cover retained claim language; previously unsupported, subjective, paid, TLS, cache, timing, and release promises remain absent. |
| Review 1 `B4`, `M2`–`M3` | Real demo/legal routes, product 404, route metadata, shared shell, focus, announcement, and Back behavior passed on the live domain. |
| Review 1 `B5`, `M1`, `C08`–`C09`, `C19` | No paid checkout, license UI, runbook sale, false versioned-download action, or five-minute claim is present. Source actions resolve and say “View source on GitHub”. |
| Review 1 `M4`–`M5`, `C06`–`C07` | Limits/privacy precede the final action; static configuration is labeled example; README claims remain split, scoped, and mapped. |
| Review 2 `F-2-1`–`F-2-3` | The real serve refusal matrix, nested clean build output, and configured cache/audit paths passed through their individual claims. |
| Review 3 `F-3-1`–`F-3-7` | Three results are above the fold; refusal evidence spans all registries/paths; file/socket/storage guards are active; facts fit; terminal and sensitive-record claims are listed; unsupported credential/deployment copy is absent. |
| Review 4 `F-4-1`–`F-4-3` | Home, Demo, legal pages, and 404 share the same marked header and actions; the GitHub setup fragment resolves; every source action is a result-naming verb. |

No earlier ID is reopened.

## Missed leverage

No missing AI feature is expected. The brief is a deterministic network-policy
tool; adding an AI action would not make its core job clearer or safer. The
valuable implied extras are present: a browser sample, a real CLI sample,
sample policy files, a terminal recording, and explicit setup/configuration.
No provider key or decorative AI feature was found.

## What would make this perfect

Maintain this level of evidence as releases change: rerun the clean-clone
claim matrix and live mobile/desktop route checks whenever public copy,
deployment output, policy paths, or demo storage behavior changes. There is no
current product change required for this review.
