import * as crypto from 'crypto';
import type { ComponentNode, HookUsage, FormAction } from '../types.ts';

export interface ExtractedRoute {
  path: string;
  componentName: string;
  pageTitle: string;
  isIndex: boolean;
}

export interface ContentField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'badge' | 'button' | 'stat_number' | 'stat_label' | 'repeater';
  defaultValue: any;
}

export interface ContentSection {
  id: string;
  sectionTitle: string;
  fields: ContentField[];
}

export interface ColorToken {
  slug: string;
  name: string;
  hex: string;
  role: 'background' | 'text' | 'primary' | 'secondary' | 'accent' | 'border' | 'muted';
}

export interface DesignTokens {
  colors: ColorToken[];
  arbitraryHexFound: string[];
  fonts: {
    bodyFont: string;
    headingFont: string;
  };
}

export interface ApiEndpointCall {
  rawUrl: string;
  cleanRoute: string;
  namespace: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  callerComponent: string;
  lineSnippet: string;
}

export interface ProjectManifest {
  projectName: string;
  projectSlug: string;
  version: string;
  createdAt: string;
  manifestHash: string;
  routes: ExtractedRoute[];
  contentSections: ContentSection[];
  designTokens: DesignTokens;
  apiEndpoints: ApiEndpointCall[];
}

export class ManifestAnalyzer {
  /**
   * Generates a structured JSON Manifest from source files before any PHP code generation.
   */
  public static analyzeProject(
    projectName: string,
    fileMap: Record<string, string>
  ): ProjectManifest {
    const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'rtw-project';
    const routes: ExtractedRoute[] = [];
    const contentSections: ContentSection[] = [];
    const hexColorSet = new Set<string>();
    const apiEndpoints: ApiEndpointCall[] = [];

    // Analyze each source file
    for (const [filePath, content] of Object.entries(fileMap)) {
      if (!filePath.match(/\.(tsx|jsx|js|ts|html)$/)) continue;
      const componentName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Component';

      // 1. Extract API Fetch Calls (with strict url, method, route)
      this.extractApiEndpoints(content, componentName, apiEndpoints);

      // 2. Extract Routes (Navigation links, Route state, or a hrefs)
      this.extractRoutes(content, componentName, routes);

      // 3. Extract Design Tokens (Arbitrary Hex, Tailwind Arbitrary classes)
      this.extractHexColors(content, hexColorSet);

      // 4. Extract Content Sections & Verbatim Default Content Fields
      this.extractContentSections(content, componentName, contentSections);
    }

    // Default route fallback if none detected
    if (routes.length === 0) {
      routes.push({
        path: '/',
        componentName: 'IndexComponent',
        pageTitle: projectName,
        isIndex: true
      });
    }

    // Build Design Tokens Palette
    const colors: ColorToken[] = [];
    let idx = 1;
    for (const hex of hexColorSet) {
      const isDark = this.isColorDark(hex);
      colors.push({
        slug: `color-${idx++}`,
        name: `Token ${hex}`,
        hex,
        role: isDark ? 'background' : 'primary'
      });
    }

    const designTokens: DesignTokens = {
      colors,
      arbitraryHexFound: Array.from(hexColorSet),
      fonts: {
        bodyFont: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        headingFont: 'inherit'
      }
    };

    // Calculate deterministic SHA-256 hash of the manifest content
    const rawManifestPayload = JSON.stringify({
      projectName,
      projectSlug,
      routes,
      contentSections,
      designTokens,
      apiEndpoints
    });

    const manifestHash = crypto.createHash('sha256').update(rawManifestPayload).digest('hex');

    return {
      projectName,
      projectSlug,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      manifestHash,
      routes,
      contentSections,
      designTokens,
      apiEndpoints
    };
  }

