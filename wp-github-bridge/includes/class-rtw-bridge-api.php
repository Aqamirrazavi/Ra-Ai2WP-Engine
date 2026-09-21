<?php
/**
 * REST API Routes and Webhook Handler for RTW GitHub Bridge
 *
 * @package RTW_GitHub_Bridge
 */

if (!defined('ABSPATH')) {
    exit;
}

class RTW_Bridge_API {

    public function init() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        // Route 1: Trigger GitHub Dispatch from WP Dashboard
        register_rest_route('rtw-bridge/v1', '/dispatch', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_dispatch'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);

        // Route 2: Webhook receiver from GitHub Actions when build finishes
        register_rest_route('rtw-bridge/v1', '/webhook', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_webhook'],
            'permission_callback' => '__return_true'
        ]);

        // Route 3: Check Bridge Status
        register_rest_route('rtw-bridge/v1', '/status', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_status'],
            'permission_callback' => function() {
                return current_user_can('manage_options');
            }
        ]);
    }

    public function handle_dispatch($request) {
        $params = $request->get_json_params();
        $settings = get_option('rtw_bridge_settings');

        $repo_owner = $settings['repo_owner'] ?? 'Aqamirrazavi';
        $repo_name  = $settings['repo_name'] ?? 'Ra-Ai2WP-Engine';
        $pat_token  = $settings['github_pat'] ?? '';

        if (empty($pat_token)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'لطفاً ابتدا در بخش تنظیمات، توکن دسترسی شخصی (GitHub PAT) را وارد نمایید.'
            ], 400);
        }

        $project_name = sanitize_text_field($params['project_name'] ?? 'React WP Project');
        $output_type  = sanitize_text_field($params['output_type'] ?? 'block-theme');
        $source_code  = sanitize_textarea_field($params['source_code'] ?? '');

        // Call GitHub API repository_dispatch
        $url = "https://api.github.com/repos/{$repo_owner}/{$repo_name}/dispatches";
        $body = wp_json_encode([
            'event_type' => 'wp-bridge-convert',
            'client_payload' => [
                'project_name' => $project_name,
                'output_type'  => $output_type,
                'source_code'  => $source_code,
                'callback_url' => rest_url('rtw-bridge/v1/webhook'),
                'timestamp'    => current_time('timestamp')
            ]
        ]);

        $response = wp_remote_post($url, [
            'headers' => [
                'Accept'        => 'application/vnd.github.v3+json',
                'Authorization' => 'token ' . $pat_token,
                'Content-Type'  => 'application/json',
                'User-Agent'    => 'WordPress/' . get_bloginfo('version') . '; RTW-Bridge/' . RTW_BRIDGE_VERSION
            ],
            'body'    => $body,
            'timeout' => 15
        ]);

        if (is_wp_error($response)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'خطا در ارتباط با سرورهای گیت‌هاب: ' . $response->get_error_message()
            ], 500);
        }

        $code = wp_remote_retrieve_response_code($response);
        if ($code === 204) {
            return new WP_REST_Response([
                'success' => true,
                'message' => 'سیگنال بیلد با موفقیت به GitHub Actions ارسال گردید! بیلد در سرورهای ابری آغاز شد.'
            ], 200);
        } else {
            $error_body = wp_remote_retrieve_body($response);
            return new WP_REST_Response([
                'success' => false,
                'message' => "خطای گیت‌هاب (کد {$code}): {$error_body}"
            ], $code);
        }
    }

    public function handle_webhook($request) {
        $data = $request->get_json_params();

        // Security check or token check if provided
        if (empty($data)) {
            return new WP_REST_Response(['status' => 'empty_payload'], 400);
        }

        // Store notification of completed build in WordPress transient
        set_transient('rtw_latest_build', [
            'time'        => current_time('mysql'),
            'artifact_url'=> esc_url_raw($data['artifact_url'] ?? ''),
            'status'      => sanitize_text_field($data['status'] ?? 'completed'),
            'project'     => sanitize_text_field($data['project_name'] ?? 'Theme')
        ], DAY_IN_SECONDS);

        return new WP_REST_Response([
            'success' => true,
            'message' => 'اطلاعات بیلد با موفقیت دریافت و در پیشخوان ثبت شد.'
        ], 200);
    }

    public function get_status() {
        $latest = get_transient('rtw_latest_build');
        $settings = get_option('rtw_bridge_settings');

        return new WP_REST_Response([
            'connected' => !empty($settings['github_pat']),
            'repository'=> ($settings['repo_owner'] ?? '') . '/' . ($settings['repo_name'] ?? ''),
            'latest_build' => $latest ?: null
        ], 200);
    }
}
