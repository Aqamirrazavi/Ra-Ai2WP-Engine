# Coding Conventions & Standards

## 1. Naming Conventions
- **Files**: kebab-case (`class-rtw-bridge-admin.php`, `theme-converter.ts`).
- **PHP Functions**: `rtw_bridge_` prefix with snake_case (`rtw_bridge_init()`).
- **PHP Classes**: PascalCase with prefix (`RTW_Bridge_Admin`, `RTW_Bridge_API`).
- **TypeScript/JavaScript Functions**: camelCase (`parseReactAst()`, `generateThemeJson()`).
- **CSS Classes**: `rtw-` or `rtw-bridge-` prefix with kebab-case.

## 2. WordPress Security (WPCS 3.4.1)
- **Input Sanitization**: Every input passed to backend logic must be sanitized using `sanitize_text_field`, `sanitize_key`, or `sanitize_textarea_field`.
- **Output Escaping**: Every echoed string must be escaped with `esc_html__()`, `esc_attr__()`, or `esc_url()`.
- **Database Access**: Always use `$wpdb->prepare()` for custom SQL queries to avoid SQL Injection vulnerabilities.
- **CSRF Defense**: Nonces are mandatory for all WordPress admin submissions and REST write requests.

## 3. Git & Commits
- Follow Conventional Commits:
  - `feat(engine): add support for React hooks to Interactivity API`
  - `fix(plugin): sanitize GitHub PAT before dispatch`
  - `docs(guide): update Persian quick-start documentation`
