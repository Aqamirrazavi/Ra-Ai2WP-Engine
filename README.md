# ⚡ RTW Converter (React to WordPress Universal Suite)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WordPress: 6.7+](https://img.shields.io/badge/WordPress-6.7%2B-21759B.svg)](https://wordpress.org)
[![React: 18/19](https://img.shields.io/badge/React-18%20%2F%2019-61DAFB.svg)](https://react.dev)
[![FSE Block Theme](https://img.shields.io/badge/FSE-Theme.json%20v3-success.svg)](https://developer.wordpress.org/block-editor/how-to-guides/themes/theme-json/)
[![Gemini 3.1 Pro High Thinking](https://img.shields.io/badge/AI-Gemini%203.1%20High%20Thinking-blueviolet.svg)](https://deepmind.google/technologies/gemini/)

> **The Universal Bridge between modern React / Next.js / AI components and production-ready WordPress environments.**  
> Transform JSX, TSX, state hooks, and component trees into production-grade WordPress Classic Themes, Full Site Editing (FSE) Block Themes v3, Plugins, Custom Gutenberg Blocks, and Single Page Templates adhering to strict **WPCS 3.4.1** security standards.

---

## 🏛️ Monorepo Architecture

This repository is structured as a full developer ecosystem providing multiple touchpoints: CLI, Core Transpiler Engine, REST API Microservice, CI/CD GitHub Action Bridge, and a Mobile Companion Studio:

```text
rtw-converter/
├── core-engine/                # Universal Transpiler & AI Conversion Engine (Node.js/TS)
│   ├── src/
│   │   ├── parser/             # React AST Analyzer & Hook Extractors
│   │   ├── generators/         # WordPress Theme, Plugin, Block & Template Generators
│   │   ├── security/           # WPCS 3.4.1 compliance, sanitization & CVE guards
│   │   └── ai/                 # Gemini 3.1 High-Thinking & Flash-Lite bridges
│   ├── package.json
│   └── tsconfig.json
│
├── cli/                        # Developer CLI tool (`npx rtw-convert`)
│   ├── bin/rtw.js              # Command-line executable
│   └── package.json
│
├── wp-github-bridge/           # WordPress Companion Plugin (Admin Dashboard & Auto-Updater)
│   ├── wp-github-bridge.php    # Plugin entrypoint with Update URI
│   ├── includes/               # REST API (10 routes), DB dbDelta & AES-256 encryption
│   └── assets/                 # React UI, RTL styles and admin scripts
│
├── pwa/                        # Progressive Web Application (Vite / React / Service Worker)
│   ├── index.html              # Offline-ready responsive web client
│   └── sw.js                   # Caching and background sync
│
├── apps/
│   ├── desktop/                # Desktop Client for Windows, macOS, and Linux
│   └── android/ (or app/)      # Android Mobile Companion Studio (Jetpack Compose / M3)
│
├── api-service/                # Express & Serverless REST API for Webhooks & SaaS
│   ├── src/server.ts           # Webhook & conversion microservice
│   └── Dockerfile
│
├── .github/workflows/          # Full CI/CD Distribution & Security Suite
│   ├── rtw-bridge.yml          # Automated repository_dispatch conversion workflow
│   ├── release-builder.yml     # Automated WordPress ZIP packaging & release
│   ├── deploy-pwa.yml          # GitHub Pages deployment pipeline for PWA
│   ├── build-plugin.yml        # Isolated plugin validation and zip packager
│   ├── build-android.yml       # APK and AAB build pipeline
│   ├── publish-npm.yml         # OIDC Provenance publisher to npm registry
│   └── security-scan.yml       # Dependency auditing and CVE-2026 guards
│
├── tests/                       # Comprehensive Automated Test Suite (Part 14 - Section 57)
│   ├── phpunit/                # PHPUnit tests for WordPress Bridge & AES-256 DB
│   ├── unit/                   # Vitest unit tests for Core Engine, CLI & PWA
│   ├── e2e/                    # Playwright End-to-End conversion workflow
│   ├── a11y/                   # WCAG 2.1 AA accessibility validation
│   └── fixtures/               # Golden React & WordPress test fixtures
│
├── docs/                       # Comprehensive Persian & English Documentation
│   ├── GETTING-STARTED-FA.md   # راهنمای شروع سریع (فارسی)
│   ├── FAQ-FA.md               # پرسش‌های متداول و خطایابی (فارسی)
│   ├── ARCHITECTURE.md         # Full system architecture specification
│   ├── API.md                  # REST API routes and specification
│   ├── HOOKS.md                # WordPress Extensibility actions & filters
│   ├── SECURITY.md             # Security policy and 2026 CVE coverage
│   ├── SECRETS_MANAGEMENT.md   # Secrets & cryptographic key management
│   └── BRANCH_PROTECTION.md    # Branch governance and merge rules
│
├── docker-compose.yml          # One-click local deployment for Engine & API
└── README.md                   # Repository Hub Documentation
```

---

## 🚀 Key Capabilities & Services

| Service | Supported Output Formats | Standards & Security |
| :--- | :--- | :--- |
| **FSE Block Themes** | `theme.json` v3, `templates/`, `parts/`, `style.css` | WordPress 6.7+ Full Site Editing, JSON Schema validation |
| **Classic Themes** | `style.css`, `functions.php`, `index.php`, `rtl.css`, `README.txt` | Prefixed hooks (`rtw_`), Nonce verification, strict i18n |
| **Custom Plugins** | Modular PHP classes, PSR-4, Settings API | Nonce checks, REST permission callbacks, capability guards |
| **Gutenberg Blocks** | `block.json` (API v3), `edit.js`, `save.js`, `render.php` | Native block controls, server-side rendering support |
| **Single Page Templates**| `template-custom.php` with `#rtw-root` mounting | Zero-conflict CSS scoping, dynamic script enqueues |

---

## 💻 Quick Start: CLI (`npx rtw-convert`)

You can run RTW Converter directly in any React or Next.js project without manual installation:

```bash
# Convert a React component to a WordPress Block Theme (FSE)
npx rtw-convert ./src/App.tsx --type block-theme --name "My Modern Theme" --out ./build/theme

# Convert a React dashboard to a WordPress Plugin
npx rtw-convert ./src/Dashboard.tsx --type plugin --name "Analytics Studio" --out ./build/plugin

# Output directly to an installable WordPress ZIP
npx rtw-convert ./src/Widget.tsx --type block --zip ./my-gutenberg-block.zip
```

### CLI Options

```text
Usage: rtw-convert [options] <source-file-or-dir>

Options:
  -t, --type <type>        classic-theme | block-theme | plugin | block | single-template (default: "block-theme")
  -n, --name <name>        Project or Theme name (default: "RTW Component")
  -m, --mode <mode>        high-thinking (Gemini 3.1 Pro) | low-latency (Flash Lite)
  -o, --out <path>         Output directory path
  -z, --zip <path>         Package directly into installable WordPress .zip file
  --rtl                    Generate bidirectional RTL stylesheet (rtl.css)
  --api-key <key>          Gemini API Key (optional, falls back to env GEMINI_API_KEY)
  -h, --help               Display help for command
```

---

## 📥 How Users Upload & Transpile Code (Archives, Directories & Cloud)

RTW Converter supports multiple intuitive ingestion channels for users, whether you have a single React component, an entire Next.js project, or a downloaded ZIP archive:

### 1. Web & GitHub Actions Manual Dispatch (No Git Required)
1. Navigate to the **Actions** tab of this repository.
2. Select **RTW Universal WordPress Transpiler** and click **Run workflow**.
3. Choose your format (`block-theme`, `classic-theme`, `plugin`, `block`, or `single-template`).
4. **Input Method A:** Provide a direct URL to any public ZIP/TAR/7z archive containing your React code.
5. **Input Method B:** Provide a folder path (e.g. `src` or `components`).
6. Click **Run**. The cloud runner will unpack the archive, transpile all JSX/TSX hooks, and make the packaged WordPress `.zip` immediately downloadable in the **Artifacts** tab!

### 2. Mobile Companion App (Instant Device Picker)
In the companion Android application (`app/`):
- Tap **آپلود فایل (Upload File)** in the Studio tab to select any local `.jsx`, `.tsx`, or `.json` file from your device storage or Google Drive.
- Hit **تبدیل با هوش مصنوعی** to convert and download the physical WordPress ZIP straight to your phone's Downloads folder!

### 3. Local CLI with Direct Archive & Directory Support
```bash
# Convert an entire React directory
npx rtw-convert ./my-react-project --type block-theme --name "Shop Theme" --zip ./shop-theme.zip

# Directly convert a downloaded ZIP archive (e.g. from v0, Bolt, Lovable, Figma)
npx rtw-convert ./v0-export.zip --type block-theme --zip ./wordpress-theme.zip
```

---

## ⚡ GitHub Actions CI/CD Bridge

Automatically convert React updates to ready-to-use WordPress assets in your GitHub repository:

```yaml
# .github/workflows/rtw-deploy.yml
name: RTW WordPress Packaging
on:
  push:
    branches: [ main ]
  repository_dispatch:
    types: [ wp-bridge-convert ]

jobs:
  build-wordpress-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Build WordPress Theme
        run: |
          npx rtw-convert ./src/App.tsx --type block-theme --zip ./dist/rtw-theme.zip
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: wordpress-theme-zip
          path: ./dist/rtw-theme.zip
```

---

## 📱 Mobile Companion App (Android Studio)

The `app/` module contains a full Android Jetpack Compose companion application for:
- Monitoring conversion pipelines on the go.
- Designing theme graphics and `screenshot.png` assets via Gemini image models.
- Cloud syncing with Firebase Firestore and local Room DB.
- Triggering GitHub Actions via remote dispatch.

---

## 🧪 Testing Suite & Quality Gates (Part 14 - Section 57)

RTW includes a 6-tier test automation suite:
- **PHPUnit**: REST API mock testing and AES-256 token encryption verification (`tests/phpunit/`).
- **Vitest**: Fast unit tests for React AST parsing, CLI options, and PWA state (`tests/unit/`).
- **Playwright**: End-to-end browser tests for the complete conversion lifecycle (`tests/e2e/`).
- **A11y (WCAG 2.1 AA)**: Screen reader compliance, touch targets (≥ 48dp), and contrast validation (`tests/a11y/`).
- **WPCS 3.4.1**: Strict automated PHP linter for all generated themes and plugins.

Run tests locally:
```bash
npm run test:unit      # Execute Vitest
composer test:php      # Execute PHPUnit
npx playwright test    # Execute Playwright E2E
```

---

## 🔐 GitHub Secrets & Branch Protection (Part 14 - Sections 16 & 17)

### Required Secrets
- `RTW_BRIDGE_KEY`: 256-bit key for AES-256-CBC token encryption in WordPress.
- `SIGNING_KEY`: Base64 Android release keystore string.
- `RELEASE_SIGNING_PASSPHRASE`: GPG signature passphrase.
- `GH_TOKEN`: Personal Access Token with repository dispatch permissions.
- `NPM_TOKEN`: Automated package publishing token.

See [`docs/SECRETS_MANAGEMENT.md`](docs/SECRETS_MANAGEMENT.md) and [`docs/BRANCH_PROTECTION.md`](docs/BRANCH_PROTECTION.md) for full setup instructions.

---

## 🔒 Security & Quality Assurance

All generated WordPress code is audited against:
- **WPCS 3.4.1 (WordPress Coding Standards)**
- Proper output escaping (`esc_html`, `esc_attr`, `esc_url`)
- Strict input sanitization (`sanitize_text_field`, `sanitize_key`)
- Nonce verification for all forms and REST API requests (`wp_verify_nonce`, `check_admin_referer`)
- Capability checks (`current_user_can('manage_options')`)

---

## 📄 License
MIT © RTW Universal Project. Open for community contributions and enterprise extensions.
