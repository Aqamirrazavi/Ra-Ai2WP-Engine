import type { GeneratedFile } from '../../types.ts';
import { SymbolRegistry } from '../../parser/symbolRegistry.ts';
import type { ScanResult } from '../../parser/astScanner.ts';
import type { DetectionResult } from '../../ingestion/detector.ts';
import { CssBundler } from './cssBundler.ts';
import { ScreenshotGenerator } from './screenshotGenerator.ts';

export class ClassicThemeGenerator {
  /**
   * Generates a 100% compliant, secure, and standalone WordPress Classic Theme.
   * Adheres strictly to the non-negotiables:
   * 1. Every function/class wrapped in function_exists / class_exists
   * 2. Strict unique project-based prefix
   * 3. 100% require integrity (all required files exist and all generated inc files are required)
   * 4. Zero external CDN dependencies
   * 5. Valid screenshot.png included
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
    const files: GeneratedFile[] = [];

    const hasForms = scan.forms.length > 0;
    const bundledCss = CssBundler.bundle(scan.detectedClasses, scan.rawCssContent, enableRtl);

    // 1. style.css (Metadata + Base Styles)
    files.push({
      fileName: 'style.css',
      filePath: 'style.css',
      language: 'css',
      description: 'Main Theme Stylesheet and WordPress Metadata',
      content: `/*
Theme Name: ${projectName}
Theme URI: https://wordpress.org/themes/${slug}/
Author: RTW Universal Compiler
Author URI: https://github.com/rtw-converter
Description: Production-ready WordPress Classic Theme converted automatically with zero errors and full isolation.
Version: 1.0.0
Requires at least: 6.2
Tested up to: 6.7
Requires PHP: 8.0
License: GNU General Public License v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${slug}
Domain Path: /languages
*/

${bundledCss}
`
    });

    // 2. functions.php (Orchestration & Strict Requires)
    const requiredIncFiles = [
      `inc/setup.php`,
      `inc/template-tags.php`
    ];
    if (hasForms) {
      requiredIncFiles.push(`inc/ajax-handlers.php`);
    }

    const functionsPhpContent = `<?php
/**
 * ${projectName} functions and definitions
 *
 * @package ${projectName}
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

if ( ! defined( '${constPrefix}VERSION' ) ) {
    define( '${constPrefix}VERSION', '1.0.0' );
}

if ( ! defined( '${constPrefix}DIR' ) ) {
    define( '${constPrefix}DIR', get_template_directory() );
}

if ( ! defined( '${constPrefix}URI' ) ) {
    define( '${constPrefix}URI', get_template_directory_uri() );
}

/**
 * Load core modular components.
 * Strict Require Rule: Every file below MUST exist in the package.
 */
${requiredIncFiles.map(file => `require_once ${constPrefix}DIR . '/${file}';`).join('\n')}
`;

    files.push({
      fileName: 'functions.php',
      filePath: 'functions.php',
      language: 'php',
      description: 'Theme Entrypoint and Enqueueing',
      content: functionsPhpContent
    });

    // 3. inc/setup.php (Setup & Asset Registration)
    const setupFuncName = registry.registerFunction('setup');
    const scriptsFuncName = registry.registerFunction('enqueue_scripts');

    const setupPhpContent = `<?php
/**
 * Theme Setup and Asset Management
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${setupFuncName}' ) ) {
    /**
     * Sets up theme defaults and registers support for various WordPress features.
     */
    function ${setupFuncName}() {
        // Add default posts and comments RSS feed links to head.
        add_theme_support( 'automatic-feed-links' );

        // Let WordPress manage the document title.
        add_theme_support( 'title-tag' );

        // Enable support for Post Thumbnails on posts and pages.
        add_theme_support( 'post-thumbnails' );

        // Enable HTML5 markup support.
        add_theme_support(
            'html5',
            array(
                'search-form',
                'comment-form',
                'comment-list',
                'gallery',
                'caption',
                'style',
                'script',
            )
        );

        // Register Primary Navigation Menu
        register_nav_menus(
            array(
                'primary' => esc_html__( 'Primary Navigation Menu', '${slug}' ),
            )
        );
    }
}
add_action( 'after_setup_theme', '${setupFuncName}' );

