# RTW Comprehensive Test Suite (Part 14 - Section 57)

This directory contains automated tests for the **Ra-Ai2WP-Engine** Monorepo, covering backend, frontend, CLI, E2E, and Accessibility standards.

## Structure

```
tests/
├── phpunit/                   # PHPUnit tests for WordPress Bridge Plugin and REST API
│   ├── bootstrap.php          # WordPress test environment bootstrap mock
│   ├── test-rtw-bridge-api.php# REST API endpoints & HMAC validation tests
│   └── test-rtw-bridge-db.php # Database migrations & AES-256 encryption tests
├── unit/                      # JS / TS unit tests (Vitest)
│   ├── core-engine.test.ts    # Transpilation logic & AST parsing
│   ├── cli.test.ts            # Command-line flags and argument parsing
│   └── pwa.test.tsx           # React PWA UI components & state transitions
├── e2e/                       # End-to-End tests (Playwright)
│   └── bridge-flow.spec.ts    # Full conversion cycle from React to WordPress
├── a11y/                      # Accessibility compliance (WCAG 2.1 AA)
│   └── accessibility.spec.ts  # Axe-core screen reader and contrast verification
└── fixtures/                  # Reusable test payloads and golden files
    ├── sample-react-component.tsx
    └── expected-wordpress-output.php
```

## Running Tests

### 1. PHPUnit Tests
```bash
composer test:php
# or
vendor/bin/phpunit -c phpunit.xml
```

### 2. Unit Tests (Vitest)
```bash
npm run test:unit
```

### 3. End-to-End & A11y Tests
```bash
npx playwright test
```

## Coverage Goals
- **Lines**: ≥ 75%
- **Functions**: ≥ 80%
- **Branches**: ≥ 70%
- **Accessibility**: 100% WCAG 2.1 AA compliance (zero critical violations)
