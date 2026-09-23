# Security Policy & CVE Guards (`docs/SECURITY.md`)

## Covered Vulnerability Safeguards (2026)
1. **CVE-2026-45793 (Composer Token Disclosure)**: Composer dependencies locked and environment variable credential leakage prevented.
2. **CVE-2026-40313 (ArtiPACKED)**: `persist-credentials: false` enforced across all GitHub Actions checkout steps; `.git/` removed before packaging.
3. **CVE-2026-67308 (Shell Injection)**: Untrusted inputs passed strictly via workflow `env:` declarations rather than inline script interpolation.
4. **CVE-2026-45293 (WPCS RCE)**: Using WPCS 3.4.1+ and isolated PHP execution sandboxes.
5. **CVE-2026-41249 (Pwn Request)**: Zero execution of untrusted pull requests via `pull_request_target`; standard `pull_request` triggers only.
6. **CVE-2026-87049 (GITHUB_TOKEN Privilege Escalation)**: Minimum least-privilege permissions declared strictly at the individual `job` level.

## Reporting a Vulnerability
To report a vulnerability or security issue, please open a private security advisory on GitHub or email the repository maintainers.
