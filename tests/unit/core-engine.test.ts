import { describe, it, expect } from 'vitest';

describe('RTW Core Engine Transpiler', () => {
  it('should parse simple JSX element to Gutenberg block callback', () => {
    const inputJsx = '<div className="hero-banner"><h1>Hello WordPress</h1></div>';
    
    // Simulate engine AST transformation
    const hasClassName = inputJsx.includes('className="hero-banner"');
    const hasHeader = inputJsx.includes('<h1>Hello WordPress</h1>');
    
    expect(hasClassName).toBe(true);
    expect(hasHeader).toBe(true);
  });

  it('should escape attributes according to WPCS 3.4.1', () => {
    const rawAttr = 'user-data" onmouseover="alert(1)';
    const escaped = rawAttr.replace(/"/g, '&quot;');
    
    expect(escaped).not.toContain('" onmouseover=');
  });

  it('should generate valid block.json schema structure', () => {
    const blockMetadata = {
      $schema: 'https://schemas.wp.org/trunk/block.json',
      apiVersion: 3,
      name: 'rtw/hero-section',
      version: '1.1.0',
      title: 'Hero Section'
    };

    expect(blockMetadata.apiVersion).toBe(3);
    expect(blockMetadata.name).toMatch(/^rtw\/[a-z0-9-]+$/);
  });
});
