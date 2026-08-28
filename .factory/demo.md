# Demo sandbox

## Browser entry

Open `https://cooldown-registry-proxy.sociobot.in/?demo=1`. The site redirects
to the canonical `/demo/` route and immediately shows three package decisions:

- npm `signal-router` 4.8.0 is blocked by the seven-day cooldown.
- PyPI `field-notes` 2.3.1 is allowed by age.
- Cargo `vault-door` 0.9.6 is blocked by advisory `MAL-2026-041`.

The persistent banner identifies demo mode. **Reset demo** restores the
seven-day sample. **Start for real** deletes demo state and returns home.

The only demo storage key is
`demo:cooldown-registry-proxy:policy`. Demo code does not read or write other
keys. The service worker caches the sample shell after its first visit, so the
same route can reload offline.

## CLI entry

Run the sample from any directory:

```sh
cooldown-registry-proxy demo
```

The fixtures are embedded in the binary and also live in `examples/demo/` for
inspection. The command creates a unique system-temporary directory. It starts
a private mock registry, then runs the real npm, PyPI, and Cargo proxy request
handlers against it.

The workspace contains:

- `policy/` with the copied exclusion and advisory files;
- `cache/` with the metadata and allowed sample artifact;
- `refusals.jsonl` with each cooldown or advisory refusal;
- `report.json` with decisions, direct HTTP statuses, cache count, and every
  mock-upstream request.

The command prints the workspace path. Remove that directory when finished.
It does not open the current directory's configuration, cache, or log. The
claim test enforces this with a file-open guard and denies non-loopback sockets.
