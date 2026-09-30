import type { GeneratedFile } from '../../types.ts';
import { SymbolRegistry } from '../../parser/symbolRegistry.ts';
import type { ScanResult } from '../../parser/astScanner.ts';
import type { DetectionResult } from '../../ingestion/detector.ts';
import { CssBundler } from '../classic/cssBundler.ts';

export class GutenbergBlockGenerator {
  /**
   * Generates a modern Gutenberg Block using Block API v3 and block.json.
   * Features:
   * - block.json v3 specification with render.php server-side rendering
   * - Full block wrapper attributes support (get_block_wrapper_attributes)
   * - Standalone PHP loader with function_exists wrapping and init hook
   * - React editor source code (edit.js, save.js, index.js)
   * - Standalone bundled CSS (style-index.css)
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
    const blockRegisterFunc = registry.registerFunction('register_gutenberg_block');
    const files: GeneratedFile[] = [];

    const bundledCss = CssBundler.bundle(scan.detectedClasses, scan.rawCssContent, enableRtl);

    // 1. block.json (API Version 3)
    const blockMetadata = {
      $schema: 'https://schemas.wp.org/trunk/block.json',
      apiVersion: 3,
      name: `rtw/${slug}`,
      version: '1.0.0',
      title: projectName,
      category: 'widgets',
      icon: 'slides',
      description: `Gutenberg Custom Block automatically generated from React with zero dependencies.`,
      supports: {
        html: false,
        align: ['wide', 'full'],
        color: {
          background: true,
          text: true
        },
        spacing: {
          margin: true,
          padding: true
        }
      },
      attributes: {
        title: {
          type: 'string',
          default: projectName
        },
        description: {
          type: 'string',
          default: 'توضیحات پیش‌فرض بلوک سفارشی گوتنبرگ'
        },
        highlightColor: {
          type: 'string',
          default: '#2563eb'
        },
        showBadge: {
          type: 'boolean',
          default: true
        }
      },
      textdomain: slug,
      editorScript: 'file:./build/index.js',
      editorStyle: 'file:./build/index.css',
      style: 'file:./build/style-index.css',
      render: 'file:./render.php'
    };

    files.push({
      fileName: 'block.json',
      filePath: 'block.json',
      language: 'json',
      description: 'Gutenberg Block Metadata (API v3)',
      content: JSON.stringify(blockMetadata, null, 2)
    });

    // 2. render.php (Server-side dynamic rendering)
    const renderPhpContent = `<?php
/**
 * Server-side dynamic render callback for ${projectName} block.
 *
 * @package ${projectName}
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$title       = isset( $attributes['title'] ) ? $attributes['title'] : '${projectName}';
$description = isset( $attributes['description'] ) ? $attributes['description'] : '';
$show_badge  = ! empty( $attributes['showBadge'] );

$wrapper_attributes = get_block_wrapper_attributes( array(
    'class' => 'rtw-block-${slug} bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800'
) );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <div class="block-header flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
        <h3 class="text-xl font-bold text-white m-0">
            <?php echo esc_html( $title ); ?>
        </h3>
        <?php if ( $show_badge ) : ?>
            <span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">
                <?php esc_html_e( 'بلوک گوتنبرگ', '${slug}' ); ?>
            </span>
        <?php endif; ?>
    </div>

    <?php if ( ! empty( $description ) ) : ?>
        <p class="text-slate-300 text-sm leading-relaxed mb-4">
            <?php echo esc_html( $description ); ?>
        </p>
    <?php endif; ?>

    <div class="block-content">
        <div class="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-400">
            <?php esc_html_e( 'محتوای کامپایل‌شده از کامپوننت React با کارایی بالا و بدون نیاز به کتابخانه کلاینت-ساید.', '${slug}' ); ?>
        </div>
    </div>
</div>
`;

    files.push({
      fileName: 'render.php',
      filePath: 'render.php',
      language: 'php',
      description: 'Server-side Block Dynamic Render Template',
      content: renderPhpContent
    });

    // 3. Main Plugin / Loader File: [slug]-block.php
    const loaderPhpContent = `<?php
/**
 * Plugin Name:       ${projectName} Block
 * Plugin URI:        https://wordpress.org/plugins/${slug}-block/
 * Description:       Gutenberg Custom Block compiled automatically from React.
 * Version:           1.0.0
 * Author:            RTW Universal Compiler
 * Author URI:        https://github.com/rtw-converter
 * License:           GPL v2 or later
 * Text Domain:       ${slug}
 * Requires at least: 6.4
 * Requires PHP:      8.0
 *
 * @package ${projectName}
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! function_exists( '${blockRegisterFunc}' ) ) {
    /**
     * Registers the block using the metadata loaded from the block.json file.
     */
    function ${blockRegisterFunc}() {
        register_block_type( __DIR__ );
    }
}
add_action( 'init', '${blockRegisterFunc}' );
`;

    files.push({
      fileName: `${slug}-block.php`,
      filePath: `${slug}-block.php`,
      language: 'php',
      description: 'Gutenberg Block Loader PHP file',
      content: loaderPhpContent
    });

    // 4. src/index.js (Block JS registration)
    const blockIndexJs = `/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import metadata from '../block.json';
