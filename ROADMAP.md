# RTW Converter — Project Roadmap

> **Principle 1**: "Correctness before Breadth."
> Every module is certified across syntax checks, live sandbox activation, and zero WSOD/PHP errors.

---

## 🟢 Phase 1: Classic Theme Compiler & Verification Gate (100% CERTIFIED)

- [x] **Ingestion & Detection Engine**:
  - Safe unpacking (Zip, Tar) with path-traversal prevention.
  - Automatic stack detection (Vite, Next.js Pages/App, CRA, Pure React, Static HTML/CSS/JS).
  - Explicit friendly error reports for unsupported stacks.
- [x] **AST Analysis & Symbol Registry**:
  - JSX/TSX parsing.
  - Component hierarchy mapping.
  - Hook mapping (`useState` → Vanilla JS/AJAX, `useEffect` → `WP_Query`/REST, forms → nonce + handlers).
  - Central Symbol Registry preventing name collisions.
- [x] **Classic Theme Compiler (Non-negotiables)**:
  - 100% of functions/classes wrapped in `if ( ! function_exists(...) )` and `if ( ! class_exists(...) )`.
  - Strict project-specific prefixing for every symbol.
  - Complete `require_once` integrity (no orphan files, no missing files).
  - Standalone compiled CSS (zero dependency on external CDNs like Tailwind Play CDN).
  - Mandatory valid `screenshot.png` (missing = build failure).
- [x] **Automated Verification & Self-Healing Layer**:
  - Syntax verification on all generated PHP files.
  - Isolated live sandbox execution / headless response validation.
  - WSOD prevention and key HTML component presence checks.
  - Dual-mode error reporting (simplified for beginners, raw for developers).
  - Automatic self-healing loop for known error patterns.
- [x] **Golden Fixtures Suite (5 Reference Projects)**:
  - `GF-01`: Modern Portfolio (Vite + React + Tailwind)
  - `GF-02`: Interactive Contact Form (React + Form State + Validation + Submit)
  - `GF-03`: Multi-Page Documentation / Blog (React Router + Nested Nav + Pages)
  - `GF-04`: Product Catalog with Fetch (Next.js Pages / useEffect + Dynamic Listing)
  - `GF-05`: Dashboard with Complex Filter (React State + Multi-criteria Filter + Live Search)

---

## 🟢 Phase 2: Plugin & FSE Block Theme Compilers (100% CERTIFIED)

- [x] **Full Site Editing (FSE) Block Theme Generator**:
  - `theme.json` v3 specification (settings, styles, palette, typography, layout, appearanceTools).
  - HTML block templates (`templates/index.html`, `templates/single.html`, `templates/page.html`, `templates/404.html`).
  - Template parts (`parts/header.html`, `parts/footer.html`).
  - `functions.php` with block theme supports and standalone asset enqueueing.
  - Mandatory valid 1200x900 `screenshot.png`.
- [x] **Modular WordPress Plugin Compiler**:
  - Main plugin file with standard header and strict `ABSPATH` check.
  - Singleton controller class wrapped in `class_exists`.
  - Activation and deactivation lifecycle hooks (`register_activation_hook`, `register_deactivation_hook`).
  - Embeddable shortcode `[plugin-slug]` with attributes and safe output.
  - Settings API integration in WP Admin (`register_setting`, `add_settings_section`, capability `manage_options`).
  - Secure AJAX endpoints with nonce verification (`wp_create_nonce` & `check_ajax_referer`).
  - WordPress.org compliant `readme.txt`.
- [x] **Gutenberg Custom Block Compiler**:
  - `block.json` API version 3 specification.
  - Server-side dynamic rendering (`render.php`) with `get_block_wrapper_attributes`.
  - Block registration in PHP hooked to `init` with `function_exists`.
  - Block editor React components (`src/index.js`, `src/edit.js`, `src/save.js`).
  - Standalone bundled CSS (`build/style-index.css` and `build/index.css`).
- [x] **Phase 2 Verification Test Suite**:
  - Automated tests across 5 reference fixtures testing Block Themes, Plugins, and Gutenberg Blocks (`npm run test:phase2`).

---

## 🟢 Phase 3: User Interface & Ingestion Workflows (100% CERTIFIED)

- [x] **3-Step Beginner Wizard**:
  - گام ۱: انتخاب ورودی (مخزن Git، آرشیو فشرده یا کدهای آماده) + تعیین نام و فرمت خروجی وردپرس.
  - گام ۲: خط لوله خودکار ارزیابی کیفیت، ممیزی استانداردهای WPCS و اجرای شبیه‌ساز زنده.
  - گام ۳: دانلود مستقیم فایل ZIP آماده نصب وردپرس همراه با راهنمای ۳۰ ثانیه‌ای نصب در پیشخوان.
- [x] **Universal CLI Runner (`rtw-convert`)**:
  - ادغام کامل با `RTWCompilerEngine`.
  - قابلیت کلون مستقیم از مخازن گیت‌هاب/گیت‌لب (`https://github.com/...`, `git@...`) همراه با انتخاب شاخه (`--branch`).
  - بازگشایی ایمن آرشیوهای فشرده ZIP/TAR بدون آسیب‌پذیری path-traversal.
  - تولید بسته نصبی فشرده خروجی با سوییچ `--zip`.
  - گزارش‌های فارسی و شفاف از مراحل خط لوله و عملیات رفع خودکار (Self-Healing).

---

## ⏸️ Phase 4: Extended Companion Modules (FROZEN / READY FOR NEXT DEPLOY)

- [x] Android Companion App (`app/`)
- [x] Progressive Web Application (`pwa/`)
- [x] WordPress Companion Plugin & AES-256 Bridge (`wp-github-bridge/`)
- [x] Desktop Client (`apps/desktop/`)
- [x] Serverless REST Webhook Service (`api-service/`)
- [x] Multi-pipeline CI/CD Distribution Suite (`.github/workflows/`)
