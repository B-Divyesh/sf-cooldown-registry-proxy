# Copy audit — polish round 3

Date: 2026-08-28

The first screen states the job, user, action, result, privacy, offline behavior,
and price without scrolling at 390 × 844 and 1440 × 900. Its seven-word
headline starts with a verb. The supporting sentence has 16 words. The action
result has 11 words.

## Landing sentence inventory

| Words | Copy | Result |
| ---: | --- | --- |
| 7 | Block new packages until their cooldown ends. | Pass |
| 16 | For platform and security teams enforcing one npm, PyPI, and Cargo cooldown across laptops and CI. | Pass |
| 5 | Try it with sample data. | Pass |
| 11 | See an allowed release, a cooldown block, and an advisory block. | Pass |
| 3 | View setup commands. | Pass |
| 3 | Separate demo data. | Pass |
| 5 | Demo reloads after one visit. | Pass |
| 2 | MIT-licensed source. | Pass |
| 2 | 7-day cooldown. | Pass |
| 4 | Newer releases stop here. | Pass |
| 3 | Filters registry lists. | Pass |
| 3 | Checks direct downloads. | Pass |
| 3 | Records blocked requests. | Pass |
| 14 | One proxy checks npm, PyPI, and Cargo requests before packages reach laptops or CI. | Pass |
| 10 | Use its npm, PyPI, or Cargo URL in client configuration. | Pass |
| 8 | The proxy compares publish time with your cooldown. | Pass |
| 3 | Allowed files download. | Pass |
| 8 | Each blocked package version adds a refusal record. | Pass |
| 7 | Run the binary on a trusted network. | Pass |
| 7 | Then point clients at its registry path. | Pass |
| 5 | Read setup guidance on GitHub. | Pass |
| 4 | Example: 7-day cooldown. | Pass |
| 12 | Private package hosting, user authentication, and code scanning are outside its scope. | Pass |
| 8 | You operate its network, cache, and refusal log. | Pass |
| 4 | Read the privacy notice. | Pass |
| 10 | The isolated sample shows one allowed package and two blocks. | Pass |
| 5 | Release-age checks for package registries. | Pass |
| 6 | Built by Param Factory · v0.1.0. | Pass |

Controls and headings use direct terms: “Try it with sample data,” “View setup
commands,” “How requests are checked,” “Configure each package manager,” and
“What the proxy does not do.” No public sentence exceeds 22 words. The test
`public copy uses plain words and keeps every sentence within 22 words` checks
the landing page and README on every `npm test` run.

The README now scopes the demo isolation sentence to files in the invocation
directory. It also removes the unsupported statement about deployment and
credential ownership. The demo terminal caption names the exact fields its
claim test compares. No README sentence exceeds 22 words.

## Terminology

| Concept | Required term |
| --- | --- |
| Release-age rule | cooldown |
| Network service | proxy |
| Age decision | blocked by cooldown |
| Security decision | blocked by advisory |
| Denial evidence | refusal record |

Cartographic language remains limited to the artwork provenance and the 404
visual motif. Product behavior, controls, errors, and documentation use the
terms above.
