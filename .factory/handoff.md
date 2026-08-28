# Handoff — adversarial review 3

Date: 2026-08-28

Work order: `cooldown-registry-proxy-review-3`

Reviewed base: `227950e0ddf64f93cda06b569f6c1c3f76dd8b80`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

## Delivered

- Wrote `.factory/review-3.md` with a FAIL verdict, three blocking findings,
  four minor findings, complete landing/README sentence counts, claim results,
  full earlier-finding reconciliation, and concrete fixes.
- Did not modify product code, site copy, tests, or deployment configuration.

## Verification performed

- Opened the live site cold in fresh Chromium contexts at 390 × 844 and
  1440 × 900.
- Entered the demo in one click; tested Reset, Start for real, separate browser
  storage, same-origin requests, offline reload, and sample values.
- Ran the release CLI demo from a new temporary directory with a real-data
  sentinel.
- Created clean clone `/tmp/cooldown-review3-clean.ghnajR` and ran all 22
  `.factory/claims.json` commands separately; every command exited 0.
- Ran `npm test` (7 Rust + 30 Node tests) and `npm run build`; both passed.
- Ran 12 live Playwright tests covering metadata, axe, routes, links, focus,
  keyboard use, demo isolation, privacy, and offline behavior; all passed.
- Ran `/opt/fleet/lib/verify-url.sh`; load was 567ms with no console errors,
  one h1, `lang=en`, main, complete alt text, and named buttons.
- Crawled all product links/fragments and GitHub destinations; all resolved.
- Confirmed named routes/assets return 200 and unknown routes return the
  product-designed 404.
- Compared live HTML/JS/CSS hashes with the clean local build; all matched.

## Findings left for repair

- `F-3-1 / B2` BLOCKING: no decision result appears in the first mobile demo
  viewport; only one appears in the desktop demo viewport.
- `F-3-2 / F-2-1` BLOCKING: the universal refusal-log claim is tested with only
  two npm direct requests.
- `F-3-3 / UC-R23` BLOCKING: privacy tests do not intercept storage reads or
  all CLI process network/file access.
- `F-3-4` MINOR: desktop hero facts start below 900px.
- `F-3-5` MINOR: terminal-recording parity is unlisted.
- `F-3-6` MINOR: README package-name disclosure is unlisted.
- `F-3-7 / UC-R22` MINOR: factory deployment/credential ownership is unlisted.

## Next step

Repair every finding in `.factory/review-3.md`, add the specified viewport and
claim tests, deploy through the factory, and repeat the full review from fresh
browser contexts and a new clean clone.
