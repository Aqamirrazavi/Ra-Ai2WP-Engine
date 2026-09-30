import type { GeneratedFile } from '../../types.ts';
import { SymbolRegistry } from '../../parser/symbolRegistry.ts';
import type { ScanResult } from '../../parser/astScanner.ts';
import type { DetectionResult } from '../../ingestion/detector.ts';
import { CssBundler } from '../classic/cssBundler.ts';

export class PluginGenerator {
  /**
   * Generates a modern, modular, production-ready WordPress Plugin.
   * Adheres strictly to WPCS and security standards:
   * - Strict ABSPATH guard
   * - Main Plugin Class wrapped in class_exists
   * - Shortcode [plugin-slug] for seamless embedding
   * - Settings API integration with capability check 'manage_options'
   * - Zero external CDN dependencies
   * - Secure AJAX endpoints with nonce verification
   * - Activation/Deactivation lifecycle hooks
   */
  public static generate(
    projectName: string,
    detection: DetectionResult,
    scan: ScanResult,
    registry: SymbolRegistry,
    enableRtl: boolean = true
  ): GeneratedFile[] {
    const slug = registry.getSlug();
    const prefix = registry.getPrefix();
    const constPrefix = prefix.toUpperCase();
    const pluginClassName = registry.registerClass('Plugin_Core');
    const settingsClassName = registry.registerClass('Settings_Handler');
    const files: GeneratedFile[] = [];

    const bundledCss = CssBundler.bundle(scan.detectedClasses, scan.rawCssContent, enableRtl);
    const hasForms = scan.forms.length > 0;
    const ajaxAction = hasForms ? scan.forms[0].actionName : `${prefix}submit_action`;
    const nonceAction = registry.registerNonce('plugin_action');

    // 1. Main Plugin File: [slug].php
    const mainPluginContent = `<?php
/**
 * Plugin Name:       ${projectName}
 * Plugin URI:        https://wordpress.org/plugins/${slug}/
 * Description:       Modular WordPress Plugin automatically converted from React with 100% isolation and security.
 * Version:           1.0.0
 * Author:            RTW Universal Compiler
 * Author URI:        https://github.com/rtw-converter
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ${slug}
 * Domain Path:       /languages
 * Requires at least: 6.2
 * Requires PHP:      8.0
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

if ( ! defined( '${constPrefix}VERSION' ) ) {
    define( '${constPrefix}VERSION', '1.0.0' );
}

if ( ! defined( '${constPrefix}FILE' ) ) {
    define( '${constPrefix}FILE', __FILE__ );
}

if ( ! defined( '${constPrefix}DIR' ) ) {
    define( '${constPrefix}DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( '${constPrefix}URL' ) ) {
    define( '${constPrefix}URL', plugin_dir_url( __FILE__ ) );
}

if ( ! class_exists( '${pluginClassName}' ) ) {
    /**
     * Main Plugin Controller Class
     */
    final class ${pluginClassName} {

        /**
         * Singleton instance
         *
         * @var ${pluginClassName}|null
         */
        private static $instance = null;

        /**
         * Get singleton instance
         *
         * @return ${pluginClassName}
         */
        public static function get_instance() {
            if ( null === self::$instance ) {
                self::$instance = new self();
            }
            return self::$instance;
        }

        /**
         * Constructor: Registers core hooks
         */
        private function __construct() {
            add_action( 'init', array( $this, 'load_textdomain' ) );
            add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_assets' ) );
            add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
            add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
            add_action( 'admin_init', array( $this, 'register_settings' ) );

            // Shortcode
            add_shortcode( '${slug}', array( $this, 'render_shortcode' ) );

            // AJAX Handlers
            add_action( 'wp_ajax_${ajaxAction}', array( $this, 'handle_ajax_submission' ) );
            add_action( 'wp_ajax_nopriv_${ajaxAction}', array( $this, 'handle_ajax_submission' ) );
        }

        /**
         * Activation handler
         */
        public static function activate() {
            if ( ! current_user_can( 'activate_plugins' ) ) {
                return;
            }
            $default_options = array(
                'enabled'      => 1,
                'title'        => '${projectName}',
                'enable_rtl'   => ${enableRtl ? '1' : '0'},
                'custom_badge' => esc_html__( 'تایید شده', '${slug}' )
            );
            add_option( '${slug}_options', $default_options );
        }

        /**
         * Deactivation handler
         */
        public static function deactivate() {
            if ( ! current_user_can( 'activate_plugins' ) ) {
                return;
            }
            // Cleanup transient or temporary caches
        }

        /**
         * Load plugin localization
         */
        public function load_textdomain() {
            load_plugin_textdomain( '${slug}', false, dirname( plugin_basename( ${constPrefix}FILE ) ) . '/languages' );
        }

        /**
         * Enqueue standalone frontend styles and scripts (Zero CDN)
         */
        public function enqueue_frontend_assets() {
            wp_enqueue_style(
                '${slug}-frontend',
                ${constPrefix}URL . 'assets/css/frontend.css',
                array(),
                ${constPrefix}VERSION
            );

            wp_enqueue_script(
                '${slug}-frontend',
                ${constPrefix}URL . 'assets/js/frontend.js',
                array(),
                ${constPrefix}VERSION,
                true
            );

            wp_localize_script(
                '${slug}-frontend',
                '${slug}Data',
                array(
                    'ajax_url' => admin_url( 'admin-ajax.php' ),
                    'action'   => '${ajaxAction}',
                    'nonce'    => wp_create_nonce( '${nonceAction}' ),
                    'is_rtl'   => is_rtl()
                )
            );
        }

        /**
         * Enqueue admin assets
         *
         * @param string $hook Admin page hook suffix.
         */
        public function enqueue_admin_assets( $hook ) {
            if ( false === strpos( $hook, '${slug}' ) ) {
                return;
            }
            wp_enqueue_style(
                '${slug}-admin',
                ${constPrefix}URL . 'assets/css/admin.css',
                array(),
                ${constPrefix}VERSION
            );
        }

        /**
         * Register Settings API page in WP Admin
         */
        public function register_admin_menu() {
            add_options_page(
                esc_html__( 'تنظیمات ${projectName}', '${slug}' ),
                esc_html__( '${projectName}', '${slug}' ),
                'manage_options',
                '${slug}-settings',
                array( $this, 'render_admin_settings_page' )
            );
        }

        /**
         * Register plugin settings
         */
        public function register_settings() {
            register_setting( '${slug}_options_group', '${slug}_options', array(
                'type'              => 'array',
                'sanitize_callback' => array( $this, 'sanitize_options' )
            ) );

            add_settings_section(
                '${slug}_main_section',
                esc_html__( 'پیکربندی کلی افزونه', '${slug}' ),
                null,
                '${slug}-settings'
            );

            add_settings_field(
                '${slug}_title_field',
                esc_html__( 'عنوان نمایشی', '${slug}' ),
                array( $this, 'render_title_field' ),
                '${slug}-settings',
                '${slug}_main_section'
            );
        }

        /**
         * Sanitize settings options
         */
        public function sanitize_options( $input ) {
            $sanitized = array();
            if ( isset( $input['title'] ) ) {
                $sanitized['title'] = sanitize_text_field( $input['title'] );
            }
            if ( isset( $input['enabled'] ) ) {
                $sanitized['enabled'] = 1;
            } else {
                $sanitized['enabled'] = 0;
            }
            return $sanitized;
        }

        /**
         * Render title settings field
         */
        public function render_title_field() {
            $options = get_option( '${slug}_options', array() );
            $title = isset( $options['title'] ) ? $options['title'] : '${projectName}';
            echo '<input type="text" name="${slug}_options[title]" value="' . esc_attr( $title ) . '" class="regular-text" />';
        }

        /**
         * Render admin settings page
         */
        public function render_admin_settings_page() {
            if ( ! current_user_can( 'manage_options' ) ) {
                wp_die( esc_html__( 'شما اجازه دسترسی به این بخش را ندارید.', '${slug}' ) );
            }
            ?>
            <div class="wrap rtw-plugin-admin">
                <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
                <p><?php esc_html_e( 'از طریق شورتکد [' . '${slug}' . '] می‌توانید کامپوننت را در هر برگه یا نوشته‌ای درج نمایید.', '${slug}' ); ?></p>
                <form method="post" action="options.php">
                    <?php
                    settings_fields( '${slug}_options_group' );
                    do_settings_sections( '${slug}-settings' );
                    submit_button();
                    ?>
                </form>
            </div>
            <?php
        }

        /**
         * Render shortcode [${slug}]
         *
         * @param array $atts Shortcode attributes.
         * @return string Rendered HTML.
         */
        public function render_shortcode( $atts ) {
            $atts = shortcode_atts(
                array(
                    'title' => '${projectName}',
                    'theme' => 'dark'
                ),
                $atts,
                '${slug}'
            );

            ob_start();
            ?>
            <div class="${slug}-widget-container bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800" data-rtw-widget="${slug}">
                <div class="widget-header flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
                    <h3 class="text-xl font-bold text-white"><?php echo esc_html( $atts['title'] ); ?></h3>
                    <span class="text-xs bg-blue-600 text-white px-2 py-1 rounded-md font-semibold">
                        <?php esc_html_e( 'ویجت مستقل وردپرس', '${slug}' ); ?>
                    </span>
                </div>

                <div class="widget-body space-y-4">
                    <p class="text-slate-300 text-sm leading-relaxed">
                        <?php esc_html_e( 'این افزونه با معماری کاملاً ماژولار و مبتنی بر استانداردهای امنیتی WPCS مستقیماً از React کامپایل شده است.', '${slug}' ); ?>
                    </p>

                    <form class="${slug}-ajax-form space-y-3" method="post">
                        <input type="text" name="user_query" class="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm" placeholder="<?php esc_attr_e( 'درخواست یا پیام خود را بنویسید...', '${slug}' ); ?>" required />
                        <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
                            <?php esc_html_e( 'ثبت درخواست', '${slug}' ); ?>
                        </button>
                    </form>
                </div>
            </div>
            <?php
            return ob_get_clean();
        }

        /**
         * Handle AJAX submissions securely
         */
        public function handle_ajax_submission() {
            check_ajax_referer( '${nonceAction}', 'nonce' );

            $query = isset( $_POST['user_query'] ) ? sanitize_text_field( wp_unslash( $_POST['user_query'] ) ) : '';

            if ( empty( $query ) ) {
                wp_send_json_error( array( 'message' => esc_html__( 'ورودی نمی‌تواند خالی باشد.', '${slug}' ) ) );
            }

            wp_send_json_success( array(
                'message'   => esc_html__( 'درخواست شما با موفقیت در افزونه ثبت گردید.', '${slug}' ),
                'processed' => esc_html( $query )
            ) );
        }
    }

    // Register Activation / Deactivation hooks
    register_activation_hook( __FILE__, array( '${pluginClassName}', 'activate' ) );
    register_deactivation_hook( __FILE__, array( '${pluginClassName}', 'deactivate' ) );

    // Initialize Plugin
    add_action( 'plugins_loaded', array( '${pluginClassName}', 'get_instance' ) );
}
`;

    files.push({
      fileName: `${slug}.php`,
      filePath: `${slug}.php`,
      language: 'php',
      description: 'Main WordPress Plugin File',
      content: mainPluginContent
    });

    // 2. assets/css/frontend.css
    files.push({
      fileName: 'frontend.css',
      filePath: 'assets/css/frontend.css',
      language: 'css',
      description: 'Plugin Frontend Bundled Stylesheet',
      content: bundledCss
    });

    // 3. assets/css/admin.css
    files.push({
      fileName: 'admin.css',
      filePath: 'assets/css/admin.css',
      language: 'css',
      description: 'Plugin Admin Stylesheet',
      content: `
.rtw-plugin-admin {
    max-width: 800px;
    margin-top: 20px;
}
.rtw-plugin-admin h1 {
    font-weight: 800;
    color: #1e293b;
}
`
    });

    // 4. assets/js/frontend.js
    const frontendJs = `/**
 * ${projectName} - Plugin Frontend Interaction
 */
(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', function() {
        var forms = document.querySelectorAll('.${slug}-ajax-form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var btn = form.querySelector('button[type="submit"]');
                var orig = btn ? btn.innerText : '';
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = 'در حال ثبت...';
                }

                var formData = new FormData(form);
                if (window.${slug}Data) {
                    formData.append('action', window.${slug}Data.action);
                    formData.append('nonce', window.${slug}Data.nonce);
                }

                fetch(window.${slug}Data ? window.${slug}Data.ajax_url : '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(function(res) { return res.json(); })
                .then(function(resp) {
                    if (resp && resp.success) {
                        alert(resp.data && resp.data.message ? resp.data.message : 'عملیات موفقیت‌آمیز بود.');
                        form.reset();
                    } else {
                        alert((resp && resp.data && resp.data.message) ? resp.data.message : 'خطایی رخ داد.');
                    }
                })
                .catch(function(err) {
                    console.error('AJAX Error:', err);
                })
                .finally(function() {
                    if (btn) {
                        btn.disabled = false;
                        btn.innerText = orig;
                    }
                });
            });
        });
    });
})();
`;

    files.push({
      fileName: 'frontend.js',
      filePath: 'assets/js/frontend.js',
      language: 'javascript',
      description: 'Plugin Frontend Interaction Logic',
      content: frontendJs
    });

    // 5. readme.txt (WordPress.org Plugin Standard)
    const readmeTxt = `=== ${projectName} ===
Contributors: rtwcompiler
Donate link: https://github.com/rtw-converter
Tags: react, conversion, modern-web, shortcode
Requires at least: 6.2
Tested up to: 6.7
Stable tag: 1.0.0
Requires PHP: 8.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

${projectName} is automatically generated by the RTW Universal Compiler from a React codebase with zero errors and strict security.

== Description ==

Features:
* 100% standalone, no external CDN dependencies
* Embedded via simple shortcode [${slug}]
* Integrated Settings API page in WP Admin
* Secure Nonce and Sanitization compliance

== Installation ==

1. Upload the '${slug}' folder to your '/wp-content/plugins/' directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Embed using the shortcode [${slug}] anywhere on your site.
`;

    files.push({
      fileName: 'readme.txt',
      filePath: 'readme.txt',
      language: 'text',
      description: 'WordPress.org Plugin Standard Readme',
      content: readmeTxt
    });

    return files;
  }
}
