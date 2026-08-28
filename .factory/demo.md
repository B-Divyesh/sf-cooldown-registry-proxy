# Demo sandbox

Open `/demo/` or `/?demo=1` to enter the browser sample. It starts with three
realistic package decisions: a fresh npm release blocked by cooldown, an older
PyPI release allowed, and a Cargo release blocked by advisory `MAL-2026-041`.

The banner stays visible in demo mode. **Reset demo** restores the seven-day
sample. **Start for real** returns to the product landing page. Browser demo
controls use only `localStorage` key `demo:cooldown-registry-proxy:policy` and
never read or update real product data.

For the shipped CLI sample, run:

```sh
cooldown-registry-proxy demo
```

It creates a new temporary workspace, copies `examples/demo/` policy fixtures,
validates them with the actual binary, and prints the workspace path. It does
not read an existing cache, configuration, or audit log. Remove the printed
workspace when finished.
