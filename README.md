# Cooldown Registry Proxy

Block new packages until their cooldown ends.

Cooldown Registry Proxy is for platform and security teams. One Rust binary
checks npm, PyPI, and Cargo requests through a network proxy.

It filters registry lists and rechecks direct package downloads. Every blocked
request adds a JSONL refusal record. Private package hosting, user
authentication, and code scanning are outside its scope.

## Install

Build the single binary with Cargo:

```sh
cargo build --release
install -m 0755 target/release/cooldown-registry-proxy /usr/local/bin/
```

## Try the isolated sample

Run the bundled sample from any directory:

```sh
cooldown-registry-proxy demo
```

The command creates a new temporary workspace. It runs the actual proxy paths
against bundled npm, PyPI, and Cargo fixtures.

The report shows an allowed download, a cooldown block, and an advisory block.
It also records cache files and JSONL refusals inside the workspace. Existing
configuration, caches, and logs are never read.

Open <https://cooldown-registry-proxy.sociobot.in/?demo=1> for the browser
sample. Its state uses a separate `demo:` browser key. The sample reloads
offline after the first visit.

See [`.factory/demo.md`](.factory/demo.md) for the sample contract and reset
steps.

## Run the proxy

Example proxy command:

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

Use HTTP only on a trusted private network. Add TLS at your ingress for other
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

Each exclusion needs a package version, expiry, and reason. Advisory blocks
override exclusions for the same package version.

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
npm run test:browser
npm run build
cargo package --allow-dirty
```

`npm run build` writes the binary to `dist/bin/`. It writes the static site to
`dist/site/`. The factory deploys the site and owns publishing credentials.

## Privacy and security

The documentation site loads no analytics or third-party runtime code. The
proxy contacts only registry and advisory URLs in its configuration.

Cache and refusal files stay in the directory you choose. They can contain
package names, so protect that directory. Read [`SECURITY.md`](SECURITY.md)
before reporting a vulnerability.

## License

MIT. See [`LICENSE`](LICENSE).
