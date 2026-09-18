# RTW Converter System Architecture

## Overview
RTW Converter transforms React, Next.js, and modern AI-generated frontend components into enterprise-ready WordPress environments. It operates both as an automated CLI / GitHub Action in CI/CD pipelines and as a portable mobile companion application.

```
+-------------------------------------------------------------+
|                      USER ENTRYPOINTS                       |
|   1. CLI (npx rtw-convert)                                   |
|   2. GitHub Actions (repository_dispatch)                   |
|   3. Webhook / REST API (/api/v1/convert)                   |
|   4. Mobile Companion App (Android Studio Client)           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                   CORE TRANSPILER ENGINE                    |
|   - AST Parsing & JSX Traversal                             |
|   - Hook State Analysis (useState -> Transient / REST)      |
|   - Gemini 3.1 Pro High Thinking / Flash Transpilation      |
|   - WPCS 3.4.1 Security Audit & Sanitization Rules          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 WORDPRESS ARTIFACT GENERATOR                |
|   - Block Themes (theme.json v3, templates/, parts/)        |
|   - Classic Themes (functions.php, style.css, rtl.css)      |
|   - Custom Plugins (REST endpoints under rtw/v1)            |
|   - Gutenberg Custom Blocks (block.json v3, edit/save.js)   |
|   - Single Page Templates (#rtw-root enclosure)             |
+-------------------------------------------------------------+
```

## Security & WPCS 3.4.1 Compliance
1. **Output Escaping:** Every dynamic string output MUST use `esc_html()`, `esc_attr()`, or `esc_url()`.
2. **Form & Data Protection:** State updates via POST MUST verify nonces using `wp_verify_nonce()`.
3. **Prefixing:** All functions, handles, constants, and styles must be prefixed with `rtw_` to prevent namespace collisions in WordPress core.
