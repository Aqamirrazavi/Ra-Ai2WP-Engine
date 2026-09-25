# Branch Protection & CI/CD Governance (Part 14 - Section 17)

To ensure codebase integrity and prevent unauthorized modifications, the following branch protection rules are enforced on `main` and production release branches:

## Rules for `main` Branch

1. **Require Pull Request Reviews before Merging**:
   - Minimum required approvals: **1 Senior Maintainer**.
   - Dismiss stale pull request approvals when new commits are pushed.
   - Require review from Code Owners (`.github/CODEOWNERS`).

2. **Require Status Checks to Pass before Merging**:
   - `build-android / assembleDebug`: Android Gradle compilation.
   - `build-plugin / wpcs`: WordPress Coding Standards (WPCS 3.4.1) validation.
   - `deploy-pwa / build`: Vite React build verification.
   - `security-scan / trivy`: Automated vulnerability & license scan.
   - Require branches to be up to date before merging.

3. **Require Signed Commits**:
   - All commits pushed to `main` must have verified GPG/SSH signatures.

4. **Strict Linear History**:
   - Merge commits are disabled. Enforce **Squash and merge** or **Rebase and merge**.

5. **Restrict Deletions and Force Pushes**:
   - Force push is permanently forbidden for all contributors, including administrators.

6. **Include Administrators**:
   - Governance rules apply universally to maintainers and repository administrators.
