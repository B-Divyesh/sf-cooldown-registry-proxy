# Cooldown Registry Proxy sample

This bundled policy contains a temporary npm exclusion and a Cargo advisory
block. `cooldown-registry-proxy demo` copies these files into a new temporary
workspace before validating them. It never reads an existing cache, policy, or
audit log.
