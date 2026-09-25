<?php
/**
 * Test cases for RTW Database & AES-256 Encryption
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/bootstrap.php';
require_once dirname( __DIR__, 2 ) . '/wp-github-bridge/includes/class-rtw-bridge-db.php';

class Test_RTW_Bridge_DB extends TestCase {

    public function test_token_encryption_and_decryption() {
        $plain_token = 'ghp_SampleSecretGitHubToken1234567890abcdef';
        
        $encrypted = RTW_Bridge_DB::encrypt_token( $plain_token );
        $this->assertNotEquals( $plain_token, $encrypted );
        $this->assertNotEmpty( $encrypted );

        $decrypted = RTW_Bridge_DB::decrypt_token( $encrypted );
        $this->assertEquals( $plain_token, $decrypted );
    }

    public function test_empty_token_encryption() {
        $encrypted = RTW_Bridge_DB::encrypt_token( '' );
        $this->assertEquals( '', $encrypted );
    }

    public function test_migration_version_check() {
        $table_name = RTW_Bridge_DB::get_table_name();
        $this->assertStringContainsString( 'rtw_bridge_conversions', $table_name );
    }
}
