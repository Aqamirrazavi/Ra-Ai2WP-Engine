import type { ComponentNode, HookUsage, FormAction } from '../types.ts';
import { SymbolRegistry } from './symbolRegistry.ts';

export interface ScanResult {
  components: ComponentNode[];
  hooks: HookUsage[];
  forms: FormAction[];
  navigationItems: { label: string; href: string }[];
  detectedClasses: Set<string>;
  rawCssContent: string;
}

export class AstScanner {
  /**
   * Scans source files to extract semantic elements, components, hooks, and forms.
   */
  public static scan(
    fileMap: Record<string, string>,
    registry: SymbolRegistry
  ): ScanResult {
    const components: ComponentNode[] = [];
    const hooks: HookUsage[] = [];
    const forms: FormAction[] = [];
    const navigationItems: { label: string; href: string }[] = [];
    const detectedClasses = new Set<string>();
    let rawCssContent = '';

    for (const [filePath, content] of Object.entries(fileMap)) {
      if (filePath.endsWith('.css')) {
        rawCssContent += `\n/* ${filePath} */\n` + content;
      }

      if (!filePath.match(/\.(tsx|jsx|js|ts|html)$/)) continue;

      const baseName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Component';

      // 1. Scan Hook Usages
      const hasState = /useState\s*\(/.test(content);
      const hasEffects = /useEffect\s*\(/.test(content);
      const hasForm = /<form[\s>]/.test(content);

      if (hasState) {
        hooks.push({
          componentName: baseName,
          hookType: 'useState',
          purpose: 'مدیریت داده‌ها یا وضعیت تعاملی در کلاینت',
          wordpressMapping: 'تبدیل به متغیرهای محلی PHP یا تعامل اسکریپت سبک Vanilla JS بدون نیاز به رانتایم React'
        });
      }

      if (hasEffects) {
        hooks.push({
          componentName: baseName,
          hookType: 'useEffect',
          purpose: 'بارگذاری داده‌ها یا اثرات جانبی',
          wordpressMapping: 'نگاشت به حلقه استاندارد وردپرس (WP_Query) یا اندپوینت REST با کش سمت سرور'
        });
      }

      // 2. Scan Form Elements
      if (hasForm) {
        const formActionId = registry.registerAjaxAction(`submit_${baseName.toLowerCase()}`);
        const nonceName = registry.registerNonce(baseName.toLowerCase());

        const fields: { name: string; type: string; required: boolean }[] = [];
        const inputMatches = content.matchAll(/name=["']([^"']+)["']/g);
        for (const match of inputMatches) {
          fields.push({
            name: match[1],
            type: 'text',
            required: content.includes(`name="${match[1]}"`) && content.includes('required')
          });
        }

        forms.push({
          formId: `form_${baseName.toLowerCase()}`,
          fields,
          actionName: formActionId,
          nonceName
        });
      }

      // 3. Scan Navigation Links
      const navMatches = content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g);
      for (const match of navMatches) {
        const href = match[1];
        const rawLabel = match[2].replace(/<[^>]*>/g, '').trim();
        if (rawLabel && !navigationItems.some(n => n.label === rawLabel)) {
          navigationItems.push({ label: rawLabel, href });
        }
      }

      // 4. Collect CSS class names
      const classMatches = content.matchAll(/className=["']([^"']+)["']/g);
      for (const match of classMatches) {
        match[1].split(/\s+/).forEach(cls => {
          if (cls.trim()) detectedClasses.add(cls.trim());
        });
      }

      components.push({
        name: baseName,
        filePath,
        children: [],
        hasForm,
        hasState,
        hasEffects,
        jsxElementsCount: (content.match(/<[A-Za-z0-9]+/g) || []).length
      });
    }

    return {
      components,
      hooks,
      forms,
      navigationItems,
      detectedClasses,
      rawCssContent
    };
  }
}
