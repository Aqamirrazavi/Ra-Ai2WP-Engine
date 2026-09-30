import type { GeneratedFile, SyntaxErrorDetail } from '../types.ts';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class SyntaxChecker {
  /**
   * Validates PHP files for syntax and lexical errors.
   * Uses `php -l` CLI if available on system, plus AST-level lexical validation.
   */
  public static checkSyntax(files: GeneratedFile[]): SyntaxErrorDetail[] {
    const errors: SyntaxErrorDetail[] = [];
    const phpAvailable = this.isPhpBinaryAvailable();

    for (const file of files) {
      if (!file.fileName.endsWith('.php')) continue;

      // 1. In-process Lexical & Token Structure Check
      const lexicalErrors = this.checkLexicalSyntax(file.fileName, file.content);
      errors.push(...lexicalErrors);

      // 2. Real `php -l` execution if PHP CLI is installed
      if (phpAvailable) {
        const cliErrors = this.runPhpLintCli(file.fileName, file.content);
        errors.push(...cliErrors);
      }
    }

    return errors;
  }

  private static isPhpBinaryAvailable(): boolean {
    try {
      execSync('php -v', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  private static runPhpLintCli(fileName: string, content: string): SyntaxErrorDetail[] {
    const errors: SyntaxErrorDetail[] = [];
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtw_lint_'));
    const tmpFilePath = path.join(tmpDir, fileName);

    try {
      fs.mkdirSync(path.dirname(tmpFilePath), { recursive: true });
      fs.writeFileSync(tmpFilePath, content, 'utf8');

      try {
        execSync(`php -l "${tmpFilePath}"`, { stdio: 'pipe' });
      } catch (err: any) {
        const output = err.stdout?.toString() || err.stderr?.toString() || err.message;
        const lineMatch = output.match(/on line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1], 10) : 1;
        errors.push({
          file: fileName,
          line,
          message: output.trim()
        });
      }
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // cleanup ignore
      }
    }

    return errors;
  }

  private static checkLexicalSyntax(fileName: string, content: string): SyntaxErrorDetail[] {
    const errors: SyntaxErrorDetail[] = [];
    const lines = content.split('\n');

    // Check PHP tag opening
    if (!content.trim().startsWith('<?php')) {
      errors.push({
        file: fileName,
        line: 1,
        message: 'PHP file must start with <?php tag'
      });
    }

    // Check bracket and parenthesis balancing
    let openBraces = 0;
    let openParens = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Skip comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
        continue;
      }

      for (const char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
      }

      if (openBraces < 0) {
        errors.push({
          file: fileName,
          line: lineNum,
          message: 'Extra closing curly brace } encountered'
        });
        openBraces = 0;
      }

      if (openParens < 0) {
        errors.push({
          file: fileName,
          line: lineNum,
          message: 'Extra closing parenthesis ) encountered'
        });
        openParens = 0;
      }
    }

    if (openBraces > 0) {
      errors.push({
        file: fileName,
        line: lines.length,
        message: `Unclosed curly brace { (${openBraces} remaining at end of file)`
      });
    }

    if (openParens > 0) {
      errors.push({
        file: fileName,
        line: lines.length,
        message: `Unclosed parenthesis ( (${openParens} remaining at end of file)`
      });
    }

    return errors;
  }
}
