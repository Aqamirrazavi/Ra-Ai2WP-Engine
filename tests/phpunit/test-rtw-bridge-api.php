<?php
/**
 * Test cases for RTW REST API Endpoints
 */

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/bootstrap.php';
require_once dirname( __DIR__, 2 ) . '/wp-github-bridge/includes/class-rtw-bridge-db.php';
require_once dirname( __DIR__, 2 ) . '/wp-github-bridge/includes/class-rtw-bridge-api.php';

class Test_RTW_Bridge_API extends TestCase {

    private $api;

    protected function setUp(): void {
        parent::setUp();
        $this->api = new RTW_Bridge_API();
    }

    public function test_api_namespace() {
        $reflection = new ReflectionClass( $this->api );
        $property = $reflection->getProperty( 'namespace' );
        $property->setAccessible( true );
        $this->assertEquals( 'rtw/v1', $property->getValue( $this->api ) );
    }

    public function test_health_check_endpoint() {
        $request = array();
        $response = $this->api->endpoint_health( $request );
        
        $this->assertIsArray( $response );
        $this->assertEquals( 'ok', $response['status'] );
        $this->assertEquals( '1.1.0', $response['version'] );
    }

    public function test_sanitize_payload() {
        $raw_input = '<script>alert("xss")</script>Sample Component';
        $cleaned = sanitize_text_field( $raw_input );
        $this->assertStringNotContainsString( '<script>', $cleaned );
    }
}
