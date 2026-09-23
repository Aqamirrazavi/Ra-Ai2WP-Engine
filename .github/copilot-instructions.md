# GitHub Copilot Instructions for Ra-Ai2WP-Engine

- **Language Support**: TypeScript, PHP 8.0+, Kotlin, Bash.
- **WP Standards**: Enforce WordPress Coding Standards 3.4.1. Do not generate vulnerable `eval`, `shell_exec`, or unescaped `echo` in PHP.
- **Transpiler AST**: Respect AST contracts in `core-engine/`.
- **RTL & Persian**: For WordPress themes and docs, provide full RTL support via CSS logical properties and UTF-8 handling.
