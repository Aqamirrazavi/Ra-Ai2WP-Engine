import type { GeneratedFile } from '../../types.ts';
import { SymbolRegistry } from '../../parser/symbolRegistry.ts';
import type { ScanResult } from '../../parser/astScanner.ts';
import type { DetectionResult } from '../../ingestion/detector.ts';
import { CssBundler } from '../classic/cssBundler.ts';
import { ScreenshotGenerator } from '../classic/screenshotGenerator.ts';

export class BlockThemeGenerator {
  /**
   * Generates a modern, standard Full Site Editing (FSE) Block Theme.
   * Features:
   * - theme.json v3 specification with color palette, typography and layout
   * - HTML block templates (templates/index.html, templates/single.html, templates/page.html, templates/404.html)
   * - Template parts (parts/header.html, parts/footer.html)
   * - functions.php with strictly wrapped setup and local enqueue
   * - style.css with bundled local styles and no external CDNs
   * - Mandatory 1200x900 screenshot.png
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

    const bundledCss = CssBundler.bundle(scan.detectedClasses, scan.rawCssContent, enableRtl);

    // 1. style.css (Block Theme Header)
    files.push({
      fileName: 'style.css',
      filePath: 'style.css',
      language: 'css',
      description: 'Block Theme Stylesheet and WordPress Metadata',
      content: `/*
Theme Name: ${projectName}
Theme URI: https://wordpress.org/themes/${slug}/
Author: RTW Universal Compiler
Author URI: https://github.com/rtw-converter
Description: Modern Full Site Editing (FSE) Block Theme generated automatically from React with zero errors.
Version: 1.0.0
Requires at least: 6.5
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

    // 2. theme.json (v3 Specification)
    const themeJson = {
      $schema: 'https://schemas.wp.org/trunk/theme.json',
      version: 3,
      settings: {
        appearanceTools: true,
        useRootPaddingAwareAlignments: true,
        layout: {
          contentSize: '840px',
          wideSize: '1200px'
        },
        color: {
          custom: true,
          customDuotone: false,
          customGradient: true,
          defaultPalette: false,
          palette: [
            {
              slug: 'base',
              color: '#0f172a',
              name: 'Base Dark'
            },
            {
              slug: 'surface',
              color: '#1e293b',
              name: 'Surface'
            },
            {
              slug: 'contrast',
              color: '#f8fafc',
              name: 'Contrast Light'
            },
            {
              slug: 'primary',
              color: '#2563eb',
              name: 'Primary Blue'
            },
            {
              slug: 'accent',
              color: '#06b6d4',
              name: 'Accent Cyan'
            },
            {
              slug: 'secondary',
              color: '#64748b',
              name: 'Muted Slate'
            }
          ]
        },
        typography: {
          customFontSize: true,
          fontStyle: true,
          fontWeight: true,
          letterSpacing: true,
          lineHeight: true,
          textColumns: true,
          textDecoration: true,
          textTransform: true,
          fontSizes: [
            { slug: 'small', size: '0.875rem', name: 'Small' },
            { slug: 'medium', size: '1rem', name: 'Medium' },
            { slug: 'large', size: '1.25rem', name: 'Large' },
            { slug: 'x-large', size: '1.75rem', name: 'Extra Large' },
            { slug: 'huge', size: '2.5rem', name: 'Huge' }
          ]
        },
        spacing: {
          margin: true,
          padding: true,
          blockGap: true,
          units: ['px', 'em', 'rem', 'vh', 'vw', '%']
        }
      },
      styles: {
        color: {
          background: 'var(--wp--preset--color--base)',
          text: 'var(--wp--preset--color--contrast)'
        },
        typography: {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: '1.6'
        },
        elements: {
          link: {
            color: {
              text: 'var(--wp--preset--color--accent)'
            },
            ':hover': {
              color: {
                text: 'var(--wp--preset--color--primary)'
              }
            }
          },
          heading: {
            color: {
              text: 'var(--wp--preset--color--contrast)'
            },
            typography: {
              fontWeight: '800'
            }
          },
          button: {
            color: {
              background: 'var(--wp--preset--color--primary)',
              text: '#ffffff'
            },
            border: {
              radius: '8px'
            }
          }
        }
      }
    };

    files.push({
      fileName: 'theme.json',
      filePath: 'theme.json',
      language: 'json',
      description: 'WordPress FSE Theme Configuration (theme.json v3)',
      content: JSON.stringify(themeJson, null, 2)
    });

    // 3. functions.php (FSE Setup & Enqueue)
    const setupFuncName = registry.registerFunction('fse_setup');
    const scriptsFuncName = registry.registerFunction('fse_scripts');

    const functionsPhpContent = `<?php
/**
 * ${projectName} Block Theme functions and definitions
 *
 * @package ${projectName}
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! defined( '${constPrefix}VERSION' ) ) {
    define( '${constPrefix}VERSION', '1.0.0' );
}

if ( ! function_exists( '${setupFuncName}' ) ) {
    /**
     * Sets up block theme features and supports.
     */
    function ${setupFuncName}() {
        // Full Site Editing Block Theme Supports
        add_theme_support( 'wp-block-styles' );
        add_theme_support( 'editor-styles' );
        add_editor_style( 'style.css' );
    }
}
add_action( 'after_setup_theme', '${setupFuncName}' );

