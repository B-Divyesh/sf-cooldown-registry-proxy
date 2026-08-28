# Handoff — adversarial review 4

Date: 2026-08-28

Work order: `cooldown-registry-proxy-review-4`

Repository base reviewed: `5e4f5d9fec6ea7bd90354e19134f67087cf25dae`

Live URL: <https://cooldown-registry-proxy.sociobot.in>

## Delivered

- Added `.factory/review-4.md` with a `FAIL` verdict, one blocking finding,
  two minor findings, full landing/README copy inventories, all 24 claim
  results, demo/privacy/structure evidence, and a direct recheck of every
  earlier finding.
- Reopened review-1 M3 because Privacy, Terms, and 404 omit the header SVG used
  on Home and Demo.
- Recorded the dead GitHub `#usage` fragment and the non-verb “Source on
  GitHub” header action.
- Did not modify product code.

## Verification performed

- Fresh Chromium at 390 × 844 and 1440 × 900 before scrolling.
- Live Playwright suite: 14/14 passed, including demo isolation, offline reload,
  same-origin interception, axe scans, keyboard operation, route focus/back,
  first-viewport bounds, and internal status crawl.
- Every `.factory/claims.json` command: 24/24 passed individually from clean
  clone `/tmp/cooldown-review4-clean.MCkUoD`.
- Clean-clone `npm test`: 7 Rust tests and 33 Node tests passed.
- Clean-clone `npm run build`: passed; `dist/bin` and `dist/site` were written.
- CLI `demo` from `/tmp/cooldown-review4-demo.Jc8Hn1`: expected three decisions,
  isolated workspace, and untouched invocation-directory sentinel.
- Live `verify-url.sh`: 853 ms, no console errors, one h1, `lang=en`, main,
  complete alt text, and named buttons.
- Named live routes and assets returned 200; unknown route returned the designed
  404. CSP and security headers were present.
- Built Home HTML matched the live response by SHA-256.

## Remaining work

1. Use the full Home/Demo brand markup on Privacy, Terms, and 404, then test
   exact shared-header parity on every route.
2. Change the setup link from `#usage` to `#run-the-proxy` and make the crawler
   validate external fragments.
3. Rename the header action to “View source on GitHub.”

The product remains buildable. Review acceptance is blocked until all three
findings are fixed and reverified because the required verdict standard is zero
findings.
