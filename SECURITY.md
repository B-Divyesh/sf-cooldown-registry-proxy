# Security policy

Please report suspected vulnerabilities privately through GitHub Security Advisories for this repository. Do not include real registry credentials, private package names, or production audit logs in a public issue.

`cooldown-registry-proxy` reduces exposure to newly published public-package attacks. It does not prove package safety, inspect package contents, authenticate clients, or protect traffic when deployed without TLS. A cooldown can delay legitimate security fixes; use narrow, expiring exclusions for reviewed emergencies.