if ( ! function_exists( '${scriptsFuncName}' ) ) {
    /**
     * Enqueue block theme standalone assets with zero external CDN dependency.
     */
    function ${scriptsFuncName}() {
        wp_enqueue_style(
            '${slug}-block-theme',
            get_stylesheet_uri(),
            array(),
            ${constPrefix}VERSION
        );

        wp_enqueue_script(
            '${slug}-interactions',
            get_template_directory_uri() . '/assets/js/theme-interactions.js',
            array(),
            ${constPrefix}VERSION,
            true
        );

        wp_localize_script(
            '${slug}-interactions',
            '${slug}Settings',
            array(
                'ajax_url'   => admin_url( 'admin-ajax.php' ),
                'nonce'      => wp_create_nonce( '${prefix}fse_nonce' ),
                'is_rtl'     => is_rtl(),
                'theme_slug' => '${slug}'
            )
        );
    }
}
add_action( 'wp_enqueue_scripts', '${scriptsFuncName}' );
`;

    files.push({
      fileName: 'functions.php',
      filePath: 'functions.php',
      language: 'php',
      description: 'Block theme setup and Enqueue hooks',
      content: functionsPhpContent
    });

    // 4. parts/header.html
    const headerHtml = `<!-- wp:pattern {"slug":"${slug}/header"} /-->
<header class="wp-block-template-part site-header border-b border-slate-800 bg-slate-900/90 py-4 px-6 sticky top-0 z-50">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
        <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
        <div class="wp-block-group flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                RTW
            </div>
            <!-- wp:site-title {"level":1,"style":{"typography":{"fontWeight":"800","fontSize":"1.25rem"}}} /-->
        </div>
        <!-- /wp:group -->

        <!-- wp:navigation {"layout":{"type":"flex","justifyContent":"right"},"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"}}} /-->

        <div class="header-action">
            <a href="#contact" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-sm transition-all shadow-md">
                ارتباط با ما
            </a>
        </div>
    </div>
</header>
`;

    files.push({
      fileName: 'header.html',
      filePath: 'parts/header.html',
      language: 'html',
      description: 'FSE Header Template Part',
      content: headerHtml
    });

    // 5. parts/footer.html
    const footerHtml = `<footer class="wp-block-template-part site-footer bg-slate-950 border-t border-slate-800 py-10 px-6 text-center text-slate-500 text-sm mt-auto">
    <div class="max-w-6xl mx-auto">
        <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
        <div class="wp-block-group space-y-2">
            <!-- wp:paragraph {"align":"center","fontSize":"small"} -->
            <p class="has-text-align-center has-small-font-size mb-2">تمامی حقوق محفوظ است © 2026</p>
            <!-- /wp:paragraph -->
            <!-- wp:paragraph {"align":"center","fontSize":"small","style":{"color":{"text":"#64748b"}}} -->
            <p class="has-text-align-center has-small-font-size text-xs text-slate-600">تولیدشده با موتور هوشمند RTW Converter بر پایه استاندارد FSE وردپرس</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    </div>