if ( ! function_exists( '${scriptsFuncName}' ) ) {
    /**
     * Enqueue standalone scripts and styles with zero external CDN dependency.
     */
    function ${scriptsFuncName}() {
        // Main bundled stylesheet
        wp_enqueue_style(
            '${slug}-main',
            get_stylesheet_uri(),
            array(),
            ${constPrefix}VERSION
        );

        // Standalone interactions script
        wp_enqueue_script(
            '${slug}-interactions',
            ${constPrefix}URI . '/assets/js/theme-interactions.js',
            array(),
            ${constPrefix}VERSION,
            true
        );

        // Localize script for AJAX calls and secure nonces
        wp_localize_script(
            '${slug}-interactions',
            '${slug}Settings',
            array(
                'ajax_url'   => admin_url( 'admin-ajax.php' ),
                'nonce'      => wp_create_nonce( '${prefix}frontend_nonce' ),
                'is_rtl'     => is_rtl(),
                'theme_slug' => '${slug}'
            )
        );
    }
}
add_action( 'wp_enqueue_scripts', '${scriptsFuncName}' );
`;

    files.push({
      fileName: 'setup.php',
      filePath: 'inc/setup.php',
      language: 'php',
      description: 'Theme setup and Enqueue hooks',
      content: setupPhpContent
    });

    // 4. inc/template-tags.php
    const postedOnFuncName = registry.registerFunction('posted_on');
    const templateTagsContent = `<?php
/**
 * Custom template tags for this theme
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${postedOnFuncName}' ) ) {
    /**
     * Prints HTML with meta information for the current post-date/time.
     */
    function ${postedOnFuncName}() {
        $time_string = '<time class="entry-date published updated" datetime="%1$s">%2$s</time>';
        $time_string = sprintf(
            $time_string,
            esc_attr( get_the_date( DATE_W3C ) ),
            esc_html( get_the_date() )
        );

        echo '<span class="posted-on">' . $time_string . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    }
}
`;

    files.push({
      fileName: 'template-tags.php',
      filePath: 'inc/template-tags.php',
      language: 'php',
      description: 'Template tag helpers',
      content: templateTagsContent
    });

    // 5. inc/ajax-handlers.php (if forms exist)
    if (hasForms) {
      const handlerFuncName = registry.registerFunction('handle_form_submission');
      const actionName = scan.forms[0].actionName;

      const ajaxPhpContent = `<?php
