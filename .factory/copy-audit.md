# Copy audit — polish round 1

Date: 2026-08-28

The first screen says the job, user, action, result, privacy, offline behavior,
and price without scrolling at 390 × 844. Its headline has seven words. The
supporting sentence has 16 words. The action result has 11 words.

## Landing sentence inventory

| Words | Sentence | Result |
| ---: | --- | --- |
| 16 | For platform and security teams enforcing one npm, PyPI, and Cargo cooldown across laptops and CI. | Pass |
| 14 | One proxy checks npm, PyPI, and Cargo requests before packages reach laptops or CI. | Pass |
| 10 | Use its npm, PyPI, or Cargo URL in client configuration. | Pass |
| 8 | The proxy compares publish time with your cooldown. | Pass |
| 3 | Allowed files download. | Pass |
| 7 | Each blocked request adds a refusal record. | Pass |
| 7 | Run the binary on a trusted network. | Pass |
| 7 | Then point clients at its registry path. | Pass |
| 12 | Private package hosting, user authentication, and code scanning are outside its scope. | Pass |
| 8 | You operate its network, cache, and refusal log. | Pass |
| 10 | The isolated sample shows one allowed package and two blocks. | Pass |
| 5 | Release-age checks for package registries. | Pass |
| 6 | Built by Param Factory · v0.1.0. | Pass |

Controls and headings are also direct: “Try it with sample data,” “View setup
commands,” “How requests are checked,” “Configure each package manager,” and
“What the proxy does not do.” The landing page contains no banned marketing
word. No landing or README sentence exceeds 22 words; `npm test` enforces both
rules in `public copy uses plain words and keeps every sentence within 22
words`.

## Terminology

| Concept | Required term |
| --- | --- |
| Release-age rule | cooldown |
| Network service | proxy |
| Age decision | blocked by cooldown |
| Security decision | blocked by advisory |
| Denial evidence | refusal record |

Cartographic words remain only in the original artwork description and 404
visual motif. Product behavior, controls, errors, and documentation use the
terms above.
