<?php
/**
 * Auto-Updater for RTW GitHub Bridge using GitHub Releases and Update URI Header
 *
 * @package RTW_GitHub_Bridge
 */

if (!defined('ABSPATH')) {
    exit;
}

class RTW_Bridge_Updater {

    private $slug;
    private $plugin_data;
    private $repo;

    public function __construct() {
        $this->slug = 'wp-github-bridge';
        $this->repo = 'Aqamirrazavi/Ra-Ai2WP-Engine';
    }

    public function init() {
        add_filter('pre_set_site_transient_update_plugins', [$this, 'check_for_plugin_update']);
        add_filter('plugins_api', [$this, 'plugin_popup_info'], 20, 3);
    }

    /**
     * Check GitHub Releases for newer plugin version
     */
    public function check_for_plugin_update($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }

        $remote_version = $this->get_remote_release_info();
        if (!$remote_version || empty($remote_version['tag_name'])) {
            return $transient;
        }

        $clean_remote = ltrim($remote_version['tag_name'], 'v');
        if (version_compare(RTW_BRIDGE_VERSION, $clean_remote, '<')) {
            $plugin_file = 'wp-github-bridge/wp-github-bridge.php';
            $package_url = $remote_version['zipball_url'] ?? '';

            if (!empty($remote_version['assets'])) {
                foreach ($remote_version['assets'] as $asset) {
                    if (strpos($asset['name'], 'wp-github-bridge') !== false && substr($asset['name'], -4) === '.zip') {
                        $package_url = $asset['browser_download_url'];
                        break;
                    }
                }
            }

            $obj = new stdClass();
            $obj->slug = $this->slug;
            $obj->new_version = $clean_remote;
            $obj->url = 'https://github.com/' . $this->repo;
            $obj->package = $package_url;
            $obj->tested = '6.7';
            $obj->requires = '6.2';
            $obj->requires_php = '8.0';

            $transient->response[$plugin_file] = $obj;
        }

        return $transient;
    }

    public function plugin_popup_info($result, $action, $args) {
        if ($action !== 'plugin_information' || !isset($args->slug) || $args->slug !== $this->slug) {
            return $result;
        }

        $release = $this->get_remote_release_info();
        if (!$release) {
            return $result;
        }

        $res = new stdClass();
        $res->name = 'RTW GitHub Bridge';
        $res->slug = $this->slug;
        $res->version = ltrim($release['tag_name'], 'v');
        $res->author = '<a href="https://github.com/' . $this->repo . '">RTW Core Team</a>';
        $res->homepage = 'https://github.com/' . $this->repo;
        $res->requires = '6.2';
        $res->tested = '6.7';
        $res->sections = [
            'description' => 'Enterprise Bridge connecting WordPress dashboard with GitHub Actions and Gemini AI for automated React-to-WordPress transformations.',
            'changelog'   => $release['body'] ?? 'بروزرسانی‌ها و بهینه‌سازی‌های عملکردی.'
        ];

        return $res;
    }

    private function get_remote_release_info() {
        $cached = get_transient('rtw_bridge_remote_release');
        if ($cached !== false) {
            return $cached;
        }

        $url = "https://api.github.com/repos/{$this->repo}/releases/latest";
        $response = wp_remote_get($url, [
            'headers' => [
                'Accept'     => 'application/vnd.github.v3+json',
                'User-Agent' => 'WordPress/' . get_bloginfo('version')
            ],
            'timeout' => 10
        ]);

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return false;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!empty($data)) {
            set_transient('rtw_bridge_remote_release', $data, HOUR_IN_SECONDS * 6);
            return $data;
        }

        return false;
    }
}
