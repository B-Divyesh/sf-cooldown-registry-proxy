# cooldown-registry-proxy — Operator Pack v0.1

Licensed supplemental material. The proxy itself remains MIT-licensed and fully functional without this document.

## 1. Production ingress checklist

- Terminate TLS with an organization-issued certificate. Never expose the plain HTTP listener across an untrusted network.
- Restrict ingress to developer VPN ranges, build-runner egress ranges, and approved NAT gateways.
- Reject request bodies and HTTP methods other than `GET` and `HEAD` before they reach the proxy.
- Set a 60-second upstream timeout at the ingress. Allow streaming responses up to the package-size ceiling your team already accepts.
- Preserve the `Host` header or set `--public-url` explicitly so rewritten artifact links remain routable.
- Mount cache and audit volumes separately. Cache may be disposable; audit data should follow your evidence-retention policy.
- Run as a non-root user with write access only to the configured cache and audit paths.
- Alert if `/readyz` is not 200 for two consecutive checks. `/healthz` is only process liveness.

## 2. Rollout sequence

1. Start with a 24-hour cooldown in observe mode by routing one disposable CI job through the proxy and reviewing refusals.
2. Validate `examples/exclusions.json` and your advisory export with `cooldown-registry-proxy --json validate` in the configuration pipeline.
3. Test one pinned old release and one deliberately fresh internal test coordinate for each enabled ecosystem.
4. Move a non-production CI pool, then production CI, then developer network egress. Keep the public registries blocked at the firewall where practical.
5. Raise the cooldown to the approved target only after owners understand the emergency exclusion path.

## 3. SIEM field map

Each refusal is one JSON object per line. Recommended mappings:

| JSON field | SIEM field | Notes |
| --- | --- | --- |
| `timestamp` | `event.created` | UTC RFC 3339 |
| `request_id` | `trace.id` | correlate proxy response and audit event |
| `ecosystem` | `package.type` | `npm`, `pypi`, or `cargo` |
| `package` | `package.name` | treat private-looking names as sensitive |
| `version` | `package.version` | exact requested version |
| `action` | `event.action` | `cooldown_block` or `advisory_block` |
| `reason` | `rule.description` | includes advisory identifier for hard blocks |
| `available_at` | `package.cooldown_until` | absent for permanent hard blocks |

Suggested alerts:

- Page security on any `advisory_block` from a production runner.
- Ticket after 20 cooldown blocks for one coordinate within 15 minutes; this often indicates a lockfile or release automation change.
- Page platform operations if the audit file stops receiving expected events while registry traffic continues.

## 4. Emergency exclusion procedure

1. Confirm the release fixes an exposure whose risk exceeds the remaining cooldown.
2. Review the exact immutable version and hashes; never exclude a range or moving tag.
3. Record the incident/change identifier in `reason` and set the shortest practical `expires` time.
4. Have a second operator review the JSON change.
5. Run `validate`, deploy atomically, then make one package request and confirm an `Excluded` decision without weakening advisory blocks.
6. Remove the exclusion when the cooldown naturally expires. Do not extend it silently.

## 5. Suspected malicious release

1. Add the exact coordinate to the local advisory file; this takes precedence over any exclusion.
2. Confirm direct artifact requests return HTTP 451 and that an `advisory_block` event is written.
3. Search build logs, caches, lockfiles, and deployed software for the package coordinate.
4. Rotate credentials reachable by any runner or workstation that installed the release.
5. Preserve the package artifact only in your incident-evidence store. Remove it from the operational cache after evidence collection.
6. Submit upstream reports through the applicable registry and OSV/GitHub Advisory channels.

## 6. Recovery and cache policy

- Back up exclusions and advisories in version control; do not back up the artifact cache unless required for reproducible builds.
- In an upstream outage, use `--offline` only after confirming the necessary metadata and artifacts are cached. Cache misses intentionally return 503.
- To validate disaster recovery, restore configuration and an empty cache in a separate environment, start online, warm approved lockfiles, switch offline, and repeat the builds.
- Retain refusal logs according to your security evidence policy, then rotate with your host's standard log tooling. The proxy opens the configured log in append mode.
