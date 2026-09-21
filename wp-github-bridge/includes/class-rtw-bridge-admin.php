<?php
/**
 * Admin Panel and Settings Manager for RTW GitHub Bridge
 *
 * @package RTW_GitHub_Bridge
 */

if (!defined('ABSPATH')) {
    exit;
}

class RTW_Bridge_Admin {

    public function init() {
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function register_admin_menu() {
        add_menu_page(
            __('RTW GitHub Bridge', 'wp-github-bridge'),
            __('RTW Bridge', 'wp-github-bridge'),
            'manage_options',
            'rtw-github-bridge',
            [$this, 'render_admin_page'],
            'dashicons-superhero',
            65
        );
    }

    public function register_settings() {
        register_setting('rtw_bridge_group', 'rtw_bridge_settings', [
            'type'              => 'array',
            'sanitize_callback' => [$this, 'sanitize_settings'],
            'default'           => [
                'repo_owner'    => 'Aqamirrazavi',
                'repo_name'     => 'Ra-Ai2WP-Engine',
                'branch'        => 'main',
                'github_pat'    => '',
                'event_type'    => 'wp-bridge-convert',
                'auto_activate' => false
            ]
        ]);
    }

    public function sanitize_settings($input) {
        $clean = [];
        $clean['repo_owner']    = sanitize_text_field($input['repo_owner'] ?? 'Aqamirrazavi');
        $clean['repo_name']     = sanitize_text_field($input['repo_name'] ?? 'Ra-Ai2WP-Engine');
        $clean['branch']        = sanitize_text_field($input['branch'] ?? 'main');
        $clean['github_pat']    = sanitize_text_field($input['github_pat'] ?? '');
        $clean['event_type']    = sanitize_text_field($input['event_type'] ?? 'wp-bridge-convert');
        $clean['auto_activate'] = !empty($input['auto_activate']);
        return $clean;
    }

    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_rtw-github-bridge') {
            return;
        }

        wp_enqueue_style(
            'rtw-bridge-admin-css',
            RTW_BRIDGE_PLUGIN_URL . 'assets/css/admin.css',
            ['wp-components'],
            RTW_BRIDGE_VERSION
        );

        wp_enqueue_script(
            'rtw-bridge-admin-js',
            RTW_BRIDGE_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery', 'wp-api-fetch', 'wp-element', 'wp-components'],
            RTW_BRIDGE_VERSION,
            true
        );

