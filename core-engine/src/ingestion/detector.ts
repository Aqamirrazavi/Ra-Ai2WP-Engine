import { StackType } from '../types.ts';

export interface DetectionResult {
  stack: StackType;
  stackNameFa: string;
  entryFiles: string[];
  hasTailwind: boolean;
  hasRouter: boolean;
  unsupportedReason?: string;
}

export class ProjectDetector {
  /**
   * Analyzes the collection of file paths and package manifests to determine the project stack.
   */
  public static detect(fileMap: Record<string, string>): DetectionResult {
    const filePaths = Object.keys(fileMap);

    // 1. Check package.json if present
    let packageJsonContent: any = null;
    const packageJsonPath = filePaths.find(p => p.endsWith('package.json'));
    if (packageJsonPath) {
      try {
        packageJsonContent = JSON.parse(fileMap[packageJsonPath]);
      } catch {
        // Invalid json, fallback to file paths
      }
    }

    const dependencies = {
      ...(packageJsonContent?.dependencies || {}),
      ...(packageJsonContent?.devDependencies || {})
    };

    const hasNext = 'next' in dependencies || filePaths.some(p => p.includes('pages/') || p.includes('app/page.'));
    const hasVite = 'vite' in dependencies || filePaths.some(p => p.includes('vite.config'));
    const hasCra = 'react-scripts' in dependencies;
    const hasReact = 'react' in dependencies || filePaths.some(p => p.endsWith('.tsx') || p.endsWith('.jsx'));
    const hasTailwind = 'tailwindcss' in dependencies || filePaths.some(p => p.includes('tailwind.config'));
    const hasRouter = 'react-router-dom' in dependencies || 'react-router' in dependencies;

    // Next.js App Router vs Pages Router
    if (hasNext) {
      const isAppRouter = filePaths.some(p => p.match(/app\/.*page\.(tsx|jsx|js|ts)/));
      const entryFiles = filePaths.filter(p => p.match(/(pages|app)\/.*\.(tsx|jsx|js|ts)/));
      return {
        stack: isAppRouter ? StackType.NEXTJS_APP : StackType.NEXTJS_PAGES,
        stackNameFa: isAppRouter ? 'پروژه Next.js (App Router)' : 'پروژه Next.js (Pages Router)',
        entryFiles: entryFiles.length ? entryFiles : ['pages/index.tsx'],
        hasTailwind,
        hasRouter: true
      };
    }

    // Vite + React
    if (hasVite && hasReact) {
      const entryFiles = filePaths.filter(p => p.match(/(src\/)?(App|main|index)\.(tsx|jsx|js|ts)/));
      return {
        stack: StackType.VITE_REACT,
        stackNameFa: 'پروژه Vite + React',
        entryFiles: entryFiles.length ? entryFiles : ['src/App.tsx'],
        hasTailwind,
        hasRouter
      };
    }

    // Create React App
    if (hasCra && hasReact) {
      const entryFiles = filePaths.filter(p => p.match(/src\/(App|index)\.(tsx|jsx|js|ts)/));
      return {
        stack: StackType.CRA_REACT,
        stackNameFa: 'پروژه Create React App',
        entryFiles: entryFiles.length ? entryFiles : ['src/App.tsx'],
        hasTailwind,
        hasRouter
      };
    }

    // Pure React / Single Component
    if (hasReact) {
      const entryFiles = filePaths.filter(p => p.match(/\.(tsx|jsx)$/));
      return {
        stack: StackType.PURE_REACT,
        stackNameFa: 'کامپوننت React مستقل (JSX/TSX)',
        entryFiles: entryFiles.length ? entryFiles : ['App.tsx'],
        hasTailwind,
        hasRouter
      };
    }

    // Static HTML / CSS
    const hasHtml = filePaths.some(p => p.endsWith('.html'));
    if (hasHtml) {
      return {
        stack: StackType.STATIC_HTML,
        stackNameFa: 'طراحی HTML/CSS استاتیک',
        entryFiles: filePaths.filter(p => p.endsWith('.html')),
        hasTailwind,
        hasRouter: false
      };
    }

    // Unsupported stack with clear explanation
    return {
      stack: StackType.UNKNOWN,
      stackNameFa: 'ساختار ناشناخته / پشتیبانی‌نشده',
      entryFiles: [],
      hasTailwind: false,
      hasRouter: false,
      unsupportedReason: 'این پروژه با ساختار ناشناخته شناسایی شد که هنوز پشتیبانی نمی‌شود. موارد پشتیبانی‌شده: Vite React, Next.js, Create React App, کامپوننت‌های React و HTML/CSS استاتیک.'
    };
  }
}
