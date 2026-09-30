import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ValidationHarness } from './validationHarness.ts';
import type { GeneratedFile } from '../../src/types.ts';
import { ScreenshotGenerator } from '../../src/generators/classic/screenshotGenerator.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('\n======================================================');
  console.log('   🧪 RTW CONVERTER — PHASE 1 VALIDATION HARNESS      ');
  console.log('   Evaluating Quality Gates on "Hello World" Fixture  ');
  console.log('======================================================\n');

  const projectName = 'RTW Hello World';

  // 1. Prepare 100% compliant synthetic Hello World WordPress theme package
  const styleCss = `/*
Theme Name: ${projectName}
Theme URI: https://github.com/Aqamirrazavi/Ra-Ai2WP-Engine
Author: RTW Universal Transpiler
Description: Phase 1 Synthetic Reference Theme for Harness Verification
Version: 1.0.0
License: GNU General Public License v2 or later
Text Domain: rtw-hello-world
*/

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #0b132b;
    color: #e0e1dd;
    direction: rtl;
}

.site-header {
    background-color: #1b263b;
    border-bottom: 1px solid #415a77;
    padding: 1rem 2rem;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.site-main {
    min-height: 70vh;
    padding: 3rem 1rem;
}

.hello-world-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #1b263b;
    border: 1px solid #415a77;
    border-radius: 1rem;
    padding: 2.5rem;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.hero-title {
    font-size: 2rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 1rem;
}

.lead-text {
    font-size: 0.95rem;
    color: #778da9;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.btn-primary {
    display: inline-block;
    background-color: #48cae4;
    color: #0b132b;
    font-weight: 700;
    padding: 0.75rem 1.75rem;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    text-decoration: none;
    transition: background-color 0.2s;
}

.btn-primary:hover {
    background-color: #0096c7;
}

.site-footer {
    border-top: 1px solid #1b263b;
    padding: 1.5rem;
    text-align: center;
    font-size: 0.8rem;
    color: #778da9;
}
`;

  const functionsPhp = `<?php
/**
 * ${projectName} Functions & Definitions
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( 'rtw_hw_setup' ) ) {
    /**
     * Theme Setup
     */
    function rtw_hw_setup() {
        add_theme_support( 'title-tag' );
        add_theme_support( 'post-thumbnails' );
        add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
    }
}
add_action( 'after_setup_theme', 'rtw_hw_setup' );

if ( ! function_exists( 'rtw_hw_enqueue_scripts' ) ) {
    /**
     * Enqueue styles and scripts
     */
    function rtw_hw_enqueue_scripts() {
        wp_enqueue_style( 'rtw-hw-style', get_stylesheet_uri(), array(), '1.0.0' );
    }
}
add_action( 'wp_enqueue_scripts', 'rtw_hw_enqueue_scripts' );
`;

  const headerPhp = `<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<header class="site-header">
    <div class="container">
        <h2 class="hero-title"><?php bloginfo( 'name' ); ?></h2>
    </div>
</header>
`;

  const indexPhp = `<?php get_header(); ?>
<main class="site-main">
    <div id="root" class="hello-world-container">
        <h1 class="hero-title"><?php esc_html_e( 'سلام دنیا - موتور تبدیل RTW', 'rtw-hello-world' ); ?></h1>
        <p class="lead-text"><?php esc_html_e( 'محتوای پیش‌فرض رندر شده سمت سرور برای تضمین عدم خالی ماندن #root', 'rtw-hello-world' ); ?></p>
        <button class="btn-primary"><?php esc_html_e( 'شروع کار', 'rtw-hello-world' ); ?></button>
    </div>
</main>
<?php get_footer(); ?>
`;

  const footerPhp = `<footer class="site-footer">
    <div class="container">
        <p>&copy; <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. تمامی حقوق محفوظ است.</p>
    </div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
`;

  const screenshotBase64 = ScreenshotGenerator.generateScreenshotBuffer(projectName).toString('base64');

  const files: GeneratedFile[] = [
    { fileName: 'style.css', filePath: 'style.css', language: 'css', description: 'Main Stylesheet', content: styleCss },
    { fileName: 'functions.php', filePath: 'functions.php', language: 'php', description: 'Functions', content: functionsPhp },
    { fileName: 'header.php', filePath: 'header.php', language: 'php', description: 'Header', content: headerPhp },
    { fileName: 'index.php', filePath: 'index.php', language: 'php', description: 'Index', content: indexPhp },
    { fileName: 'footer.php', filePath: 'footer.php', language: 'php', description: 'Footer', content: footerPhp },
    { fileName: 'screenshot.png', filePath: 'screenshot.png', language: 'binary', description: 'Screenshot', content: screenshotBase64 }
  ];

  // 2. Execute Validation Harness
  console.log('[HARNESS TEST] Running Gate A: php -l on all PHP files...');
  console.log('[HARNESS TEST] Running Gate B: Ephemeral WordPress environment activation...');
  console.log('[HARNESS TEST] Running Gate C: Headless page rendering & mount point check (#root)...');
  console.log('[HARNESS TEST] Running Gate D: Zero-tolerance CSS class coverage audit...\n');

  const result = ValidationHarness.validatePackage(files, projectName);

  console.log('------------------------------------------------------');
  console.log(`Gate A (php -l Linting):        ${result.phpLintPassed ? '✅ PASS (0 Syntax Errors)' : '❌ FAIL'}`);
  if (!result.phpLintPassed) {
    for (const err of result.phpLintErrors) {
      console.log(`     -> ${err}`);
    }
  }
  console.log(`Gate B (WordPress Activation):   ${result.activationPassed ? '✅ PASS (Theme Activated Cleanly)' : '❌ FAIL'}`);
  console.log(`Gate C (Headless Render):       ${result.headlessRenderPassed && !result.mountPointEmpty ? `✅ PASS (${result.renderedHtmlLength} bytes, #root populated)` : '❌ FAIL'}`);
  console.log(`Gate D (CSS Class Coverage):     ${result.cssCoveragePassed ? `✅ PASS (${result.matchedClassesCount}/${result.totalClassesFound} classes matched, 100% coverage)` : `❌ FAIL (${result.unmatchedClasses.length} unmatched classes: ${result.unmatchedClasses.join(', ')})`}`);
  console.log('------------------------------------------------------\n');

  if (result.passed) {
    console.log(`======================================================`);
    console.log(`   HARNESS EXECUTION RESULT: PASS                     `);
    console.log(`   SUMMARY: ${result.summary}                         `);
    console.log(`======================================================\n`);
    process.exit(0);
  } else {
    console.error(`======================================================`);
    console.error(`   HARNESS EXECUTION RESULT: FAIL                     `);
    console.error(`   DETAILS: ${result.summary}                         `);
    console.error(`======================================================\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error in harness:', err);
  process.exit(1);
});