</footer>
`;

    files.push({
      fileName: 'footer.html',
      filePath: 'parts/footer.html',
      language: 'html',
      description: 'FSE Footer Template Part',
      content: footerHtml
    });

    // 6. templates/index.html
    const indexHtml = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<main class="wp-block-group site-main py-12 px-6 max-w-6xl mx-auto flex-1" id="primary">
    <!-- wp:query {"queryId":1,"query":{"perPage":9,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true}} -->
    <div class="wp-block-query">
        <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
        <article class="project-card bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between mb-6">
            <header class="entry-header mb-4">
                <!-- wp:post-title {"isLink":true,"style":{"typography":{"fontWeight":"700","fontSize":"1.25rem"}}} /-->
                <div class="entry-meta text-xs text-slate-400 mb-2">
                    <!-- wp:post-date /-->
                </div>
            </header>

            <div class="entry-content text-slate-400 text-sm leading-relaxed mb-6">
                <!-- wp:post-excerpt {"moreText":"مشاهده جزئیات ←"} /-->
            </div>
        </article>
        <!-- /wp:post-template -->

        <!-- wp:query-pagination {"layout":{"type":"flex","justifyContent":"center"}} -->
        <!-- wp:query-pagination-previous /-->
        <!-- wp:query-pagination-numbers /-->
        <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->

        <!-- wp:query-no-results -->
        <div class="no-results bg-slate-800/40 p-12 rounded-2xl border border-slate-700 text-center">
            <!-- wp:paragraph {"align":"center"} -->
            <p class="has-text-align-center">مطلبی برای نمایش یافت نشد.</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:query-no-results -->
    </div>
    <!-- /wp:query -->
</main>

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

    files.push({
      fileName: 'index.html',
      filePath: 'templates/index.html',
      language: 'html',
      description: 'FSE Main Index Template',
      content: indexHtml
    });

    // 7. templates/single.html
    const singleHtml = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<main class="wp-block-group site-main py-12 px-6 max-w-4xl mx-auto flex-1" id="primary">
    <!-- wp:post-title {"level":1,"style":{"typography":{"fontWeight":"800","fontSize":"2rem"}}} /-->
    <div class="entry-meta text-xs text-slate-400 mb-6 pb-4 border-b border-slate-700">
        <!-- wp:post-date /--> · <!-- wp:post-author {"showAvatar":false} /-->
    </div>
    <!-- wp:post-content {"layout":{"type":"constrained"}} /-->
</main>

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

    files.push({
      fileName: 'single.html',
      filePath: 'templates/single.html',
      language: 'html',
      description: 'FSE Single Post Template',
      content: singleHtml
    });

    // 8. templates/page.html
    const pageHtml = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<main class="wp-block-group site-main py-12 px-6 max-w-4xl mx-auto flex-1 bg-white text-slate-800 rounded-2xl p-8 shadow-md" id="primary">
    <!-- wp:post-title {"level":1,"style":{"typography":{"fontWeight":"800","fontSize":"2rem"}}} /-->
    <div class="entry-content text-slate-700 leading-relaxed mt-6">
        <!-- wp:post-content {"layout":{"type":"constrained"}} /-->
    </div>
</main>

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

    files.push({
      fileName: 'page.html',
      filePath: 'templates/page.html',
      language: 'html',
      description: 'FSE Static Page Template',
      content: pageHtml
    });

    // 9. templates/404.html
    const notFoundHtml = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<main class="wp-block-group site-main py-24 px-6 max-w-2xl mx-auto text-center flex-1" id="primary">
    <div class="error-404 bg-slate-800/60 p-10 rounded-2xl border border-slate-700">
        <h1 class="text-6xl font-black text-blue-500 mb-4">۴۰۴</h1>
        <h2 class="text-2xl font-bold text-white mb-3">صفحه مورد نظر یافت نشد</h2>
        <p class="text-slate-400 text-sm mb-8">ممکن است نشانی را اشتباه وارد کرده باشید یا صفحه منتقل شده باشد.</p>
        <a href="/" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-lg text-sm inline-block">بازگشت به خانه</a>
    </div>
</main>

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

    files.push({
      fileName: '404.html',
      filePath: 'templates/404.html',
      language: 'html',
      description: 'FSE 404 Error Template',
      content: notFoundHtml
    });

    // 10. assets/js/theme-interactions.js
    const interactionsJs = `/**
 * ${projectName} - FSE Interactions Script
 */
(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[RTW FSE Theme] Loaded successfully.');
    });
})();
`;

    files.push({
      fileName: 'theme-interactions.js',
      filePath: 'assets/js/theme-interactions.js',
      language: 'javascript',
      description: 'Lightweight client interaction script',
      content: interactionsJs
    });

    // 11. screenshot.png (Mandatory 1200x900)
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