  private static extractApiEndpoints(
    content: string,
    componentName: string,
    outList: ApiEndpointCall[]
  ): void {
    // Match fetch('/...', { method: 'POST' }) or fetch(`/...`) or fetch('...')
    const fetchMatches = content.matchAll(/fetch\s*\(\s*(['"`])([^'"`]+)\1(?:\s*,\s*(\{[\s\S]*?\}))?\s*\)/g);
    for (const m of fetchMatches) {
      const rawUrl = m[2];
      const optionsBlock = m[3] || '';
      let method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET';
      const methodMatch = optionsBlock.match(/method\s*:\s*['"`](POST|GET|PUT|DELETE|PATCH)['"`]/i);
      if (methodMatch) {
        method = methodMatch[1].toUpperCase() as any;
      }

      // Extract wp-json route & namespace
      let cleanRoute = rawUrl;
      let namespace = 'rtw/v1';
      let endpoint = rawUrl;

      if (rawUrl.includes('/wp-json/')) {
        const afterWpJson = rawUrl.split('/wp-json/')[1];
        cleanRoute = `/${afterWpJson}`;
        const parts = afterWpJson.split('/');
        if (parts.length >= 2) {
          namespace = `${parts[0]}/${parts[1]}`;
          endpoint = '/' + parts.slice(2).join('/');
        }
      } else if (rawUrl.startsWith('/api/')) {
        cleanRoute = rawUrl.replace('/api/', '/rtw/v1/');
        namespace = 'rtw/v1';
        endpoint = rawUrl.replace('/api', '');
      }

      if (!outList.some(item => item.rawUrl === rawUrl && item.method === method)) {
        outList.push({
          rawUrl,
          cleanRoute,
          namespace,
          endpoint,
          method,
          callerComponent: componentName,
          lineSnippet: m[0].substring(0, 100)
        });
      }
    }
  }

  private static extractRoutes(
    content: string,
    componentName: string,
    routes: ExtractedRoute[]
  ): void {
    // Route matching for React Router, useState route keys, or navigation menus
    const routeKeyMatches = content.matchAll(/['"`](\/(?:[a-zA-Z0-9_-]+)?)['"`]/g);
    for (const rm of routeKeyMatches) {
      const p = rm[1];
      if (p === '/' || p.startsWith('/services') || p.startsWith('/about') || p.startsWith('/contact') || p.startsWith('/projects')) {
        if (!routes.some(r => r.path === p)) {
          routes.push({
            path: p,
            componentName,
            pageTitle: this.inferPageTitle(p),
            isIndex: p === '/'
          });
        }
      }
    }

    // Anchor hash navigation (e.g. #projects, #about, #contact)
    const hashMatches = content.matchAll(/<a\s+[^>]*href=["'](#[a-zA-Z0-9_-]+)["'][^>]*>(.*?)<\/a>/g);
    for (const hm of hashMatches) {
      const hashPath = hm[1];
      const title = hm[2].replace(/<[^>]*>/g, '').trim();
      if (!routes.some(r => r.path === hashPath)) {
        routes.push({
          path: hashPath,
          componentName,
          pageTitle: title || hashPath,
          isIndex: false
        });
      }
    }
  }

  private static extractHexColors(content: string, hexSet: Set<string>): void {
    // Arbitrary tailwind colors: bg-[#0B132B], text-[#5BC0BE], etc.
    const arbitraryMatches = content.matchAll(/\[#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\]/g);
    for (const m of arbitraryMatches) {
      const hex = m[0].replace(/[\[\]]/g, '').toUpperCase();
      hexSet.add(hex);
    }

    // Standard hex string literals
    const hexLiterals = content.matchAll(/['"`](#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))['"`]/g);
    for (const m of hexLiterals) {
      hexSet.add(m[1].toUpperCase());
    }
  }

  private static extractContentSections(
    content: string,
    componentName: string,
    sections: ContentSection[]
  ): void {
    const fields: ContentField[] = [];

    // Extract H1 Headings verbatim
    const h1Matches = content.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs);
    let h1Index = 1;
    for (const m of h1Matches) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text) {
        fields.push({
          key: `hero_heading_${h1Index++}`,
          label: 'عنوان اصلی بخش هیرو',
          type: 'text',
          defaultValue: text
        });
      }
    }

    // Extract H2 Headings verbatim
    const h2Matches = content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gs);
    let h2Index = 1;
    for (const m of h2Matches) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text) {
        fields.push({
          key: `sub_heading_${h2Index++}`,
          label: 'عنوان بخش ثانویه',
          type: 'text',
          defaultValue: text
        });
      }
    }

    // Extract Paragraphs verbatim
    const pMatches = content.matchAll(/<p[^>]*>(.*?)<\/p>/gs);
    let pIndex = 1;
    for (const m of pMatches) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text && text.length > 10) {
        fields.push({
          key: `paragraph_text_${pIndex++}`,
          label: 'متن توضیحات',
          type: 'textarea',
          defaultValue: text
        });
      }
    }

    // Extract Badges (e.g. UPPERCASE labels in span)
    const spanMatches = content.matchAll(/<span[^>]*>(.*?)<\/span>/gs);
    let spanIndex = 1;
    for (const m of spanMatches) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text && text.length > 2 && text.length < 60) {
        fields.push({
          key: `badge_${spanIndex++}`,
          label: 'نشان و بج تگ',
          type: 'badge',
          defaultValue: text
        });
      }
    }

    // Extract Button Labels
    const btnMatches = content.matchAll(/<button[^>]*>(.*?)<\/button>/gs);
    let btnIndex = 1;
    for (const m of btnMatches) {
      const text = m[1].replace(/<[^>]*>/g, '').trim();
      if (text && text.length < 50 && !text.includes('(')) {
        fields.push({
          key: `cta_button_${btnIndex++}`,
          label: 'برچسب دکمه اقدام (CTA)',
          type: 'button',
          defaultValue: text
        });
      }
    }

    // Extract Stat Numbers (e.g. ۲۸+, ۷, ۱۰۰٪)
    const statMatches = content.matchAll(/<div[^>]*font-extrabold[^>]*>(.*?)<\/div>\s*<div[^>]*text-xs[^>]*>(.*?)<\/div>/gs);
    let statIndex = 1;
    for (const m of statMatches) {
      const num = m[1].replace(/<[^>]*>/g, '').trim();
      const lbl = m[2].replace(/<[^>]*>/g, '').trim();
      if (num && lbl) {
        fields.push({
          key: `stat_number_${statIndex}`,
          label: `آمار عددی ${statIndex}`,
          type: 'stat_number',
          defaultValue: num
        });
        fields.push({
          key: `stat_label_${statIndex}`,
          label: `برچسب آمار ${statIndex}`,
          type: 'stat_label',
          defaultValue: lbl
        });
        statIndex++;
      }
    }

    // Extract Initial State Objects (e.g. projects array)
    const arrayMatch = content.match(/useState<[^>]*>\s*\(\s*(\[\s*\{[\s\S]*?\}\s*\])\s*\)/);
    if (arrayMatch) {
      try {
        // Safe evaluation of JSON-like JS object array
        const rawArrayStr = arrayMatch[1]
          .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
          .replace(/'/g, '"');
        const parsed = JSON.parse(rawArrayStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fields.push({
            key: 'initial_items_repeater',
            label: 'لیست داده‌های پیش‌فرض پروژه',
            type: 'repeater',
            defaultValue: parsed
          });
        }
      } catch {
        // Fallback: raw string capture
        fields.push({
          key: 'initial_items_repeater_raw',
          label: 'داده‌های اولیه آرایه',
          type: 'repeater',
          defaultValue: arrayMatch[1]
        });
      }
    }

    if (fields.length > 0) {
      sections.push({
        id: `section_${componentName.toLowerCase()}`,
        sectionTitle: `بخش ${componentName}`,
        fields
      });
    }
  }

  private static inferPageTitle(p: string): string {
    if (p === '/') return 'صفحه اصلی';
    if (p.includes('services')) return 'خدمات ما';
    if (p.includes('about')) return 'درباره ما';
    if (p.includes('contact')) return 'ارتباط با ما';
    if (p.includes('projects')) return 'پروژه‌ها';
    return p.replace(/[/_-]/g, ' ').trim();
  }

  private static isColorDark(hex: string): boolean {
    const clean = hex.replace('#', '');
    const fullHex = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const r = parseInt(fullHex.substring(0, 2), 16) || 0;
    const g = parseInt(fullHex.substring(2, 4), 16) || 0;
    const b = parseInt(fullHex.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }
}
