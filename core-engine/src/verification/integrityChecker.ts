import type { GeneratedFile, OutputType } from '../types.ts';
import { OutputType as OutputTypeEnum } from '../types.ts';

export interface IntegrityReport {
  isValid: boolean;
  unwrappedFunctions: string[];
  unwrappedClasses: string[];
  missingScreenshot: boolean;
  cdnDependenciesFound: string[];
  missingRequires: string[];
  orphanFilesFound: string[];
  issues: string[];
}

export class IntegrityChecker {
  /**
   * Enforces all architectural and structural non-negotiables:
   * 1. 100% function_exists (for global functions) / class_exists (for classes)
   * 2. Zero orphan / missing require statements
   * 3. Valid screenshot.png (for themes)
   * 4. Zero external CDN dependencies
   * 5. Valid schema for theme.json / block.json if applicable
   */
  public static verify(
    files: GeneratedFile[],
    expectedPrefix: string,
    outputType: OutputType = OutputTypeEnum.CLASSIC_THEME
  ): IntegrityReport {
    const issues: string[] = [];
    const unwrappedFunctions: string[] = [];
    const unwrappedClasses: string[] = [];
    const cdnDependenciesFound: string[] = [];
    const missingRequires: string[] = [];
    const orphanFilesFound: string[] = [];

    const filePaths = new Set(files.map(f => f.filePath));

    // 1. Screenshot Check (Mandatory for Themes)
    const isTheme = outputType === OutputTypeEnum.CLASSIC_THEME || outputType === OutputTypeEnum.BLOCK_THEME;
    const screenshot = files.find(f => f.fileName === 'screenshot.png' || f.filePath === 'screenshot.png');
    const missingScreenshot = isTheme && (!screenshot || !screenshot.content || screenshot.content.length === 0);
    if (missingScreenshot) {
      issues.push('[Build Error] Mandatory screenshot.png is missing or empty in theme package.');
    }

    // 2. Format-specific structural validation
    if (outputType === OutputTypeEnum.BLOCK_THEME) {
      const themeJson = files.find(f => f.filePath === 'theme.json');
      if (!themeJson) {
        issues.push('[FSE Error] theme.json is mandatory for Block Themes.');
      } else {
        try {
          const parsed = JSON.parse(themeJson.content);
          if (parsed.version !== 3) {
            issues.push(`[FSE Warning] theme.json version is ${parsed.version}, expected version 3.`);
          }
        } catch (e: any) {
          issues.push(`[FSE Error] theme.json is not valid JSON: ${e.message}`);
        }
      }

      if (!filePaths.has('templates/index.html')) {
        issues.push('[FSE Error] templates/index.html is mandatory for Block Themes.');
      }
    }

    if (outputType === OutputTypeEnum.WP_PLUGIN) {
      const phpFiles = files.filter(f => f.filePath.endsWith('.php'));
      const hasPluginHeader = phpFiles.some(f => f.content.includes('Plugin Name:'));
      if (!hasPluginHeader) {
        issues.push('[Plugin Error] Main plugin file with "Plugin Name:" header is missing.');
      }
      const hasReadme = filePaths.has('readme.txt') || filePaths.has('README.txt');
      if (!hasReadme) {
        issues.push('[Plugin Warning] Standard readme.txt is recommended for WordPress plugins.');
      }
    }

    if (outputType === OutputTypeEnum.GUTENBERG_BLOCK) {
      const blockJson = files.find(f => f.filePath === 'block.json');
      if (!blockJson) {
        issues.push('[Block Error] block.json is mandatory for Gutenberg Blocks.');
      } else {
        try {
          const parsed = JSON.parse(blockJson.content);
          if (parsed.apiVersion !== 3) {
            issues.push(`[Block Warning] block.json apiVersion is ${parsed.apiVersion}, expected version 3.`);
          }
        } catch (e: any) {
          issues.push(`[Block Error] block.json is not valid JSON: ${e.message}`);
        }
      }
      if (!filePaths.has('render.php')) {
        issues.push('[Block Error] render.php is required for dynamic Gutenberg Blocks.');
      }
    }

    // 3. Scan PHP files for function_exists, class_exists, and CDN links
    for (const file of files) {
      // Check for external CDN calls
      if (file.content.includes('cdn.tailwindcss.com') || file.content.includes('unpkg.com') || file.content.includes('jsdelivr.net')) {
        cdnDependenciesFound.push(file.filePath);
        issues.push(`[CDN Dependency Error] ${file.filePath} contains external CDN references. All styles/scripts must be bundled locally.`);
      }

      if (!file.fileName.endsWith('.php')) continue;

      // Extract class declarations: class Foo
      const classRegex = /class\s+([a-zA-Z0-9_]+)\s*[{ ]/g;
      let classMatch;
      while ((classMatch = classRegex.exec(file.content)) !== null) {
        const className = classMatch[1];
        const checkPattern = `class_exists( '${className}' )`;
        const checkPatternAlt = `class_exists('${className}')`;

        if (!file.content.includes(checkPattern) && !file.content.includes(checkPatternAlt)) {
          unwrappedClasses.push(`${file.filePath} -> ${className}`);
          issues.push(`[Fatal Safety Error] Class "${className}" in ${file.filePath} is not wrapped in class_exists().`);
        }
      }

      // Extract only GLOBAL function declarations (functions not inside a class)
      const globalFunctions = this.extractGlobalFunctions(file.content);
      for (const funcName of globalFunctions) {
        if (['function', '__construct', '__destruct'].includes(funcName)) continue;

        const checkPattern = `function_exists( '${funcName}' )`;
        const checkPatternAlt = `function_exists('${funcName}')`;
        const checkPatternDouble = `function_exists( "${funcName}" )`;
        const checkPatternDoubleAlt = `function_exists("${funcName}")`;

        if (
          !file.content.includes(checkPattern) &&
          !file.content.includes(checkPatternAlt) &&
          !file.content.includes(checkPatternDouble) &&
          !file.content.includes(checkPatternDoubleAlt)
        ) {
          unwrappedFunctions.push(`${file.filePath} -> ${funcName}`);
          issues.push(`[Fatal Safety Error] Global function "${funcName}" in ${file.filePath} is not wrapped in function_exists().`);
        }
      }
    }

    // 4. Require Integrity (for classic themes and multi-file packages)
    const functionsPhp = files.find(f => f.filePath === 'functions.php');
    if (functionsPhp) {
      const requireMatches = functionsPhp.content.matchAll(/require_once\s+[^;]+'\/([^']+)'/g);
      const requiredTargets: string[] = [];

      for (const match of requireMatches) {
        const relativeTarget = match[1];
        requiredTargets.push(relativeTarget);

        if (!filePaths.has(relativeTarget)) {
          missingRequires.push(relativeTarget);
          issues.push(`[Integrity Error] functions.php requires '${relativeTarget}', but this file was not generated in the package.`);
        }
      }

      // Check for orphan .php files in inc/
      for (const file of files) {
        if (file.filePath.startsWith('inc/') && file.filePath.endsWith('.php')) {
          if (!requiredTargets.includes(file.filePath)) {
            orphanFilesFound.push(file.filePath);
            issues.push(`[Orphan File Error] '${file.filePath}' was generated but is never required in functions.php.`);
          }
        }
      }
    }

    const isValid =
      !missingScreenshot &&
      unwrappedFunctions.length === 0 &&
      unwrappedClasses.length === 0 &&
      cdnDependenciesFound.length === 0 &&
      missingRequires.length === 0 &&
      orphanFilesFound.length === 0 &&
      !issues.some(i => i.startsWith('[Build Error]') || i.startsWith('[FSE Error]') || i.startsWith('[Plugin Error]') || i.startsWith('[Block Error]'));

    return {
      isValid,
      unwrappedFunctions,
      unwrappedClasses,
      missingScreenshot,
      cdnDependenciesFound,
      missingRequires,
      orphanFilesFound,
      issues
    };
  }

  /**
   * Identifies only top-level (global) function declarations in PHP code,
   * excluding methods inside class definitions.
   */
  public static extractGlobalFunctions(content: string): string[] {
    const globalFunctions: string[] = [];
    let insideClass = false;
    let braceDepth = 0;
    let classBraceDepth = 0;

    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        continue;
      }

      if (/\bclass\s+[a-zA-Z0-9_]+/i.test(line)) {
        insideClass = true;
        classBraceDepth = braceDepth + (line.includes('{') ? 1 : 0);
      }

      // Check for function declaration when NOT inside class
      if (!insideClass) {
        const funcMatch = line.match(/\bfunction\s+([a-zA-Z0-9_]+)\s*\(/);
        if (funcMatch && funcMatch[1]) {
          globalFunctions.push(funcMatch[1]);
        }
      }

      for (const char of line) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
          if (insideClass && braceDepth < classBraceDepth) {
            insideClass = false;
          }
        }
      }
    }

    return globalFunctions;
  }
}
