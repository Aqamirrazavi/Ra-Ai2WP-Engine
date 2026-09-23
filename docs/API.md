# REST API Reference (`docs/API.md`)

Base URL Namespace: `/wp-json/rtw-bridge/v1/`

## Endpoints

### 1. `POST /dispatch`
Triggers an automated cloud conversion workflow on GitHub Actions.
- **Permission**: `manage_options`
- **Request Body**:
  ```json
  {
    "project_name": "My Theme",
    "output_type": "block-theme",
    "source_code": "export default function App() { ... }"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "سیگنال بیلد با موفقیت به GitHub Actions ارسال گردید!"
  }
  ```

### 2. `POST /webhook`
Receives build completion notifications and downloadable artifact links from GitHub Actions runner.
- **Permission**: Public (validated via HMAC signature or internal secret)
- **Request Body**:
  ```json
  {
    "project_name": "My Theme",
    "status": "completed",
    "artifact_url": "https://github.com/owner/repo/suites/.../artifacts/..."
  }
  ```

### 3. `GET /status`
Fetches current bridge connection details and latest completed conversion metadata.
- **Permission**: `manage_options`
- **Response (200 OK)**:
  ```json
  {
    "connected": true,
    "repository": "Aqamirrazavi/Ra-Ai2WP-Engine",
    "latest_build": { ... }
  }
  ```