        wp_localize_script('rtw-bridge-admin-js', 'rtwBridgeData', [
            'nonce'    => wp_create_nonce('wp_rest'),
            'apiBase'  => rest_url('rtw-bridge/v1/'),
            'settings' => get_option('rtw_bridge_settings')
        ]);
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('شما دسترسی لازم برای مشاهده این صفحه را ندارید.', 'wp-github-bridge'));
        }

        $settings = get_option('rtw_bridge_settings');
        ?>
        <div class="wrap rtw-bridge-wrap" dir="rtl">
            <header class="rtw-header">
                <div class="rtw-header-content">
                    <h1>
                        <span class="dashicons dashicons-superhero"></span>
                        <?php echo esc_html__('سامانه اتصال RTW به GitHub و تبدیل هوشمند React به وردپرس', 'wp-github-bridge'); ?>
                    </h1>
                    <p class="rtw-subtitle">
                        <?php echo esc_html__('مدیریت مستقیم تبدیل‌های React، مخابره سیگنال به GitHub Actions و نصب خودکار بسته‌ها', 'wp-github-bridge'); ?>
                    </p>
                </div>
                <div class="rtw-badge">
                    <span><?php echo esc_html__('نسخه', 'wp-github-bridge'); ?> <?php echo esc_html(RTW_BRIDGE_VERSION); ?></span>
                </div>
            </header>

            <div class="rtw-dashboard-grid">
                <!-- بخش تنظیمات اتصال -->
                <div class="rtw-card">
                    <h2><?php echo esc_html__('تنظیمات اتصال GitHub Actions', 'wp-github-bridge'); ?></h2>
                    <form method="post" action="options.php">
                        <?php
                        settings_fields('rtw_bridge_group');
                        ?>
                        <table class="form-table" role="presentation">
                            <tr>
                                <th scope="row"><label for="rtw_repo_owner"><?php echo esc_html__('نام کاربری مخزن (Owner):', 'wp-github-bridge'); ?></label></th>
                                <td>
                                    <input name="rtw_bridge_settings[repo_owner]" type="text" id="rtw_repo_owner" value="<?php echo esc_attr($settings['repo_owner'] ?? 'Aqamirrazavi'); ?>" class="regular-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="rtw_repo_name"><?php echo esc_html__('نام مخزن (Repository):', 'wp-github-bridge'); ?></label></th>
                                <td>
                                    <input name="rtw_bridge_settings[repo_name]" type="text" id="rtw_repo_name" value="<?php echo esc_attr($settings['repo_name'] ?? 'Ra-Ai2WP-Engine'); ?>" class="regular-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="rtw_branch"><?php echo esc_html__('شاخه هدف (Branch):', 'wp-github-bridge'); ?></label></th>
                                <td>
                                    <input name="rtw_bridge_settings[branch]" type="text" id="rtw_branch" value="<?php echo esc_attr($settings['branch'] ?? 'main'); ?>" class="regular-text" />
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><label for="rtw_github_pat"><?php echo esc_html__('توکن دسترسی شخصی (GitHub PAT):', 'wp-github-bridge'); ?></label></th>
                                <td>
                                    <input name="rtw_bridge_settings[github_pat]" type="password" id="rtw_github_pat" value="<?php echo esc_attr($settings['github_pat'] ?? ''); ?>" class="regular-text" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
                                    <p class="description"><?php echo esc_html__('برای مخابره رویدادهای repository_dispatch نیاز به مجوز repo دارد.', 'wp-github-bridge'); ?></p>
                                </td>
                            </tr>
                        </table>
                        <?php submit_button(esc_html__('ذخیره پیکربندی', 'wp-github-bridge'), 'primary'); ?>
                    </form>
                </div>

                <!-- بخش اکشن سریع و ارسال کد مستقیم به گیت‌هاب -->
                <div class="rtw-card rtw-action-card">
                    <h2><?php echo esc_html__('تبدیل آنلاین کامپوننت React به پکیج وردپرس', 'wp-github-bridge'); ?></h2>
                    <p><?php echo esc_html__('کد کامپوننت React، لینک آرشیو ZIP یا نام پروژه را وارد کنید تا مستقیماً برای سرورهای ابری گیت‌هاب ارسال شود:', 'wp-github-bridge'); ?></p>
                    
                    <div class="rtw-form-group">
                        <label for="rtw_project_title"><?php echo esc_html__('نام تم / پلاگین خروجی:', 'wp-github-bridge'); ?></label>
                        <input type="text" id="rtw_project_title" class="widefat" placeholder="مثال: NextGen Store Theme" />
                    </div>

                    <div class="rtw-form-group">
                        <label for="rtw_output_type"><?php echo esc_html__('فرمت مورد نظر:', 'wp-github-bridge'); ?></label>
                        <select id="rtw_output_type" class="widefat">
                            <option value="block-theme"><?php echo esc_html__('قالب بلوکی مدرن (FSE Block Theme v3)', 'wp-github-bridge'); ?></option>
                            <option value="classic-theme"><?php echo esc_html__('قالب کلاسیک با پشتیبانی RTL', 'wp-github-bridge'); ?></option>
                            <option value="plugin"><?php echo esc_html__('پلاگین با روت‌های REST API', 'wp-github-bridge'); ?></option>
                            <option value="block"><?php echo esc_html__('بلاک گوتنبرگ مجزا (block.json v3)', 'wp-github-bridge'); ?></option>
                        </select>
                    </div>

                    <div class="rtw-form-group">
                        <label for="rtw_code_input"><?php echo esc_html__('کد React (JSX/TSX) یا لینک آرشیو:', 'wp-github-bridge'); ?></label>
                        <textarea id="rtw_code_input" rows="8" class="widefat code-editor" placeholder="export default function HeroSection() { ... }"></textarea>
                    </div>

                    <button type="button" id="rtw_btn_dispatch" class="button button-primary button-hero">
                        <span class="dashicons dashicons-cloud-upload"></span>
                        <?php echo esc_html__('ارسال رویداد به GitHub Actions و شروع بیلد', 'wp-github-bridge'); ?>
                    </button>

                    <div id="rtw_dispatch_status" class="rtw-status-box" style="display: none;"></div>
                </div>
            </div>
        </div>
        <?php
    }
}
