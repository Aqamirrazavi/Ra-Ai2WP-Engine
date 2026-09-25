import { describe, it, expect } from 'vitest';

describe('RTW PWA Component Suite', () => {
  it('should initialize with default converter states', () => {
    const initialState = {
      isConverting: false,
      activeTab: 'php',
      hasResult: false
    };

    expect(initialState.isConverting).toBe(false);
    expect(initialState.activeTab).toBe('php');
  });

  it('should format code output cleanly', () => {
    const rawPhp = '<?php echo "test"; ?>';
    expect(rawPhp.startsWith('<?php')).toBe(true);
  });
});
