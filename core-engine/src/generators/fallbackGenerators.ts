import { GeneratedFile, OutputType } from '../types';

export class FallbackGenerators {
  public static generateBlockTheme(projectName: string, rtl: boolean = true): GeneratedFile[] {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const files: GeneratedFile[] = [];

    // 1. theme.json v3
    files.push({
      fileName: 'theme.json',
      filePath: 'theme.json',
      language: 'json',
      description: 'WordPress FSE theme configuration v3',
      content: JSON.stringify(
        {
          $schema: 'https://schemas.wp.org/trunk/theme.json',
          version: 3,
          settings: {
            appearanceTools: true,
            layout: { contentSize: '840px', wideSize: '1200px' },
            color: {
              palette: [
                { slug: 'primary', color: '#2563EB', name: 'Primary Blue' },
                { slug: 'secondary', color: '#0EA5E9', name: 'Cyan Accent' },
                { slug: 'dark', color: '#0F172A', name: 'Slate Dark' },
                { slug: 'light', color: '#F8FAFC', name: 'Light Canvas' }
              ]
            },
            typography: {
              fontFamilies: [
                {
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  slug: 'system',
                  name: 'System UI'
                }
              ]
            }
          },
          styles: {
            color: { background: 'var(--wp--preset--color--light)', text: 'var(--wp--preset--color--dark)' }
          }
        },
        null,
        2
      )
    });

    // 2. style.css
    files.push({
      fileName: 'style.css',
      filePath: 'style.css',
      language: 'css',
      description: 'FSE Theme Metadata & Global Overrides',
      content: `/*
Theme Name: ${projectName}
Theme URI: https://github.com/rtw-converter/${slug}
Author: RTW Universal Transpiler
Description: Modern WordPress FSE Block Theme generated from React Component Tree.
Version: 1.0.0
Requires at least: 6.7
Tested up to: 6.7
Requires PHP: 8.0
License: GNU General Public License v2 or later
Text Domain: ${slug}
*/

:root {
  --rtw-primary: #2563EB;
}
`
    });

    // 3. templates/index.html
    files.push({
      fileName: 'index.html',
      filePath: 'templates/index.html',
      language: 'html',
      description: 'Main Block Template',
      content: `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:post-content /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`
    });

    // 4. parts/header.html
    files.push({
      fileName: 'header.html',
      filePath: 'parts/header.html',
      language: 'html',
      description: 'FSE Header Part',
      content: `<!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between"}} -->
<div class="wp-block-group">
    <!-- wp:site-title /-->
    <!-- wp:navigation /-->
</div>
<!-- /wp:group -->`
    });

    // 5. parts/footer.html
    files.push({
      fileName: 'footer.html',
      filePath: 'parts/footer.html',
      language: 'html',
      description: 'FSE Footer Part',
      content: `<!-- wp:group {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-group">
    <!-- wp:paragraph {"align":"center"} -->
    <p class="has-text-align-center">© ${new Date().getFullYear()} ${projectName}. Built with RTW Converter.</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->`
    });

    // 6. functions.php
    files.push({
      fileName: 'functions.php',
      filePath: 'functions.php',
      language: 'php',
      description: 'Theme setup and asset enqueueing',
      content: `<?php
/**
 * ${projectName} Functions and definitions
 *
 * @package RTW_${slug}
 */

if (!defined('ABSPATH')) {
    exit;
}

function rtw_${slug.replace(/-/g, '_')}_setup() {
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
}
add_action('after_setup_theme', 'rtw_${slug.replace(/-/g, '_')}_setup');
`
    });

    if (rtl) {
      files.push({
        fileName: 'rtl.css',
        filePath: 'rtl.css',
        language: 'css',
        description: 'Right-to-Left styling for Persian / Arabic',
        content: `/* RTL Stylesheet for ${projectName} */
body {
    direction: rtl;
    unicode-bidi: embed;
}
`
      });
    }

    return files;
  }

  public static generatePlugin(projectName: string): GeneratedFile[] {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const funcPrefix = slug.replace(/-/g, '_');
    return [
      {
        fileName: `${slug}.php`,
        filePath: `${slug}.php`,
        language: 'php',
        description: 'Main plugin entry file',
        content: `<?php
/**
 * Plugin Name:       ${projectName}
 * Plugin URI:        https://github.com/rtw-converter/${slug}
 * Description:       Enterprise React-to-WordPress bridge extension.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Requires PHP:      8.0
 * Author:            RTW Transpiler
 * License:           GPL v2 or later
 * Text Domain:       ${slug}
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RTW_${funcPrefix.toUpperCase()}_VERSION', '1.0.0');
define('RTW_${funcPrefix.toUpperCase()}_PATH', plugin_dir_path(__FILE__));

add_action('rest_api_init', function () {
    register_rest_route('rtw/v1', '/${slug}/data', [
        'methods'  => 'GET',
        'callback' => 'rtw_${funcPrefix}_get_data',
        'permission_callback' => function () {
            return current_user_can('read');
        }
    ]);
});

function rtw_${funcPrefix}_get_data() {
    return rest_ensure_response([
        'status' => 'success',
        'message' => esc_html__('Connected to ${projectName} REST Engine', '${slug}')
    ]);
}
`
      },
      {
        fileName: 'README.txt',
        filePath: 'README.txt',
        language: 'text',
        description: 'WordPress.org Plugin Readme',
        content: `=== ${projectName} ===
Contributors: rtwconverter
Tags: react, bridge, gutenberg
Requires at least: 6.2
Tested up to: 6.7
Stable tag: 1.0.0
License: GPLv2 or later

== Description ==
Generated from React Component via RTW Converter.
`
      }
    ];
  }
}
