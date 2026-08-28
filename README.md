# Cooldown Registry Proxy

Block new packages until their cooldown ends.

Cooldown Registry Proxy is for platform and security teams. It applies one npm,
PyPI, and Cargo cooldown across laptops and CI. The Rust binary runs on your
network. It does not need a browser extension or a TLS interception certificate.

The proxy checks metadata and package downloads. It can record refused requests
to a JSONL file. It does not host private packages, authenticate users, or scan
package code.

## Install

Build with Rust 1.85 or newer.

```sh
cargo build --release
install -m 0755 target/release/cooldown-registry-proxy /usr/local/bin/
```

## Try the sample

Run the bundled sample from any directory:

```sh
cooldown-registry-proxy demo
```

The command creates a new temporary workspace. It copies and validates bundled
policy fixtures there. It does not read an existing cache, configuration, or
audit log. See [`.factory/demo.md`](.factory/demo.md) for browser and CLI demo
details.

## Run the proxy

Start a seven-day cooldown on port 8787:

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

Use a trusted private network for HTTP. Put TLS at your own ingress for other
networks.

### npm

```sh
npm config set registry http://registry.internal:8787/npm/
npm install
```

### pip and uv

```sh
pip install --index-url http://registry.internal:8787/pypi/simple/ PACKAGE
UV_INDEX_URL=http://registry.internal:8787/pypi/simple/ uv sync
```

### Cargo

```toml
[source.crates-io]
replace-with = "cooldown"

[source.cooldown]
registry = "sparse+http://registry.internal:8787/cargo/"
```

## Policy files

Exclusions require a package version, expiry, and reason. Advisory blocks use
the same package coordinates and include an ID and reason.

```sh
cooldown-registry-proxy validate \
  --exclusions examples/demo/exclusions.json \
  --advisories examples/demo/advisories.json \
  --json
```

## Test, build, and deploy

```sh
npm ci
npm test
npm run test:claims
npm run build
cargo package --allow-dirty
```

`npm run build` writes the binary to `dist/bin/` and the static documentation
site to `dist/site/`. The factory deploys `dist/site/`; it owns deployment and
publishing credentials. Do not publish from this repository.

## Privacy and security

The documentation site has no analytics or third-party runtime scripts. Your
proxy cache and refusal log can contain package names, so protect them on your
host. Read [`SECURITY.md`](SECURITY.md) before reporting a vulnerability.

## License

MIT. See [`LICENSE`](LICENSE).
