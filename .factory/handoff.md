# Handoff — adversarial first-read review 1

Date: 2026-08-28

Work order: cooldown-registry-proxy-review-1

Reviewed commit: e8db3ea53f3e8634c4d391a87b5af391d506e73d

Verdict: FAIL

## What was done

- Reviewed the live site cold in fresh Chromium contexts at 390 × 844 and
  1440 × 900.
- Recorded what the first screen communicates about the job, intended user,
  and first action.
- Inventoried and counted every landing-page and README sentence; flagged long
  copy, jargon, metaphors, banned wording, inconsistent terms, unclear
  headings, and inaccurate controls.
- Exercised the policy widget, network behavior, storage behavior, offline
  reload, direct /demo load, unknown routes, browser back/focus, metadata, all
  rendered links, legal pages, and mobile accessibility.
- Checked .factory/claims.json and .factory/demo.md; both are absent.
- Cloned the requested base commit to a fresh temporary directory, ran all
  available tests/builds, and invoked both possible CLI demo forms from a fresh
  temporary directory.
- Wrote the full evidence and severity-ordered findings in
  .factory/review-1.md.

No product code was changed.

## Verification results

- npm test: PASS — 6 Rust tests and 6 Node site tests.
- npm install followed by npm run build: PASS — dist/bin and dist/site
  produced.
- Factory verify-url.sh against live Home: PASS — title/lang/main/alt/console
  baseline, 717 ms observed load.
- Playwright axe-core scan at 390 px: PASS — zero violations on Home, Privacy,
  and Terms.
- Live widget network interception: PASS — zero requests during slider/outage
  interaction.
- Offline reload after first visit: PASS — Home and all three sample rows
  remained available.
- Claims contract: BLOCKING FAIL — no claims manifest, no listed commands, and
  no @claim tests.
- Web/CLI demo contract: BLOCKING FAIL — no /demo, banner, reset, start-real
  action, isolated namespace, CLI demo, recording, or demo documentation.
- Routing: BLOCKING FAIL — /demo and unknown routes show the generic Azure 404.
- Link crawl: BLOCKING FAIL — Buy Operator Pack returns HTTP 404; all other
  rendered links/fragments passed.
- First read: BLOCKING FAIL — intended user and first evaluation action are not
  clear from the first screen.

## Known gaps and next steps

The five blocking findings and all exact fixes are in .factory/review-1.md.
Repair work should start with first-screen clarity, the isolated web and CLI
demo, the claims registry/tests, custom routing/404, and the checkout endpoint.
Then address metadata, focus/navigation, limitations/privacy placement,
version-link accuracy, and the copy findings before repeating this review.

The temporary browser and clean-clone evidence remains under /tmp for this
container only and is not part of the commit.
