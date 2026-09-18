import { GeneratedFile, OutputType } from './types';

export class WPCSValidator {
  /**
   * Scans generated PHP/CSS files for WPCS standard violations,
   * nonces, proper sanitization, and output escaping.
   */
  public static validate(files: GeneratedFile[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (const file of files) {
      if (file.fileName.endsWith('.php')) {
        // 1. Check for missing esc_* in echo statements
        const rawEchoMatches = file.content.match(/echo\s+\$[a-zA-Z0-9_]+;/g);
        if (rawEchoMatches) {
          issues.push(`[Security Warning] ${file.fileName}: Potential unescaped variable output. Use esc_html(), esc_attr(), or esc_url().`);
        }

        // 2. Check for missing nonce verification in forms / POST
        if (file.content.includes('$_POST') && !file.content.includes('wp_verify_nonce') && !file.content.includes('check_admin_referer')) {
          issues.push(`[Security Error] ${file.fileName}: Direct \$_POST access detected without wp_verify_nonce().`);
        }

        // 3. Check for namespace prefixing
        if (!file.content.includes('rtw_') && !file.content.includes('RTW')) {
          issues.push(`[WPCS Warning] ${file.fileName}: Functions should use a unique vendor prefix (e.g., rtw_).`);
        }
      }

      if (file.fileName === 'theme.json') {
        if (!file.content.includes('"version": 3') && !file.content.includes('"version": 2')) {
          issues.push(`[FSE Warning] theme.json should specify standard version (preferably version 3).`);
        }
      }
    }

    return {
      isValid: issues.filter(i => i.startsWith('[Security Error]')).length === 0,
      issues
    };
  }
}
