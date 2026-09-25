# GitHub Secrets & Cryptographic Keys Management (Part 14 - Section 16)

This document details the required cryptographic keys, tokens, and secrets configured in the repository settings to secure CI/CD pipelines, workflows, and cloud bridges.

## Required Repository Secrets

| Secret Name | Description | Used By | Required Format / Generation |
| :--- | :--- | :--- | :--- |
| `RTW_BRIDGE_KEY` | 256-bit symmetric encryption key used for encrypting GitHub tokens in the WordPress database via AES-256-CBC. | WordPress Bridge & API Service | `openssl rand -hex 32` |
| `SIGNING_KEY` | Android Release Keystore base64 string or RSA private key for signing APK/AAB and release artifacts. | `build-android.yml`, `release-builder.yml` | Base64 encoded binary keystore |
| `GH_TOKEN` / `PAT_TOKEN`| GitHub Personal Access Token with `workflow` and `repo` permissions to dispatch `repository_dispatch`. | `rtw-bridge.yml`, WordPress Bridge | Fine-grained PAT or Classic PAT |
| `NPM_TOKEN` | npm Automation Access Token for publishing packages to registry.npmjs.org with 2FA/OIDC bypass. | `publish-npm.yml` | npm Granular Access Token |
| `RELEASE_SIGNING_PASSPHRASE` | Passphrase used to decrypt GPG signatures during multi-platform releases. | `release-builder.yml` | Strong alphanumeric passphrase |
| `FIREBASE_API_KEY` | (Optional) Key for telemetry and error tracking integration. | Android App & Web | Google Cloud / Firebase Console |

## Security Protocols
1. **Zero Secret Leakage in Logs**: All GitHub Actions step definitions strictly mask inputs and forbid echoing token strings.
2. **AES-256-CBC at Rest**: Tokens stored in the WordPress database table `{prefix}_rtw_bridge_conversions` are encrypted using `RTW_BRIDGE_KEY`.
3. **Environment Separation**: Production secrets must never be exposed to PR runs originating from untrusted forks.
