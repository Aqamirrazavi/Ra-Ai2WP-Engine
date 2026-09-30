export const OutputType = {
  CLASSIC_THEME: 'CLASSIC_THEME',
  BLOCK_THEME: 'BLOCK_THEME',
  WP_PLUGIN: 'WP_PLUGIN',
  GUTENBERG_BLOCK: 'GUTENBERG_BLOCK',
  SINGLE_TEMPLATE: 'SINGLE_TEMPLATE'
} as const;
export type OutputType = typeof OutputType[keyof typeof OutputType];

export const AIModelMode = {
  HIGH_THINKING: 'HIGH_THINKING',
  LOW_LATENCY: 'LOW_LATENCY'
} as const;
export type AIModelMode = typeof AIModelMode[keyof typeof AIModelMode];

export const StackType = {
  VITE_REACT: 'VITE_REACT',
  NEXTJS_PAGES: 'NEXTJS_PAGES',
  NEXTJS_APP: 'NEXTJS_APP',
  CRA_REACT: 'CRA_REACT',
  PURE_REACT: 'PURE_REACT',
  STATIC_HTML: 'STATIC_HTML',
  UNKNOWN: 'UNKNOWN'
} as const;
export type StackType = typeof StackType[keyof typeof StackType];

export interface GeneratedFile {
  fileName: string;
  filePath: string;
  language: string;
  content: string;
  description: string;
}

export interface ComponentNode {
  name: string;
  filePath: string;
  children: string[];
  hasForm: boolean;
  hasState: boolean;
  hasEffects: boolean;
  jsxElementsCount: number;
}

export interface HookUsage {
  componentName: string;
  hookType: 'useState' | 'useEffect' | 'useMemo' | 'useCallback' | 'useRouter' | 'other';
  purpose: string;
  wordpressMapping: string;
}

export interface FormAction {
  formId: string;
  fields: { name: string; type: string; required: boolean }[];
  actionName: string;
  nonceName: string;
}

export interface AnalysisReport {
  detectedStack: StackType;
  stackNameFa: string;
  projectSlug: string;
  uniquePrefix: string;
  targetType: OutputType;
  components: ComponentNode[];
  hooks: HookUsage[];
  forms: FormAction[];
  externalDependencies: string[];
  unsupportedDependencies: { name: string; suggestedAlternative: string }[];
  summaryFa: string;
}

export interface SyntaxErrorDetail {
  file: string;
  line: number;
  message: string;
}

export interface VerificationResult {
  passed: boolean;
  syntaxErrors: SyntaxErrorDetail[];
  integrityIssues: string[];
  missingScreenshot: boolean;
  cdnDependenciesFound: string[];
  orphanFilesFound: string[];
  unwrappedFunctions: string[];
  runtimeSandboxPassed: boolean;
  renderValidationPassed: boolean;
  missingHtmlElements: string[];
  selfHealedIssues: string[];
  rawLog: string;
  userFriendlyMessageFa: string;
}

export interface ConversionRequest {
  projectName: string;
  sourceCode?: string;
  sourceFiles?: Record<string, string>;
  outputType?: OutputType;
  mode?: AIModelMode;
  apiKey?: string;
  enableRtl?: boolean;
}

export interface ConversionResult {
  success: boolean;
  projectName: string;
  outputType: OutputType;
  report: AnalysisReport;
  verification: VerificationResult;
  files: GeneratedFile[];
  timestamp: number;
}