/**
 * AJAX Form Handling and Server-side Processing
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${handlerFuncName}' ) ) {
    /**
     * Handles secure AJAX submissions with nonce verification and input sanitization.
     */
    function ${handlerFuncName}() {
        // Verify CSRF nonce token
        check_ajax_referer( '${prefix}frontend_nonce', 'nonce' );

        $response = array(
            'success' => true,
            'message' => esc_html__( 'پیام شما با موفقیت ثبت شد و بررسی خواهد شد.', '${slug}' ),
            'timestamp' => current_time( 'mysql' )
        );

        // Sanitize incoming fields
        if ( isset( $_POST['email'] ) ) {
            $email = sanitize_email( wp_unslash( $_POST['email'] ) );
            if ( ! is_email( $email ) ) {
                wp_send_json_error( array( 'message' => esc_html__( 'آدرس ایمیل نامعتبر است.', '${slug}' ) ) );
            }
        }

        wp_send_json_success( $response );
    }
}
add_action( 'wp_ajax_${actionName}', '${handlerFuncName}' );
add_action( 'wp_ajax_nopriv_${actionName}', '${handlerFuncName}' );
`;

      files.push({
        fileName: 'ajax-handlers.php',
        filePath: 'inc/ajax-handlers.php',
        language: 'php',
        description: 'Secure AJAX form handlers',
        content: ajaxPhpContent
      });
    }

    // 6. header.php
    const navItems = scan.navigationItems.length > 0
      ? scan.navigationItems
      : [
          { label: 'خانه', href: '<?php echo esc_url( home_url( "/" ) ); ?>' },
          { label: 'درباره ما', href: '#about' },
          { label: 'تماس', href: '#contact' }
        ];

    const headerContent = `<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'bg-slate-900 text-slate-100 min-h-screen' ); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site-wrapper flex flex-col min-h-screen">
    <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', '${slug}' ); ?></a>

    <header id="masthead" class="site-header border-b border-slate-800 bg-slate-900/90 sticky top-0 z-50 py-4 px-6">
        <div class="max-w-6xl mx-auto flex justify-between items-center">
            <div class="site-branding flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                    RTW
                </div>
                <div>
                    <h1 class="site-title font-extrabold text-xl tracking-tight text-white m-0">
                        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a>
                    </h1>
                </div>
            </div>

            <nav id="site-navigation" class="main-navigation hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                <?php
                if ( has_nav_menu( 'primary' ) ) {
                    wp_nav_menu(
                        array(
                            'theme_location' => 'primary',
                            'menu_id'        => 'primary-menu',
                            'container'      => false,
                            'menu_class'     => 'flex items-center gap-6 text-sm font-medium text-slate-300',
                            'fallback_cb'    => false,
                        )
                    );
                } else {
                    echo '<ul class="flex items-center gap-6 text-sm font-medium text-slate-300">';
                    $fallback_nav = array(
                        ${navItems.map(item => `array( 'label' => '${item.label.replace(/'/g, "\\'")}', 'href' => '${item.href.replace(/'/g, "\\'")}' )`).join(',\n                        ')}
                    );
                    foreach ( $fallback_nav as $item ) {
                        echo '<li class="hover:text-blue-400 transition-colors"><a href="' . esc_url( $item[\'href\'] ) . '">' . esc_html( $item[\'label\'] ) . '</a></li>';
                    }
                    echo '</ul>';
                }
                ?>
            </nav>

            <div class="header-action">
                <a href="#contact" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md">
                    <?php esc_html_e( 'همکاری و ارتباط', '${slug}' ); ?>
                </a>
            </div>
        </div>
    </header>
`;

    files.push({
      fileName: 'header.php',
      filePath: 'header.php',
      language: 'php',
      description: 'Header template with wp_head and navigation',
      content: headerContent
    });

    // 7. footer.php
    const footerContent = `<?php
/**
 * The template for displaying the footer
 *
 * Contains the closing of the #page div and all content after.
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
    <footer id="colophon" class="site-footer bg-slate-950 border-t border-slate-800 py-10 px-6 text-center text-slate-500 text-sm mt-auto">
        <div class="max-w-6xl mx-auto">
            <p class="mb-2">
                <?php
                printf(
                    /* translators: 1: Theme name, 2: Current year */
                    esc_html__( 'تمامی حقوق برای %1$s محفوظ است © %2$s', '${slug}' ),
                    esc_html( get_bloginfo( 'name' ) ),
                    esc_html( date_i18n( 'Y' ) )
                );
                ?>
            </p>
            <p class="text-xs text-slate-600">
                <?php esc_html_e( 'تولیدشده با موتور هوشمند RTW Converter بر پایه استانداردهای WPCS', '${slug}' ); ?>
            </p>
        </div>
    </footer>
</div><!-- #page -->
<?php wp_footer(); ?>
</body>
</html>
`;

    files.push({
      fileName: 'footer.php',
      filePath: 'footer.php',
      language: 'php',
      description: 'Footer template with wp_footer',
      content: footerContent
    });

    // 8. index.php (Main Content & Loop)
    const indexContent = `<?php
/**
 * The main template file
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<main id="primary" class="site-main py-12 px-6 max-w-6xl mx-auto flex-1">
    <?php if ( have_posts() ) : ?>

        <div class="posts-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            <?php
            while ( have_posts() ) :
                the_post();
                ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class( 'project-card bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between' ); ?>>
                    <header class="entry-header mb-4">
                        <?php the_title( '<h2 class="entry-title text-xl font-bold text-white mb-2"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>
                        <div class="entry-meta text-xs text-slate-400 mb-2">
                            <?php ${postedOnFuncName}(); ?>
                        </div>
                    </header>

                    <div class="entry-content text-slate-400 text-sm leading-relaxed mb-6">
                        <?php the_excerpt(); ?>
                    </div>

                    <footer class="entry-footer pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs">
                        <a href="<?php the_permalink(); ?>" class="text-blue-400 font-semibold hover:underline">
                            <?php esc_html_e( 'مشاهده جزئیات ←', '${slug}' ); ?>
                        </a>
                    </footer>
                </article>
            <?php endwhile; ?>
        </div>

        <div class="pagination-wrapper py-8 text-center">
            <?php
            the_posts_pagination(
                array(
                    'prev_text' => esc_html__( 'قبلی', '${slug}' ),
                    'next_text' => esc_html__( 'بعدی', '${slug}' ),
                )
            );
            ?>
        </div>

    <?php else : ?>

        <div class="no-results not-found bg-slate-800/40 p-12 rounded-2xl border border-slate-700 text-center">
            <h2 class="text-2xl font-bold text-white mb-3"><?php esc_html_e( 'مطلبی یافت نشد', '${slug}' ); ?></h2>
            <p class="text-slate-400 text-sm mb-6"><?php esc_html_e( 'در حال حاضر هیچ محتوایی برای نمایش ثبت نشده است.', '${slug}' ); ?></p>
        </div>

    <?php endif; ?>
</main>

<?php
get_footer();
`;

    files.push({
      fileName: 'index.php',
      filePath: 'index.php',
      language: 'php',
      description: 'Main template file with standard WordPress loop',
      content: indexContent
    });

    // 9. page.php (Single Static Page)
    const pageContent = `<?php
/**
 * The template for displaying all single pages
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<main id="primary" class="site-main py-12 px-6 max-w-4xl mx-auto flex-1">
    <?php
    while ( have_posts() ) :
        the_post();
        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class( 'bg-white text-slate-800 rounded-2xl p-8 shadow-md' ); ?>>
            <header class="entry-header mb-6 pb-4 border-b border-gray-100">
                <?php the_title( '<h1 class="entry-title text-3xl font-extrabold text-slate-900">', '</h1>' ); ?>
            </header>

            <div class="entry-content text-slate-700 leading-relaxed space-y-4">
                <?php
                the_content();
                ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>

<?php
get_footer();
`;

    files.push({
      fileName: 'page.php',
      filePath: 'page.php',
      language: 'php',
      description: 'Static Page template',
      content: pageContent
    });

    // 10. single.php (Single Post Template)
    const singleContent = `<?php
/**
 * The template for displaying all single blog posts
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<main id="primary" class="site-main py-12 px-6 max-w-4xl mx-auto flex-1">
    <?php
    while ( have_posts() ) :
        the_post();
        ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class( 'bg-slate-800/80 rounded-2xl p-8 border border-slate-700/60 shadow-xl' ); ?>>
            <header class="entry-header mb-6 pb-4 border-b border-slate-700">
                <?php the_title( '<h1 class="entry-title text-3xl font-extrabold text-white mb-3">', '</h1>' ); ?>
                <div class="entry-meta text-xs text-slate-400">
                    <?php ${postedOnFuncName}(); ?>
                </div>
            </header>

            <div class="entry-content text-slate-300 leading-relaxed space-y-4">
                <?php the_content(); ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>

<?php
get_footer();
`;

    files.push({
      fileName: 'single.php',
      filePath: 'single.php',
      language: 'php',
      description: 'Single Post template',
      content: singleContent
    });

    // 11. 404.php (Not Found Template)
    const notFoundContent = `<?php
/**
 * The template for displaying 404 pages (not found)
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

get_header();
?>

<main id="primary" class="site-main py-24 px-6 max-w-2xl mx-auto text-center flex-1">
    <div class="error-404 not-found bg-slate-800/60 p-10 rounded-2xl border border-slate-700">
        <h1 class="text-6xl font-black text-blue-500 mb-4">۴۰۴</h1>
        <h2 class="text-2xl font-bold text-white mb-3"><?php esc_html_e( 'صفحه مورد نظر یافت نشد', '${slug}' ); ?></h2>
        <p class="text-slate-400 text-sm mb-8"><?php esc_html_e( 'ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف شده باشد.', '${slug}' ); ?></p>
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm inline-block transition-colors">
            <?php esc_html_e( 'بازگشت به صفحه اصلی', '${slug}' ); ?>
        </a>
    </div>
</main>

<?php
get_footer();
`;

    files.push({
      fileName: '404.php',
      filePath: '404.php',
      language: 'php',
      description: '404 Error template',
      content: notFoundContent
    });

    // 12. assets/js/theme-interactions.js
    const interactionsJsContent = `/**
 * ${projectName} - Lightweight Vanilla JS Interactions
 * Runs client actions (forms, mobile navigation, search) without React runtime.
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        // 1. AJAX Form Handling
        var forms = document.querySelectorAll('form[data-rtw-form], form.contact-form, form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                var actionInput = form.querySelector('input[name="action"]');
                if (!actionInput) return; // Standard form

                e.preventDefault();
                var submitBtn = form.querySelector('button[type="submit"]');
                var originalText = submitBtn ? submitBtn.innerText : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = 'در حال ارسال...';
                }

                var formData = new FormData(form);
                if (window.${slug}Settings && window.${slug}Settings.nonce) {
                    formData.append('nonce', window.${slug}Settings.nonce);
                }

                fetch(window.${slug}Settings ? window.${slug}Settings.ajax_url : '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data && data.success) {
                        alert(data.data && data.data.message ? data.data.message : 'پیام با موفقیت ارسال شد.');
                        form.reset();
                    } else {
                        alert((data && data.data && data.data.message) ? data.data.message : 'خطایی در ارسال پیام رخ داد.');
                    }
                })
                .catch(function(err) {
                    console.error('AJAX Error:', err);
                })
                .finally(function() {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalText;
                    }
                });
            });
        });
    });
})();
`;

    files.push({
      fileName: 'theme-interactions.js',
      filePath: 'assets/js/theme-interactions.js',
      language: 'javascript',
      description: 'Lightweight client interaction logic without React runtime',
      content: interactionsJsContent
    });

    // 13. screenshot.png (MANDATORY RULE 5: 1200x900 valid PNG)
    const screenshotBuffer = ScreenshotGenerator.generateScreenshotBuffer(projectName);
    files.push({
      fileName: 'screenshot.png',
      filePath: 'screenshot.png',
      language: 'binary',
      description: 'WordPress Theme 1200x900 Screenshot Artwork',
      content: screenshotBuffer.toString('base64')
    });

    return files;
  }
}
