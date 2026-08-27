# cooldown-registry-proxy

Put one enforceable waiting period between public package registries and every developer or CI runner. `cooldown-registry-proxy` is a self-hosted Rust binary for teams that want new npm, PyPI, and crates.io releases to age before installation—without trusting per-developer settings or installing a TLS interception certificate.

It filters registry metadata, re-checks direct artifact requests, caches immutable package files, supports time-limited emergency exclusions, consumes a simple advisory blocklist feed, and records every refusal as JSONL. It does not host private packages, authenticate users, scan code, or claim to replace a full artifact repository.

## Install

Build the single binary with Rust 1.85 or newer:

```sh
cargo build --release
install -m 0755 target/release/cooldown-registry-proxy /usr/local/bin/
```

Or build and run the container:

```sh
docker compose up --build
```

## Usage

Start a seven-day policy on port 8787:

```sh
cooldown-registry-proxy serve \
  --listen 0.0.0.0:8787 \
  --public-url http://registry.internal:8787 \
  --cooldown 7d \
  --cache-dir /var/lib/cooldown-registry-proxy \
  --exclusions /etc/cooldown/exclusions.json \
  --advisories /etc/cooldown/advisories.json \
  --audit-log /var/log/cooldown-refusals.jsonl
```

The process is intentionally non-interactive and exits non-zero for invalid configuration. Add `--json` for machine-readable startup and validation output. `cooldown-registry-proxy --help` documents every command.

### npm

```sh
npm config set registry http://registry.internal:8787/npm/
npm install
```

### pip / uv

```sh
pip install --index-url http://registry.internal:8787/pypi/simple/ PACKAGE
# or: UV_INDEX_URL=http://registry.internal:8787/pypi/simple/ uv sync
```

### Cargo

```toml
# .cargo/config.toml
[source.crates-io]
replace-with = "cooldown"

[source.cooldown]
registry = "sparse+http://registry.internal:8787/cargo/"
```

HTTP is suitable only on a trusted private network. Put the binary behind your existing TLS ingress for use across untrusted networks.

## Policy files

Exclusions are explicit, version-specific, expire automatically, and require an operator reason:

```json
{
  "exclusions": [
    {
      "ecosystem": "npm",
      "package": "@acme/security-fix",
      "version": "2.4.1",
      "expires": "2026-09-03T12:00:00Z",
      "reason": "CVE-2026-1234 remediation approved by SEC-418"
    }
  ]
}
```

Advisory files and remote `--advisory-url` feeds share one deliberately small schema. A hard block always wins over an exclusion:

```json
{
  "blocked": [
    {
      "ecosystem": "pypi",
      "package": "example-package",
      "version": "1.2.0",
      "id": "MAL-2026-0042",
      "reason": "Credential stealer"
    }
  ]
}
```

Use `cooldown-registry-proxy validate --exclusions ... --advisories ... --json` in CI before deploying a policy change. Multiple `--advisory-url` options may point at internally curated OSV/GitHub Advisory exports; feeds refresh without a restart.

## Response behavior

- Registry metadata omits cooldown-blocked versions and logs each decision.
- Direct downloads return `404` for cooldown blocks and `451` for advisory hard blocks, with a JSON explanation and request ID.
- Upstream errors use a stale cached response when one exists. `--offline` serves cache only and returns `503` with a clear cache-miss error otherwise.
- `/healthz` is a liveness endpoint; `/readyz` verifies the cache directory and loaded policy.

## Development and verification

```sh
cargo test
cargo clippy --all-targets -- -D warnings
cargo build --release

npm install
npm test
npm run build        # binary + site; output under dist/
npm run build:site   # static site only; output under dist/site/
```

The integration suite uses local mock registries and does not depend on public package services. Package readiness can be checked with `cargo package --allow-dirty` (the factory owns publishing credentials; this repository does not publish automatically).

## Deployment

See [`docker-compose.yml`](docker-compose.yml) for a persistent-cache deployment and [`examples/`](examples/) for policy templates. Terminate TLS and apply network access control at your ingress. The static documentation site deploys from `dist/site` to <https://cooldown-registry-proxy.sociobot.in>.

## Security and privacy

The proxy has no telemetry and receives no package-manager credentials by design. Treat registry URLs, package names, audit logs, and cache contents as operationally sensitive. See [`SECURITY.md`](SECURITY.md) for reporting and threat-model boundaries.

## License

MIT. See [`LICENSE`](LICENSE).
