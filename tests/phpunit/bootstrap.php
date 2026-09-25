<?php
/**
 * PHPUnit Test Bootstrap for RTW WordPress Bridge Plugin
 */

// Define basic WordPress constants if not present
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', sys_get_temp_dir() . '/wordpress/' );
}

if ( ! defined( 'RTW_BRIDGE_VERSION' ) ) {
    define( 'RTW_BRIDGE_VERSION', '1.1.0' );
}

if ( ! defined( 'RTW_BRIDGE_DIR' ) ) {
    define( 'RTW_BRIDGE_DIR', dirname( __DIR__, 2 ) . '/wp-github-bridge/' );
}

// Mock WordPress functions for unit test environment
if ( ! function_exists( 'sanitize_text_field' ) ) {
    function sanitize_text_field( $str ) {
        return trim( strip_tags( $str ) );
    }
}

if ( ! function_exists( 'esc_attr' ) ) {
    function esc_attr( $text ) {
        return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
    }
}

if ( ! function_exists( 'wp_kses_post' ) ) {
    function wp_kses_post( $content ) {
        return $content;
    }
}

if ( ! function_exists( 'get_option' ) ) {
    function get_option( $option, $default = false ) {
        global $mock_options;
        return $mock_options[ $option ] ?? $default;
    }
}

if ( ! function_exists( 'update_option' ) ) {
    function update_option( $option, $value ) {
        global $mock_options;
        $mock_options[ $option ] = $value;
        return true;
    }
}

if ( ! function_exists( 'dbDelta' ) ) {
    function dbDelta( $queries ) {
        return array( 'success' => true );
    }
}
