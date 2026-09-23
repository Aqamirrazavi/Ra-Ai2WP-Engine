# WordPress Extensibility Hooks (`docs/HOOKS.md`)

The `wp-github-bridge` plugin provides actions and filters for developer customization.

## Action Hooks
1. `rtw_bridge_before_convert`: Fired before dispatching a repository event to GitHub Actions.
   - Arguments: `(array $payload)`
2. `rtw_bridge_after_convert`: Fired after a conversion payload is processed.
   - Arguments: `(string $request_id, array $result)`
3. `rtw_bridge_artifact_installed`: Fired after a generated theme or plugin ZIP is unpacked and activated.
   - Arguments: `(string $item_slug, string $type)`
4. `rtw_bridge_token_saved`: Fired when user credentials are updated in the admin settings.
   - Arguments: `(string $repo_owner, string $repo_name)`

## Filter Hooks
1. `rtw_bridge_output_types`: Modify or add supported output formats (default: `block-theme`, `classic-theme`, `plugin`, `block`).
   - Arguments: `(array $types)`
2. `rtw_bridge_dispatch_payload`: Filter client payload before sending to GitHub API.
   - Arguments: `(array $payload)`
3. `rtw_bridge_github_api_timeout`: Filter HTTP request timeout in seconds (default: `15`).
   - Arguments: `(int $timeout)`
