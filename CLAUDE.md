# CLAUDE.md - Ra-Ai2WP-Engine (RTW Universal Suite)

## Overview
**Ra-Ai2WP-Engine** (v1.1.0) is a Monorepo transpiler suite that transforms React (JSX/TSX, Next.js, and AI-generated component code) into enterprise-grade, WPCS 3.4.1 compliant WordPress block themes (FSE theme.json v3), classic themes, plugins, and standalone Gutenberg blocks.

## Monorepo Architecture
- `core-engine/`: TypeScript core transpiler AST, AST visitor, parser, and generator logic.
- `cli/`: Node.js CLI tool (`rtw-convert` / `npx rtw-convert`).
- `api-service/`: REST microservice interfacing with Gemini AI (Flash-Lite / High-Thinking).
- `app/`: Android mobile companion client (Kotlin, Jetpack Compose, Material 3).
- `wp-github-bridge/`: Native WordPress companion plugin linking WP Dashboard with GitHub Actions & Auto-Updater.
- `.github/workflows/`: CI/CD workflows (`rtw-bridge.yml`, `release-builder.yml`, `deploy-pwa.yml`).
- `docs/`: Comprehensive Persian & English technical manuals.

## Core Rules & Conventions
1. **Never break existing interface contracts** in `core-engine/` or `api-service/`.
2. **WPCS 3.4.1 Compliance**: All PHP code must use `esc_html`, `esc_attr`, `esc_url`, `wp_verify_nonce`, and prepared statements (`$wpdb->prepare`).
3. **Prefixing**: All PHP functions, classes, and options must use the prefix `rtw_bridge_` or namespace `RaAqamir\RtwBridge`.
4. **Security CVEs**: Enforce SHA-pinned Actions, job-level permissions, and `persist-credentials: false`.
5. **No Hallucinations**: Do not assume unverified APIs or dependencies.

## Key Commands
- CLI Convert: `npx rtw-convert <path-or-archive> --type block-theme`
- Android Applet: Tested and compiled via Gradle (`compile_applet`).
- Linting & Tests: `npm run lint`, `npm test`.
