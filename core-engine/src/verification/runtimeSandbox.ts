import type { GeneratedFile, OutputType } from '../types.ts';
import { OutputType as OutputTypeEnum } from '../types.ts';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface SandboxExecutionResult {
  success: boolean;
  hasFatalError: boolean;
  hasWsod: boolean;
  renderedHtmlLength: number;
  missingElements: string[];
  outputLog: string;
}

export class RuntimeSandbox {
  /**
   * Simulates real WordPress environment activation, hook execution, and headless page rendering.
   * Supports:
   * - Classic Theme (CLASSIC_THEME)
   * - Block Theme / Full Site Editing (BLOCK_THEME)
   * - WordPress Modular Plugin (WP_PLUGIN)
   * - Gutenberg Custom Block (GUTENBERG_BLOCK)
   */
  public static execute(
    files: GeneratedFile[],
    projectName: string,
    outputType: OutputType = OutputTypeEnum.CLASSIC_THEME
  ): SandboxExecutionResult {
    const isPhpAvailable = this.checkPhpCli();

    if (isPhpAvailable) {
      return this.executeWithRealPhp(files, projectName, outputType);
    } else {
      return this.executeWithStaticSimulator(files, projectName, outputType);
    }
  }

  private static checkPhpCli(): boolean {
    try {
      execSync('php -v', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  private static executeWithRealPhp(
    files: GeneratedFile[],
    projectName: string,
    outputType: OutputType
  ): SandboxExecutionResult {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtw_sandbox_'));

    try {
      for (const file of files) {
        const fullPath = path.join(tmpDir, file.filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        if (file.language === 'binary') {
          fs.writeFileSync(fullPath, Buffer.from(file.content, 'base64'));
        } else {
          fs.writeFileSync(fullPath, file.content, 'utf8');
        }
      }

      // Generate dynamic bootstrap script based on OutputType
      const bootstrapPhp = `<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

define('ABSPATH', '${tmpDir}/');
define('WPINC', 'wp-includes');
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', true);

$wp_actions = array();
$wp_filters = array();
$wp_scripts = array();
$wp_styles  = array();
$wp_shortcodes = array();

function add_action($tag, $callback, $priority = 10, $accepted_args = 1) {
    global $wp_actions;
    $wp_actions[$tag][] = $callback;
}

function do_action($tag) {
    global $wp_actions;
    if (isset($wp_actions[$tag])) {
        foreach ($wp_actions[$tag] as $cb) {
            if (is_callable($cb)) call_user_func($cb);
        }
    }
}

function add_shortcode($tag, $callback) {
    global $wp_shortcodes;
    $wp_shortcodes[$tag] = $callback;
}

function do_shortcode($content) { return $content; }
function shortcode_atts($pairs, $atts, $shortcode = '') {
    $out = array();
    foreach ($pairs as $name => $default) {
        if (array_key_exists($name, (array)$atts)) $out[$name] = $atts[$name];
        else $out[$name] = $default;
    }
    return $out;
}

function add_theme_support($feature, $args = null) { return true; }
function add_editor_style($style) { return true; }
function register_nav_menus($locations) { return true; }
function has_nav_menu($location) { return false; }
function wp_nav_menu($args) { echo '<ul class="mock-nav"><li><a href="/">خانه</a></li></ul>'; }

function get_template_directory() { return '${tmpDir}'; }
function get_template_directory_uri() { return 'http://localhost/wp-content/themes/${projectName}'; }
function get_stylesheet_uri() { return get_template_directory_uri() . '/style.css'; }
function plugin_dir_path($file) { return '${tmpDir}/'; }
function plugin_dir_url($file) { return 'http://localhost/wp-content/plugins/${projectName}/'; }
function plugin_basename($file) { return basename($file); }
function load_plugin_textdomain($domain, $deprecated = false, $plugin_rel_path = false) { return true; }

function home_url($path = '') { return 'http://localhost' . $path; }
function admin_url($path = '') { return 'http://localhost/wp-admin/' . $path; }
function is_rtl() { return true; }

function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all') {
    global $wp_styles;
    $wp_styles[$handle] = $src;
}
function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false) {
    global $wp_scripts;
    $wp_scripts[$handle] = $src;
}
function wp_localize_script($handle, $object_name, $l10n) { return true; }
function wp_create_nonce($action = -1) { return 'mock_nonce_' . md5($action); }
function check_ajax_referer($action = -1, $query_arg = false, $die = true) { return 1; }

function register_activation_hook($file, $callback) { return true; }
function register_deactivation_hook($file, $callback) { return true; }
function current_user_can($capability) { return true; }
function add_option($option, $value = '') { return true; }
function get_option($option, $default = false) { return $default; }
function add_options_page($page_title, $menu_title, $capability, $menu_slug, $callback = '') { return true; }
function register_setting($option_group, $option_name, $args = array()) { return true; }
function add_settings_section($id, $title, $callback, $page) { return true; }
function add_settings_field($id, $title, $callback, $page, $section = 'default', $args = array()) { return true; }
function settings_fields($option_group) { echo '<input type="hidden" name="option_page" value="' . esc_attr($option_group) . '" />'; }
function do_settings_sections($page) { echo '<!-- settings sections -->'; }
function submit_button($text = null, $type = 'primary', $name = 'submit', $wrap = true, $other_attributes = null) { echo '<button type="submit">ذخیره</button>'; }
function get_admin_page_title() { return 'تنظیمات افزونه'; }

function register_block_type($file_or_folder, $args = array()) { return true; }
function get_block_wrapper_attributes($extra_attributes = array()) {
    $class = isset($extra_attributes['class']) ? 'class="' . esc_attr($extra_attributes['class']) . '"' : '';
    return $class;
}

function esc_html($text) { return htmlspecialchars((string)$text, ENT_QUOTES, 'UTF-8'); }
function esc_attr($text) { return htmlspecialchars((string)$text, ENT_QUOTES, 'UTF-8'); }
function esc_url($url) { return filter_var($url, FILTER_SANITIZE_URL); }
function esc_html__($text, $domain = 'default') { return esc_html($text); }
function esc_html_e($text, $domain = 'default') { echo esc_html($text); }
function esc_attr_e($text, $domain = 'default') { echo esc_attr($text); }
function __($text, $domain = 'default') { return $text; }
function _e($text, $domain = 'default') { echo $text; }
function date_i18n($format, $timestamp = false) { return date($format, $timestamp ?: time()); }
function sanitize_text_field($str) { return strip_tags(trim((string)$str)); }
function sanitize_email($email) { return filter_var(trim((string)$email), FILTER_SANITIZE_EMAIL); }
function is_email($email) { return (bool)filter_var($email, FILTER_VALIDATE_EMAIL); }
function wp_unslash($val) { return $val; }

function wp_head() { echo '<title>${projectName}</title>'; }
function wp_footer() { echo '<!-- wp_footer -->'; }
function wp_body_open() { echo '<!-- wp_body_open -->'; }
function language_attributes() { echo 'lang="fa-IR" dir="rtl"'; }
function bloginfo($show = '') { echo '${projectName}'; }
function get_bloginfo($show = '') { return '${projectName}'; }
function body_class($class = '') { echo 'class="' . esc_attr($class) . '"'; }
function post_class($class = '') { echo 'class="' . esc_attr($class) . '"'; }

$mock_posts = array((object)array('ID' => 1, 'post_title' => 'Sample Post', 'post_content' => 'Content'));
$mock_index = 0;
function have_posts() { global $mock_posts, $mock_index; return $mock_index < count($mock_posts); }
function the_post() { global $mock_posts, $mock_index; $mock_index++; }
function the_ID() { echo '1'; }
function the_title($before = '', $after = '', $echo = true) { echo $before . 'عنوان پست' . $after; }
function the_permalink() { echo 'http://localhost/sample-post'; }
function get_permalink() { return 'http://localhost/sample-post'; }
function the_excerpt() { echo 'خلاصه مقاله برای تست رندر.'; }
function the_content() { echo '<p>متن کامل مقاله.</p>'; }
function the_posts_pagination($args = array()) { echo '<nav class="pagination"></nav>'; }
function get_the_date($format = '') { return '۱۴۰۳/۰۴/۰۱'; }

function get_header() { if (file_exists('${tmpDir}/header.php')) require '${tmpDir}/header.php'; }
function get_footer() { if (file_exists('${tmpDir}/footer.php')) require '${tmpDir}/footer.php'; }

ob_start();

// OUTPUT-SPECIFIC EXECUTION
$target_type = '${outputType}';
if ($target_type === 'CLASSIC_THEME') {
    require '${tmpDir}/functions.php';
    do_action('after_setup_theme');
    do_action('wp_enqueue_scripts');
    require '${tmpDir}/index.php';
} elseif ($target_type === 'BLOCK_THEME') {
    if (file_exists('${tmpDir}/functions.php')) require '${tmpDir}/functions.php';
    do_action('after_setup_theme');
    do_action('wp_enqueue_scripts');
    if (file_exists('${tmpDir}/parts/header.html')) echo file_get_contents('${tmpDir}/parts/header.html');
    if (file_exists('${tmpDir}/templates/index.html')) echo file_get_contents('${tmpDir}/templates/index.html');
    if (file_exists('${tmpDir}/parts/footer.html')) echo file_get_contents('${tmpDir}/parts/footer.html');
} elseif ($target_type === 'WP_PLUGIN') {
    // Find main php file
    $php_files = glob('${tmpDir}/*.php');
    foreach ($php_files as $f) {
        if (strpos(file_get_contents($f), 'Plugin Name:') !== false) {
            require $f;
            break;
        }
    }
    do_action('plugins_loaded');
    do_action('init');
    do_action('wp_enqueue_scripts');
    // Test shortcode execution
    global $wp_shortcodes;
    foreach ($wp_shortcodes as $tag => $cb) {
        if (is_callable($cb)) {
            echo call_user_func($cb, array('title' => 'Plugin Test'));
        }
    }
} elseif ($target_type === 'GUTENBERG_BLOCK') {
    $block_files = glob('${tmpDir}/*.php');
    foreach ($block_files as $f) {
        if (strpos(file_get_contents($f), 'register_block_type') !== false || strpos(file_get_contents($f), 'Plugin Name:') !== false) {
            require $f;
        }
    }
    do_action('init');
    if (file_exists('${tmpDir}/render.php')) {
        $attributes = array('title' => 'Block Render Test', 'showBadge' => true, 'description' => 'Test Desc');
        $content = '';
        $block = (object)array('name' => 'rtw/test');
        require '${tmpDir}/render.php';
    }
}

$output = ob_get_clean();
echo "---RENDERED_OUTPUT_START---\\n" . $output . "\\n---RENDERED_OUTPUT_END---\\n";
`;

      const bootstrapPath = path.join(tmpDir, 'bootstrap_test.php');
      fs.writeFileSync(bootstrapPath, bootstrapPhp, 'utf8');

      try {
        const stdout = execSync(`php "${bootstrapPath}"`, { stdio: 'pipe' }).toString();
        const hasFatal = stdout.includes('Fatal error') || stdout.includes('Parse error') || stdout.includes('Cannot redeclare');
        const parts = stdout.split('---RENDERED_OUTPUT_START---');
        const rendered = parts.length > 1 ? parts[1].split('---RENDERED_OUTPUT_END---')[0] : '';
        const hasWsod = rendered.trim().length < 40;

        const missingElements: string[] = [];
        if (outputType === OutputTypeEnum.CLASSIC_THEME || outputType === OutputTypeEnum.BLOCK_THEME) {
          if (!rendered.includes('<header') && !rendered.includes('site-header')) missingElements.push('header layout');
          if (!rendered.includes('<footer') && !rendered.includes('site-footer')) missingElements.push('footer layout');
        }

        return {
          success: !hasFatal && !hasWsod && missingElements.length === 0,
          hasFatalError: hasFatal,
          hasWsod,
          renderedHtmlLength: rendered.length,
          missingElements,
          outputLog: stdout
        };
      } catch (err: any) {
        return {
          success: false,
          hasFatalError: true,
          hasWsod: true,
          renderedHtmlLength: 0,
          missingElements: ['All elements'],
          outputLog: err.stdout?.toString() || err.stderr?.toString() || err.message
        };
      }
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {}
    }
  }

  private static executeWithStaticSimulator(
    files: GeneratedFile[],
    projectName: string,
    outputType: OutputType
  ): SandboxExecutionResult {
    const fileMap = new Map(files.map(f => [f.filePath, f.content]));
    const missingElements: string[] = [];
    const logEntries: string[] = [];

    if (outputType === OutputTypeEnum.CLASSIC_THEME) {
      const functionsContent = fileMap.get('functions.php') || '';
      if (!functionsContent.includes('ABSPATH')) {
        return {
          success: false,
          hasFatalError: true,
          hasWsod: true,
          renderedHtmlLength: 0,
          missingElements: ['Security Exit Guard'],
          outputLog: 'functions.php is missing ABSPATH security guard.'
        };
      }

      const headerContent = fileMap.get('header.php') || '';
      const indexContent = fileMap.get('index.php') || '';
      const footerContent = fileMap.get('footer.php') || '';

      if (!headerContent || !indexContent || !footerContent) {
        return {
          success: false,
          hasFatalError: true,
          hasWsod: true,
          renderedHtmlLength: 0,
          missingElements: ['Core template hierarchy'],
          outputLog: 'Missing essential template files (header.php, index.php, or footer.php).'
        };
      }

      const combinedMarkup = headerContent + '\n' + indexContent + '\n' + footerContent;
      if (!combinedMarkup.includes('<header') && !combinedMarkup.includes('site-header')) {
        missingElements.push('header layout');
      }
      if (!combinedMarkup.includes('<footer') && !combinedMarkup.includes('site-footer')) {
        missingElements.push('footer layout');
      }
      if (!combinedMarkup.includes('<main') && !combinedMarkup.includes('site-main')) {
        missingElements.push('main content landmark');
      }

      const hasWsod = combinedMarkup.trim().length < 200;
      return {
        success: missingElements.length === 0 && !hasWsod,
        hasFatalError: false,
        hasWsod,
        renderedHtmlLength: combinedMarkup.length,
        missingElements,
        outputLog: logEntries.join('\n')
      };
    }

    if (outputType === OutputTypeEnum.BLOCK_THEME) {
      const themeJson = fileMap.get('theme.json');
      if (!themeJson) {
        return {
          success: false,
          hasFatalError: true,
          hasWsod: true,
          renderedHtmlLength: 0,
          missingElements: ['theme.json'],
          outputLog: 'Block Theme is missing theme.json'
        };
      }

      const headerPart = fileMap.get('parts/header.html') || '';
      const indexTpl = fileMap.get('templates/index.html') || '';
      const footerPart = fileMap.get('parts/footer.html') || '';

      const combinedMarkup = headerPart + '\n' + indexTpl + '\n' + footerPart;
      if (!combinedMarkup.includes('header')) missingElements.push('header part');
      if (!combinedMarkup.includes('footer')) missingElements.push('footer part');
      if (!combinedMarkup.includes('wp:query')) missingElements.push('wp:query block');

      return {
        success: missingElements.length === 0,
        hasFatalError: false,
        hasWsod: combinedMarkup.length < 100,
        renderedHtmlLength: combinedMarkup.length,
        missingElements,
        outputLog: '[Simulator] FSE Block Theme validated successfully.'
      };
    }

    if (outputType === OutputTypeEnum.WP_PLUGIN) {
      const mainPhp = Array.from(fileMap.entries()).find(([p, c]) => p.endsWith('.php') && c.includes('Plugin Name:'));
      if (!mainPhp) {
        return {
          success: false,
          hasFatalError: true,
          hasWsod: true,
          renderedHtmlLength: 0,
          missingElements: ['Main Plugin File'],
          outputLog: 'Missing main PHP file with Plugin Name header.'
        };
      }

      if (!mainPhp[1].includes('ABSPATH')) {
        missingElements.push('ABSPATH exit check');
      }
      if (!mainPhp[1].includes('register_activation_hook')) {
        missingElements.push('activation hook');
      }
      if (!mainPhp[1].includes('add_shortcode')) {
        missingElements.push('shortcode registration');
      }

      return {
        success: missingElements.length === 0,
        hasFatalError: false,
        hasWsod: false,
        renderedHtmlLength: mainPhp[1].length,
        missingElements,
        outputLog: '[Simulator] WordPress Plugin validated successfully.'
      };
    }

    if (outputType === OutputTypeEnum.GUTENBERG_BLOCK) {
      const blockJson = fileMap.get('block.json');
      const renderPhp = fileMap.get('render.php');

      if (!blockJson || !renderPhp) {
        return {
          success: false,
          hasFatalError: true,
          hasWsod: true,
          renderedHtmlLength: 0,
          missingElements: ['block.json or render.php'],
          outputLog: 'Missing block.json or render.php for Gutenberg Block.'
        };
      }

      if (!renderPhp.includes('get_block_wrapper_attributes')) {
        missingElements.push('get_block_wrapper_attributes call');
      }

      return {
        success: missingElements.length === 0,
        hasFatalError: false,
        hasWsod: false,
        renderedHtmlLength: renderPhp.length,
        missingElements,
        outputLog: '[Simulator] Gutenberg Block validated successfully.'
      };
    }

    return {
      success: true,
      hasFatalError: false,
      hasWsod: false,
      renderedHtmlLength: 100,
      missingElements: [],
      outputLog: '[Simulator] Validation complete.'
    };
  }
}
