<?php
/**
 * Plugin Name:       RTW GitHub Bridge
 * Plugin URI:        https://github.com/Aqamirrazavi/Ra-Ai2WP-Engine
 * Description:       Enterprise Bridge connecting WordPress dashboard with GitHub Actions and Gemini AI for automated React-to-WordPress transformations.
 * Version:           1.1.0
 * Requires at least: 6.2
 * Requires PHP:      8.0
 * Author:            RTW Universal Core Team
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       wp-github-bridge
 * Domain Path:       /languages
 * Update URI:        https://github.com/Aqamirrazavi/Ra-Ai2WP-Engine/releases
 *
 * @package RTW_GitHub_Bridge
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RTW_BRIDGE_VERSION', '1.1.0');
define('RTW_BRIDGE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RTW_BRIDGE_PLUGIN_URL', plugin_dir_url(__FILE__));

// Require Core Modules
require_once RTW_BRIDGE_PLUGIN_DIR . 'includes/class-rtw-bridge-db.php';
require_once RTW_BRIDGE_PLUGIN_DIR . 'includes/class-rtw-bridge-admin.php';
require_once RTW_BRIDGE_PLUGIN_DIR . 'includes/class-rtw-bridge-api.php';
require_once RTW_BRIDGE_PLUGIN_DIR . 'includes/class-rtw-bridge-updater.php';

/**
 * Initialize Plugin Components
 */
function rtw_bridge_init() {
    $admin = new RTW_Bridge_Admin();
    $admin->init();

    $api = new RTW_Bridge_API();
    $api->init();

    $updater = new RTW_Bridge_Updater();
    $updater->init();
}
add_action('plugins_loaded', 'rtw_bridge_init');

/**
 * Activation & Deactivation Hooks
 */
register_activation_hook(__FILE__, function() {
    if (!current_user_can('activate_plugins')) {
        return;
    }

    // Initialize Database Tables with dbDelta
    RTW_Bridge_DB::create_tables();

    // Set default options
    if (!get_option('rtw_bridge_settings')) {
        update_option('rtw_bridge_settings', [
            'repo_owner' => 'Aqamirrazavi',
            'repo_name' => 'Ra-Ai2WP-Engine',
            'branch' => 'main',
            'event_type' => 'wp-bridge-convert',
            'auto_activate' => false
        ]);
    }
});
