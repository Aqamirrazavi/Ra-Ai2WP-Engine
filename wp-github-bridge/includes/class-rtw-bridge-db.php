<?php
/**
 * Database & Encryption Handler for RTW GitHub Bridge
 *
 * @package RTW_GitHub_Bridge
 */

if (!defined('ABSPATH')) {
    exit;
}

class RTW_Bridge_DB {

    const DB_VERSION = '1.1.0';

    /**
     * Create or update conversions table using dbDelta
     */
    public static function create_tables() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'rtw_bridge_conversions';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            request_id varchar(50) NOT NULL,
            user_id bigint(20) NOT NULL DEFAULT 0,
            project_name varchar(200) NOT NULL,
            output_type varchar(20) NOT NULL DEFAULT 'block-theme',
            source_url text,
            source_type varchar(20) NOT NULL DEFAULT 'jsx_code',
            status varchar(20) NOT NULL DEFAULT 'pending',
            artifact_url text,
            error_message text,
            thoughts_tokens int(11) DEFAULT 0,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY status (status),
            KEY created_at (created_at),
            KEY user_status (user_id, status)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);

        update_option('rtw_bridge_db_version', self::DB_VERSION);
    }

    /**
     * Encrypt sensitive data using AES-256-CBC
     */
    public static function encrypt($data) {
        if (empty($data)) {
            return '';
        }

        $key = defined('RTW_BRIDGE_KEY') ? RTW_BRIDGE_KEY : get_option('rtw_bridge_encryption_key');
        if (empty($key)) {
            $key = bin2hex(openssl_random_pseudo_bytes(16));
            update_option('rtw_bridge_encryption_key', $key);
        }

        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($data, 'aes-256-cbc', substr(hash('sha256', $key), 0, 32), 0, $iv);

        return base64_encode($encrypted . '::' . $iv);
    }

    /**
     * Decrypt sensitive data using AES-256-CBC
     */
    public static function decrypt($data) {
        if (empty($data)) {
            return '';
        }

        $decoded = base64_decode($data);
        if (strpos($decoded, '::') === false) {
            return $data; // Fallback if plain text
        }

        list($encrypted_data, $iv) = explode('::', $decoded, 2);
        $key = defined('RTW_BRIDGE_KEY') ? RTW_BRIDGE_KEY : get_option('rtw_bridge_encryption_key');

        return openssl_decrypt($encrypted_data, 'aes-256-cbc', substr(hash('sha256', $key), 0, 32), 0, $iv);
    }

    /**
     * Log a new conversion request
     */
    public static function insert_conversion($data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'rtw_bridge_conversions';

        $wpdb->insert($table_name, [
            'request_id'   => sanitize_text_field($data['request_id'] ?? wp_generate_uuid4()),
            'user_id'      => get_current_user_id(),
            'project_name' => sanitize_text_field($data['project_name'] ?? 'Project'),
            'output_type'  => sanitize_text_field($data['output_type'] ?? 'block-theme'),
            'source_url'   => esc_url_raw($data['source_url'] ?? ''),
            'source_type'  => sanitize_text_field($data['source_type'] ?? 'jsx_code'),
            'status'       => sanitize_text_field($data['status'] ?? 'pending'),
            'artifact_url' => esc_url_raw($data['artifact_url'] ?? ''),
            'error_message'=> sanitize_text_field($data['error_message'] ?? ''),
            'created_at'   => current_time('mysql', true),
            'updated_at'   => current_time('mysql', true)
        ]);

        return $wpdb->insert_id;
    }

    /**
     * Fetch user or all conversion history
     */
    public static function get_history($limit = 20, $offset = 0, $status = '') {
        global $wpdb;
        $table_name = $wpdb->prefix . 'rtw_bridge_conversions';

        $where = "WHERE 1=1";
        if (!empty($status)) {
            $where .= $wpdb->prepare(" AND status = %s", $status);
        }

        if (!current_user_can('manage_options')) {
            $where .= $wpdb->prepare(" AND user_id = %d", get_current_user_id());
        }

        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $table_name $where ORDER BY created_at DESC LIMIT %d OFFSET %d",
                $limit,
                $offset
            ),
            ARRAY_A
        );
    }
}