import Edit from './edit';

/**
 * Register Block Type
 */
registerBlockType( metadata.name, {
    edit: Edit,
    save: () => null // Dynamic rendering via render.php
} );
`;

    files.push({
      fileName: 'index.js',
      filePath: 'src/index.js',
      language: 'javascript',
      description: 'Block Entrypoint JavaScript',
      content: blockIndexJs
    });

    // 5. src/edit.js (Gutenberg InspectorControls & Block Edit UI)
    const blockEditJs = `/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
    const { title, description, showBadge } = attributes;
    const blockProps = useBlockProps( {
        className: 'rtw-block-${slug}-editor p-6 rounded-2xl bg-slate-900 text-white border border-slate-700'
    } );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'تنظیمات بلوک', '${slug}' ) } initialOpen={ true }>
                    <TextControl
                        label={ __( 'عنوان بلوک', '${slug}' ) }
                        value={ title }
                        onChange={ ( val ) => setAttributes( { title: val } ) }
                    />
                    <TextControl
                        label={ __( 'توضیحات کوتاه', '${slug}' ) }
                        value={ description }
                        onChange={ ( val ) => setAttributes( { description: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'نمایش نشان ویژه', '${slug}' ) }
                        checked={ showBadge }
                        onChange={ ( val ) => setAttributes( { showBadge: val } ) }
                    />
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps }>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold">{ title || __( 'بدون عنوان', '${slug}' ) }</h3>
                    { showBadge && (
                        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded font-bold">
                            { __( 'بلوک گوتنبرگ', '${slug}' ) }
                        </span>
                    ) }
                </div>
                <p className="text-sm text-slate-300">{ description || __( 'توضیحات را از نوار کناری ویرایش کنید.', '${slug}' ) }</p>
            </div>
        </>
    );
}
`;

    files.push({
      fileName: 'edit.js',
      filePath: 'src/edit.js',
      language: 'javascript',
      description: 'Gutenberg React Edit Component',
      content: blockEditJs
    });

    // 6. build/style-index.css (Standalone bundled CSS)
    files.push({
      fileName: 'style-index.css',
      filePath: 'build/style-index.css',
      language: 'css',
      description: 'Gutenberg Frontend & Editor Bundled CSS',
      content: bundledCss
    });

    // 7. build/index.css (Editor-specific CSS)
    files.push({
      fileName: 'index.css',
      filePath: 'build/index.css',
      language: 'css',
      description: 'Gutenberg Editor Specific CSS',
      content: `
.rtw-block-${slug}-editor {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    border: 2px dashed #3b82f6;
}
`
    });

    return files;
  }
}
