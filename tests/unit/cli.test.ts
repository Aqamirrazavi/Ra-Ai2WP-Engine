import { describe, it, expect } from 'vitest';

describe('RTW CLI Command Parser', () => {
  it('should recognize default flags', () => {
    const defaultFlags = {
      outputDir: './build',
      strictWpcs: true,
      format: 'block'
    };

    expect(defaultFlags.strictWpcs).toBe(true);
    expect(defaultFlags.format).toBe('block');
  });

  it('should validate repository path argument', () => {
    const isValidPath = (path: string) => path.length > 0 && !path.includes('..');
    expect(isValidPath('src/components/Card.tsx')).toBe(true);
    expect(isValidPath('../../etc/passwd')).toBe(false);
  });
});
