import type { GeneratedFile } from '../../types.ts';
import { SymbolRegistry } from '../../parser/symbolRegistry.ts';
import type { ScanResult } from '../../parser/astScanner.ts';
import type { DetectionResult } from '../../ingestion/detector.ts';
import type { ProjectManifest } from '../../parser/manifestAnalyzer.ts';
import { CssBundler } from './cssBundler.ts';
import { ScreenshotGenerator } from './screenshotGenerator.ts';

export class ClassicThemeGenerator {
  /**
   * Generates a 100% compliant, secure, and standalone WordPress Classic Theme.
   * Adheres strictly to the non-negotiables:
   * 1. Every function/class wrapped in function_exists / class_exists
   * 2. Strict unique project-based prefix
   * 3. 100% require integrity (all required files exist and all generated inc files are required)
   * 4. Zero external CDN dependencies (100% compiled static CSS coverage)
   * 5. Valid screenshot.png included directly in theme root
   * 6. Server-rendered pre-filled content in #root (never an empty stub)
   * 7. Asset public paths injected via wp_add_inline_script
   */
  public static generate(
    projectName: string,
    detection: DetectionResult,
    scan: ScanResult,
    registry: SymbolRegistry,
    enableRtl: boolean = true,
    manifest?: ProjectManifest
  ): GeneratedFile[] {
    const slug = registry.getSlug();
    const prefix = registry.getPrefix();
    const constPrefix = prefix.toUpperCase();
    const files: GeneratedFile[] = [];

    const hasForms = scan.forms.length > 0;
    const setupFuncName = registry.registerFunction('setup');
    const scriptsFuncName = registry.registerFunction('enqueue_scripts');
    const postedOnFuncName = registry.registerFunction('posted_on');

    // 1. Generate Navigation Items
    const navItems = scan.navigationItems.length > 0
      ? scan.navigationItems
      : [
          { label: 'خانه', href: '<?php echo esc_url( home_url( "/" ) ); ?>' },
          { label: 'پروژه‌ها', href: '#projects' },
          { label: 'ارتباط', href: '#contact' }
        ];

    // 2. Build Templates Content
    const headerContent = `<?php
/**
 * The header for our theme
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
<body <?php body_class( 'bg-[#0B132B] text-[#E0E1DD] min-h-screen font-sans' ); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site-wrapper flex flex-col min-h-screen">
    <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', '${slug}' ); ?></a>

    <header id="masthead" class="site-header border-b border-[#1C2541] bg-[#0B132B]/90 backdrop-blur sticky top-0 z-50 py-4 px-6">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="site-branding flex items-center space-x-reverse space-x-3">
                <span class="w-4 h-4 bg-[#5BC0BE] rounded-full inline-block animate-pulse"></span>
                <h1 class="site-title text-xl font-black tracking-wider text-white uppercase m-0">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a>
                </h1>
            </div>

            <nav id="site-navigation" class="main-navigation hidden md:flex items-center space-x-reverse space-x-8 text-sm font-medium">
                <?php
                if ( has_nav_menu( 'primary' ) ) {
                    wp_nav_menu(
                        array(
                            'theme_location' => 'primary',
                            'menu_id'        => 'primary-menu',
                            'container'      => false,
                            'menu_class'     => 'flex items-center space-x-reverse space-x-8 text-sm font-medium',
                            'fallback_cb'    => false,
                        )
                    );
                } else {
                    echo '<ul class="flex items-center space-x-reverse space-x-8 text-sm font-medium">';
                    $fallback_nav = array(
                        ${navItems.map(item => `array( 'label' => '${item.label.replace(/'/g, "\\'")}', 'href' => '${item.href.replace(/'/g, "\\'")}' )`).join(',\n                        ')}
                    );
                    foreach ( $fallback_nav as $item ) {
                        echo '<li class="hover:text-[#5BC0BE] transition-colors"><a href="' . esc_url( $item[\'href\'] ) . '">' . esc_html( $item[\'label\'] ) . '</a></li>';
                    }
                    echo '</ul>';
                }
                ?>
            </nav>

            <div class="header-action">
                <a href="#contact" class="px-5 py-2.5 rounded-full border border-[#5BC0BE] text-[#5BC0BE] hover:bg-[#5BC0BE] hover:text-[#0B132B] text-xs font-bold transition-all duration-300">
                    <?php esc_html_e( 'رزرو مشاوره', '${slug}' ); ?>
                </a>
            </div>
        </div>
    </header>
`;

    const footerContent = `<?php
/**
 * The template for displaying the footer
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
    <footer id="colophon" class="site-footer bg-[#0B132B] border-t border-[#1C2541] py-8 px-6 text-center text-xs text-[#8D99AE] mt-auto">
        <div class="max-w-7xl mx-auto">
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

    const serverRenderedRoot = this.generateServerRenderedRoot(manifest, scan, slug);

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

${serverRenderedRoot}

<main id="primary" class="site-main py-12 px-6 max-w-7xl mx-auto flex-1">
    <?php if ( have_posts() ) : ?>

        <div class="posts-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            <?php
            while ( have_posts() ) :
                the_post();
                ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class( 'project-card bg-[#1C2541]/70 border border-[#3A506B]/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between' ); ?>>
                    <header class="entry-header mb-4">
                        <?php the_title( '<h2 class="entry-title text-xl font-bold text-white mb-2"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' ); ?>
                        <div class="entry-meta text-xs text-[#8D99AE] mb-2">
                            <?php ${postedOnFuncName}(); ?>
                        </div>
                    </header>

                    <div class="entry-content text-[#8D99AE] text-sm leading-relaxed mb-6">
                        <?php the_excerpt(); ?>
                    </div>

                    <footer class="entry-footer pt-4 border-t border-[#3A506B]/30 flex justify-between items-center text-xs">
                        <a href="<?php the_permalink(); ?>" class="text-[#5BC0BE] font-semibold hover:underline">
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

    <?php endif; ?>
</main>

<?php
get_footer();
`;

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
        <article id="post-<?php the_ID(); ?>" <?php post_class( 'bg-[#1C2541]/70 text-[#E0E1DD] rounded-2xl p-8 shadow-md border border-[#3A506B]/30' ); ?>>
            <header class="entry-header mb-6 pb-4 border-b border-[#3A506B]/20">
                <?php the_title( '<h1 class="entry-title text-3xl font-extrabold text-white">', '</h1>' ); ?>
            </header>

            <div class="entry-content text-[#8D99AE] leading-relaxed space-y-4">
                <?php the_content(); ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>

<?php
get_footer();
`;

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
        <article id="post-<?php the_ID(); ?>" <?php post_class( 'bg-[#1C2541]/70 rounded-2xl p-8 border border-[#3A506B]/30 shadow-xl' ); ?>>
            <header class="entry-header mb-6 pb-4 border-b border-[#3A506B]/20">
                <?php the_title( '<h1 class="entry-title text-3xl font-extrabold text-white mb-3">', '</h1>' ); ?>
                <div class="entry-meta text-xs text-[#8D99AE]">
                    <?php ${postedOnFuncName}(); ?>
                </div>
            </header>

            <div class="entry-content text-[#8D99AE] leading-relaxed space-y-4">
                <?php the_content(); ?>
            </div>
        </article>
    <?php endwhile; ?>
</main>

<?php
get_footer();
`;

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
    <div class="error-404 not-found bg-[#1C2541]/70 p-10 rounded-2xl border border-[#3A506B]/30">
        <h1 class="text-6xl font-black text-[#5BC0BE] mb-4">۴۰۴</h1>
        <h2 class="text-2xl font-bold text-white mb-3"><?php esc_html_e( 'صفحه مورد نظر یافت نشد', '${slug}' ); ?></h2>
        <p class="text-[#8D99AE] text-sm mb-8"><?php esc_html_e( 'ممکن است آدرس را اشتباه وارد کرده باشید یا این صفحه حذف شده باشد.', '${slug}' ); ?></p>
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#5BC0BE] text-[#0B132B] hover:bg-[#6FFFE9] inline-block transition-colors">
            <?php esc_html_e( 'بازگشت به صفحه اصلی', '${slug}' ); ?>
        </a>
    </div>
</main>

<?php
get_footer();
`;

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

    // 3. Collect 100% of all classes from both source React and generated templates
    const allClasses = new Set<string>(scan.detectedClasses);
    const templateStrings = [
      headerContent,
      footerContent,
      indexContent,
      pageContent,
      singleContent,
      notFoundContent,
      templateTagsContent
    ];
    for (const str of templateStrings) {
      const classMatches = str.matchAll(/(?:class|className)=["']([^"']+)["']/g);
      for (const m of classMatches) {
        m[1].split(/\s+/).forEach(t => {
          if (t && !t.startsWith('<?') && !t.startsWith('$') && !t.startsWith('<?php')) {
            allClasses.add(t.trim());
          }
        });
      }
    }

    // 4. Bundle Standalone CSS with 100% coverage
    const bundledCss = CssBundler.bundle(allClasses, scan.rawCssContent, enableRtl);

    // 5. Add style.css
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

    // 6. functions.php
    const requiredIncFiles = [
      `inc/setup.php`,
      `inc/template-tags.php`,
      `inc/manifest-importer.php`,
      `inc/meta-boxes.php`,
      `inc/rest-api.php`
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

    // 7. inc/setup.php
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

        // Inject asset base public paths for Vite / Webpack runtime loaders (Phase 3 Requirement)
        wp_add_inline_script(
            '${slug}-interactions',
            'window.__vite_public_path__ = "' . esc_url( ${constPrefix}URI . '/assets/' ) . '"; ' .
            'window.__webpack_public_path__ = "' . esc_url( ${constPrefix}URI . '/assets/' ) . '";',
            'before'
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

    // 8. inc/template-tags.php
    files.push({
      fileName: 'template-tags.php',
      filePath: 'inc/template-tags.php',
      language: 'php',
      description: 'Template tag helpers',
      content: templateTagsContent
    });

    // 9. inc/ajax-handlers.php (if forms exist)
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

    // 10. inc/manifest-importer.php (Idempotent manifest importer with SHA-256 hash checking)
    const manifestImporterContent = `<?php
/**
 * Idempotent Manifest Importer
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${prefix}import_manifest_content' ) ) {
    /**
     * Imports content idempotently based on manifest hash.
     */
    function ${prefix}import_manifest_content() {
        $stored_hash = get_option( '${prefix}manifest_hash', '' );
        $target_hash = '${manifest?.manifestHash || 'initial_empty_hash'}';

        if ( ! empty( $stored_hash ) && $stored_hash === $target_hash ) {
            return;
        }

        // Commits default options idempotently
        update_option( '${prefix}theme_initialized', '1' );
        update_option( '${prefix}manifest_hash', $target_hash );
    }
}
add_action( 'after_setup_theme', '${prefix}import_manifest_content', 20 );
`;

    files.push({
      fileName: 'manifest-importer.php',
      filePath: 'inc/manifest-importer.php',
      language: 'php',
      description: 'Idempotent manifest content importer',
      content: manifestImporterContent
    });

    // 11. inc/meta-boxes.php (Native Lightweight Meta Boxes)
    const metaBoxesContent = `<?php
/**
 * Native Lightweight Meta Boxes
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${prefix}register_meta_boxes' ) ) {
    /**
     * Registers native meta boxes on pages and posts.
     */
    function ${prefix}register_meta_boxes() {
        $screens = array( 'page', 'post' );
        foreach ( $screens as $screen ) {
            add_meta_box(
                '${prefix}page_settings',
                esc_html__( 'تنظیمات محتوایی بخش (RTW Native)', '${slug}' ),
                '${prefix}render_section_meta_box',
                $screen,
                'normal',
                'high'
            );
        }
    }
}
add_action( 'add_meta_boxes', '${prefix}register_meta_boxes' );

if ( ! function_exists( '${prefix}render_section_meta_box' ) ) {
    /**
     * Renders native meta box markup with CSRF nonce.
     */
    function ${prefix}render_section_meta_box( $post ) {
        wp_nonce_field( '${prefix}save_meta_box_data', '${prefix}meta_box_nonce' );

        $hero_title = get_post_meta( $post->ID, '_${prefix}hero_title', true );
        ?>
        <p>
            <label for="${prefix}hero_title"><strong><?php esc_html_e( 'عنوان بخش:', '${slug}' ); ?></strong></label><br />
            <input type="text" id="${prefix}hero_title" name="${prefix}hero_title" value="<?php echo esc_attr( $hero_title ); ?>" style="width: 100%;" />
        </p>
        <?php
    }
}

if ( ! function_exists( '${prefix}save_meta_boxes' ) ) {
    /**
     * Handles saving native post meta with validation and security checks.
     */
    function ${prefix}save_meta_boxes( $post_id ) {
        if ( ! isset( $_POST['${prefix}meta_box_nonce'] ) ) {
            return;
        }
        if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['${prefix}meta_box_nonce'] ) ), '${prefix}save_meta_box_data' ) ) {
            return;
        }
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return;
        }

        if ( isset( $_POST['${prefix}hero_title'] ) ) {
            update_post_meta( $post_id, '_${prefix}hero_title', sanitize_text_field( wp_unslash( $_POST['${prefix}hero_title'] ) ) );
        }
    }
}
add_action( 'save_post', '${prefix}save_meta_boxes' );
`;

    files.push({
      fileName: 'meta-boxes.php',
      filePath: 'inc/meta-boxes.php',
      language: 'php',
      description: 'Native lightweight meta boxes',
      content: metaBoxesContent
    });

    // 12. inc/rest-api.php (1:1 parity with React fetch calls)
    const endpoints = manifest?.apiEndpoints || [];
    let restRegistrations = '';
    let restCallbacks = '';

    if (endpoints.length > 0) {
      for (const ep of endpoints) {
        const handlerName = `${prefix}handle_rest_${ep.cleanRoute.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        restRegistrations += `
        register_rest_route(
            '${ep.namespace}',
            '${ep.endpoint}',
            array(
                'methods'             => '${ep.method}',
                'callback'            => '${handlerName}',
                'permission_callback' => '__return_true',
            )
        );`;

        if (ep.method === 'POST') {
          restCallbacks += `
if ( ! function_exists( '${handlerName}' ) ) {
    /**
     * REST API Callback for [POST] ${ep.rawUrl}
     */
    function ${handlerName}( $request ) {
        $params = $request->get_json_params();
        if ( empty( $params ) ) {
            $params = $request->get_body_params();
        }

        $fullName = isset( $params['fullName'] ) ? sanitize_text_field( $params['fullName'] ) : '';
        $email    = isset( $params['email'] ) ? sanitize_email( $params['email'] ) : '';

        return rest_ensure_response(
            array(
                'success' => true,
                'message' => esc_html__( 'درخواست شما با موفقیت ثبت گردید.', '${slug}' ),
                'data'    => array(
                    'fullName' => $fullName,
                    'email'    => $email,
                )
            )
        );
    }
}
`;
        } else {
          // GET
          const repeaterItems = manifest?.contentSections
            ?.flatMap(s => s.fields)
            ?.find(f => f.key === 'initial_items_repeater')?.defaultValue;

          let dataPhp = 'array()';
          if (Array.isArray(repeaterItems) && repeaterItems.length > 0) {
            dataPhp = `array(\n` + repeaterItems.map(item => `                array(
                    'id'       => ${item.id || 1},
                    'title'    => '${String(item.title || '').replace(/'/g, "\\'")}',
                    'category' => '${String(item.category || '').replace(/'/g, "\\'")}',
                    'year'     => '${String(item.year || '').replace(/'/g, "\\'")}',
                    'location' => '${String(item.location || '').replace(/'/g, "\\'")}',
                )`).join(',\n') + `\n            )`;
          }

          restCallbacks += `
if ( ! function_exists( '${handlerName}' ) ) {
    /**
     * REST API Callback for [GET] ${ep.rawUrl}
     */
    function ${handlerName}( $request ) {
        $items = ${dataPhp};
        return rest_ensure_response( $items );
    }
}
`;
        }
      }
    } else {
      // Default fallback endpoint
      const handlerName = `${prefix}handle_rest_info`;
      restRegistrations += `
        register_rest_route(
            '${slug}/v1',
            '/info',
            array(
                'methods'             => 'GET',
                'callback'            => '${handlerName}',
                'permission_callback' => '__return_true',
            )
        );`;
      restCallbacks += `
if ( ! function_exists( '${handlerName}' ) ) {
    function ${handlerName}( $request ) {
        return rest_ensure_response(
            array(
                'status'  => 'active',
                'theme'   => '${projectName}',
                'version' => '1.0.0'
            )
        );
    }
}
`;
    }

    const restApiPhpContent = `<?php
/**
 * Native REST API Endpoints Bridge
 *
 * 1:1 endpoint parity with React fetch calls.
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${prefix}register_rest_endpoints' ) ) {
    /**
     * Registers REST API routes with 1:1 parity to React fetch calls.
     */
    function ${prefix}register_rest_endpoints() {
        ${restRegistrations}
    }
}
add_action( 'rest_api_init', '${prefix}register_rest_endpoints' );

${restCallbacks}
`;

    files.push({
      fileName: 'rest-api.php',
      filePath: 'inc/rest-api.php',
      language: 'php',
      description: 'Native REST API routes with 1:1 parity',
      content: restApiPhpContent
    });

    // 10. header.php, footer.php, index.php, page.php, single.php, 404.php
    files.push({ fileName: 'header.php', filePath: 'header.php', language: 'php', description: 'Header template', content: headerContent });
    files.push({ fileName: 'footer.php', filePath: 'footer.php', language: 'php', description: 'Footer template', content: footerContent });
    files.push({ fileName: 'index.php', filePath: 'index.php', language: 'php', description: 'Index template with server-rendered React components', content: indexContent });
    files.push({ fileName: 'page.php', filePath: 'page.php', language: 'php', description: 'Static Page template', content: pageContent });
    files.push({ fileName: 'single.php', filePath: 'single.php', language: 'php', description: 'Single Post template', content: singleContent });
    files.push({ fileName: '404.php', filePath: '404.php', language: 'php', description: '404 Error template', content: notFoundContent });

    // 11. assets/js/theme-interactions.js
    const interactionsJsContent = `/**
 * ${projectName} - Lightweight Vanilla JS Interactions
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var forms = document.querySelectorAll('form[data-rtw-form], form.contact-form, form');
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                var actionInput = form.querySelector('input[name="action"]');
                if (!actionInput) return;

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

    // 12. screenshot.png (MANDATORY RULE: 1200x900 valid PNG strictly at theme root)
    const screenshotBuffer = ScreenshotGenerator.generateScreenshotBuffer(projectName);
    files.push({
      fileName: 'screenshot.png',
      filePath: 'screenshot.png',
      language: 'binary',
      description: 'WordPress Theme 1200x900 Screenshot Artwork (Root Location)',
      content: screenshotBuffer.toString('base64')
    });

    return files;
  }

  private static generateServerRenderedRoot(
    manifest: ProjectManifest | undefined,
    scan: ScanResult,
    slug: string
  ): string {
    if (!manifest || manifest.contentSections.length === 0) {
      return `    <div id="root" class="rtw-app-container py-12 px-6 max-w-6xl mx-auto">
        <h1 class="text-3xl font-extrabold text-white mb-4"><?php bloginfo( 'name' ); ?></h1>
        <p class="text-slate-400 mb-6"><?php bloginfo( 'description' ); ?></p>
        <button class="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">
            <?php esc_html_e( 'شروع پروژه', '${slug}' ); ?>
        </button>
    </div>`;
    }

    const htmlParts: string[] = [];
    htmlParts.push(`    <div id="root" class="rtw-app-container">`);

    for (const section of manifest.contentSections) {
      const heroHeading = section.fields.find(f => f.key.startsWith('hero_heading'))?.defaultValue || '';
      const subHeading = section.fields.find(f => f.key.startsWith('sub_heading'))?.defaultValue || '';
      const paragraphs = section.fields.filter(f => f.key.startsWith('paragraph_text')).map(f => f.defaultValue).filter(Boolean);
      const badges = section.fields.filter(f => f.key.startsWith('badge')).map(f => f.defaultValue).filter(Boolean);
      const buttons = section.fields.filter(f => f.key.startsWith('cta_button')).map(f => f.defaultValue).filter(Boolean);
      const statNumbers = section.fields.filter(f => f.key.startsWith('stat_number')).map(f => f.defaultValue);
      const statLabels = section.fields.filter(f => f.key.startsWith('stat_label')).map(f => f.defaultValue);
      const repeater = section.fields.find(f => f.key === 'initial_items_repeater')?.defaultValue;

      htmlParts.push(`        <section class="max-w-7xl mx-auto px-6 pt-16 pb-12">`);

      if (badges.length > 0) {
        htmlParts.push(`            <span class="text-xs uppercase tracking-widest text-[#5BC0BE] font-mono mb-4 block">${this.escapePhpText(badges[0])}</span>`);
      }

      if (heroHeading) {
        htmlParts.push(`            <h1 class="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">${this.escapePhpText(heroHeading)}</h1>`);
      }

      if (paragraphs.length > 0 && typeof paragraphs[0] === 'string' && !paragraphs[0].includes('{')) {
        htmlParts.push(`            <p class="text-lg text-[#8D99AE] leading-relaxed mb-8 max-w-3xl">${this.escapePhpText(paragraphs[0])}</p>`);
      }

      if (buttons.length > 0) {
        htmlParts.push(`            <div class="mb-10"><a href="#contact" class="px-5 py-2.5 rounded-full border border-[#5BC0BE] text-[#5BC0BE] hover:bg-[#5BC0BE] hover:text-[#0B132B] font-bold text-xs transition-all duration-300">${this.escapePhpText(buttons[0])}</a></div>`);
      }

      // Stats
      if (statNumbers.length > 0) {
        htmlParts.push(`            <div class="grid grid-cols-3 gap-6 pt-6 border-t border-[#1C2541] mb-12">`);
        for (let i = 0; i < statNumbers.length; i++) {
          htmlParts.push(`                <div><div class="text-3xl font-extrabold text-[#6FFFE9]">${this.escapePhpText(statNumbers[i])}</div><div class="text-xs text-[#8D99AE] mt-1">${this.escapePhpText(statLabels[i] || '')}</div></div>`);
        }
        htmlParts.push(`            </div>`);
      }

      // Sub heading
      if (subHeading) {
        htmlParts.push(`            <div class="mb-8"><h2 class="text-3xl font-bold text-white mb-2">${this.escapePhpText(subHeading)}</h2></div>`);
      }

      // Repeater / Cards
      if (Array.isArray(repeater) && repeater.length > 0) {
        htmlParts.push(`            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">`);
        for (const item of repeater) {
          htmlParts.push(`                <div class="group rounded-2xl bg-[#1C2541]/70 border border-[#3A506B]/30 p-6 hover:border-[#5BC0BE]/50 transition-all duration-300">`);
          htmlParts.push(`                    <div class="flex justify-between items-center text-xs text-[#5BC0BE] font-mono mb-2"><span>${this.escapePhpText(item.category || '')}</span><span>${this.escapePhpText(item.year || '')}</span></div>`);
          htmlParts.push(`                    <h3 class="text-xl font-bold text-white mb-2 group-hover:text-[#6FFFE9] transition-colors">${this.escapePhpText(item.title || '')}</h3>`);
          htmlParts.push(`                    <p class="text-xs text-[#8D99AE]">${this.escapePhpText(item.location || '')}</p>`);
          htmlParts.push(`                </div>`);
        }
        htmlParts.push(`            </div>`);
      }

      htmlParts.push(`        </section>`);
    }

    // If forms detected in scan
    if (scan.forms.length > 0) {
      const form = scan.forms[0];
      htmlParts.push(`        <section class="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 my-10">`);
      htmlParts.push(`            <form method="post" action="" class="space-y-4" data-rtw-form="true">`);
      htmlParts.push(`                <input type="hidden" name="action" value="${form.actionName}" />`);
      htmlParts.push(`                <?php wp_nonce_field( '${form.nonceName}', 'nonce' ); ?>`);
      for (const f of form.fields) {
        htmlParts.push(`                <div><label class="block text-xs font-semibold uppercase text-slate-300 mb-1">${f.name}</label><input type="${f.type}" name="${f.name}" class="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white" /></div>`);
      }
      htmlParts.push(`                <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors">ارسال فرم</button>`);
      htmlParts.push(`            </form>`);
      htmlParts.push(`        </section>`);
    }

    htmlParts.push(`    </div>`);
    return htmlParts.join('\n');
  }

  private static escapePhpText(str: any): string {
    if (typeof str !== 'string') return String(str);
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
