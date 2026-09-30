export class CssBundler {
  /**
   * Compiles and bundles standalone CSS rules for detected utility classes and custom CSS.
   * Completely eliminates the need for external CDNs (like Tailwind Play CDN).
   */
  public static bundle(
    detectedClasses: Set<string>,
    rawCustomCss: string,
    enableRtl: boolean = true
  ): string {
    const rules: string[] = [];

    // 1. Reset and Modern Base Styles
    rules.push(`
/* ══════════════════════════════════════════════════════
   Standalone Compiled Stylesheet (Zero External CDN)
   ══════════════════════════════════════════════════════ */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Vazirmatn", Oxygen, Ubuntu, sans-serif;
  line-height: 1.6;
  direction: ${enableRtl ? 'rtl' : 'ltr'};
  text-align: ${enableRtl ? 'right' : 'left'};
  background-color: #0f172a;
  color: #f8fafc;
}

a {
  color: inherit;
  text-decoration: none;
}

img, svg {
  display: block;
  max-width: 100%;
}

button, input, select, textarea {
  font-family: inherit;
  font-size: inherit;
}
`);

    // 2. Comprehensive Utility Engine for detected classes
    const classArray = Array.from(detectedClasses);

    // Layout & Flexbox / Grid
    if (classArray.some(c => c.includes('flex'))) rules.push('.flex { display: flex; }');
    if (classArray.some(c => c.includes('inline-flex'))) rules.push('.inline-flex { display: inline-flex; }');
    if (classArray.some(c => c.includes('grid'))) rules.push('.grid { display: grid; }');
    if (classArray.some(c => c.includes('hidden'))) rules.push('.hidden { display: none; }');
    if (classArray.some(c => c.includes('block'))) rules.push('.block { display: block; }');
    if (classArray.some(c => c.includes('inline-block'))) rules.push('.inline-block { display: inline-block; }');

    rules.push(`
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1 1 0%; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
`);

    // Responsive Grids
    rules.push(`
@media (min-width: 640px) {
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
}
@media (min-width: 768px) {
  .md\\:flex { display: flex; }
  .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\\:col-span-2 { grid-column: span 2 / span 2; }
  .md\\:text-6xl { font-size: 3.75rem; line-height: 1; }
  .md\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
}
@media (min-width: 1024px) {
  .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
}
`);

    // Spacing, Width & Sizing
    rules.push(`
.max-w-2xl { max-width: 42rem; }
.max-w-5xl { max-width: 64rem; }
.max-w-6xl { max-width: 72rem; }
.max-w-xl { max-width: 36rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.w-full { width: 100%; }
.min-h-screen { min-height: 100vh; }
.h-10 { height: 2.5rem; }
.w-10 { width: 2.5rem; }
.h-12 { height: 3rem; }
.w-12 { width: 3rem; }
.h-4 { height: 1rem; }
.w-4 { width: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-3\\.5 { padding-top: 0.875rem; padding-bottom: 0.875rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.py-10 { padding-top: 2.5rem; padding-bottom: 2.5rem; }
.py-12 { padding-top: 3rem; padding-bottom: 3rem; }
.py-16 { padding-top: 4rem; padding-bottom: 4rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.p-4 { padding: 1rem; }
.p-5 { padding: 1.25rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.mb-10 { margin-bottom: 2.5rem; }
.mb-14 { margin-bottom: 3.5rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-auto { margin-top: auto; }
.mr-2 { margin-left: 0.5rem; }
.mr-3 { margin-left: 0.75rem; }
.ml-3 { margin-right: 0.75rem; }
`);

    // Colors & Backgrounds
    rules.push(`
.bg-slate-900 { background-color: #0f172a; }
.bg-slate-950 { background-color: #020617; }
.bg-slate-800 { background-color: #1e293b; }
.bg-slate-800\\/60 { background-color: rgba(30, 41, 59, 0.6); }
.bg-slate-900\\/90 { background-color: rgba(15, 23, 42, 0.9); }
.bg-slate-100 { background-color: #f1f5f9; }
.bg-slate-50 { background-color: #f8fafc; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-white { background-color: #ffffff; }
.bg-cyan-500 { background-color: #06b6d4; }
.bg-cyan-950 { background-color: #083344; }
.bg-blue-600 { background-color: #2563eb; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-indigo-600 { background-color: #4f46e5; }
.bg-indigo-50 { background-color: #eef2ff; }
.bg-green-50 { background-color: #f0fdf4; }
.bg-amber-100 { background-color: #fef3c7; }

.text-white { color: #ffffff; }
.text-slate-100 { color: #f1f5f9; }
.text-slate-300 { color: #cbd5e1; }
.text-slate-400 { color: #94a3b8; }
.text-slate-500 { color: #64748b; }
.text-slate-600 { color: #475569; }
.text-slate-800 { color: #1e293b; }
.text-slate-900 { color: #0f172a; }
.text-slate-950 { color: #020617; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }
.text-cyan-400 { color: #22d3ee; }
.text-blue-600 { color: #2563eb; }
.text-blue-700 { color: #1d4ed8; }
.text-indigo-600 { color: #4f46e5; }
.text-green-800 { color: #166534; }
.text-amber-500 { color: #f59e0b; }
.text-amber-800 { color: #92400e; }
.text-red-600 { color: #dc2626; }

.border { border-width: 1px; border-style: solid; }
.border-b { border-bottom-width: 1px; border-bottom-style: solid; }
.border-t { border-top-width: 1px; border-top-style: solid; }
.border-slate-800 { border-color: #1e293b; }
.border-slate-700 { border-color: #334155; }
.border-slate-700\\/50 { border-color: rgba(51, 65, 85, 0.5); }
.border-slate-700\\/60 { border-color: rgba(51, 65, 85, 0.6); }
.border-slate-200 { border-color: #e2e8f0; }
.border-slate-100 { border-color: #f1f5f9; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-gray-300 { border-color: #d1d5db; }
.border-cyan-800 { border-color: #155e75; }
.border-green-500 { border-color: #22c55e; }

.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-2xl { border-radius: 1rem; }
.rounded-full { border-radius: 9999px; }
.rounded-md { border-radius: 0.375rem; }

.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }

.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black { font-weight: 900; }
.font-semibold { font-weight: 600; }
.font-medium { font-weight: 500; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.text-center { text-align: center; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.space-y-3 > * + * { margin-top: 0.75rem; }
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-8 > * + * { margin-top: 2rem; }
`);

    // Append any custom CSS from the project
    if (rawCustomCss.trim()) {
      rules.push(`\n/* Project Custom Styles */\n` + rawCustomCss.replace(/@tailwind[^;]+;/g, ''));
    }

    return rules.join('\n');
  }
}
