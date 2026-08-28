# Cooldown Registry Proxy sample

This bundled policy gives `vault-door` a temporary exclusion and an advisory
block. The advisory wins. `cooldown-registry-proxy demo` copies these files to
a new workspace, runs all three proxy paths, and writes a JSON report. It never
reads an existing cache, policy, or audit log.
