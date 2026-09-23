# Global Architecture Context - Ra-Ai2WP-Engine

## Architectural Flow
```
[React / Next.js / Archive ZIP / URL]
           │
           ├───────────────┬────────────────────────┐
           ▼               ▼                        ▼
     [WP Bridge Plugin] [CLI: rtw-convert]   [Android Companion App]
           │               │                        │
           └───────────────┼────────────────────────┘
                           ▼
                  [GitHub Actions / REST API]
                           │
                           ▼
                  [Gemini 3.1 & Core AST]
                           │
                           ▼
        [Enterprise WordPress Output (WPCS 3.4.1)]
         ├── Block Theme (theme.json v3 + FSE)
         ├── Classic Theme (with rtl.css)
         ├── WordPress Plugin (REST API routes)
         └── Gutenberg Block (block.json v3)
```

## Shared Data Model
- `request_id`: Unique UUID (string)
- `project_name`: String
- `output_type`: `block-theme` | `classic-theme` | `plugin` | `block` | `single-template`
- `source_type`: `zip_file` | `direct_url` | `jsx_code` | `repo_url`
- `status`: `pending` | `queued` | `processing` | `completed` | `failed`
- `artifact_url`: Direct URL to downloadable `.zip` package

## Security Constraints (2026 CVEs)
- **CVE-2026-45793**: Composer token isolation.
- **CVE-2026-40313**: `persist-credentials: false` on checkouts.
- **CVE-2026-67308**: Shell injection guard via `env:` variables in workflows.
- **CVE-2026-45293**: WPCS upgraded to 3.4.1+.
- **CVE-2026-41249**: Pull request isolation using checkout v7+.
- **CVE-2026-87049**: Job-level `permissions:` declaration.
