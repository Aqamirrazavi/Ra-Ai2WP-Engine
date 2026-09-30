import type {
  ConversionRequest,
  ConversionResult,
  AnalysisReport,
  VerificationResult,
  GeneratedFile
} from './types.ts';
import { OutputType } from './types.ts';
import { ProjectDetector } from './ingestion/detector.ts';
import { SymbolRegistry } from './parser/symbolRegistry.ts';
import { AstScanner } from './parser/astScanner.ts';
import { ClassicThemeGenerator } from './generators/classic/classicThemeGenerator.ts';
import { BlockThemeGenerator } from './generators/fse/blockThemeGenerator.ts';
import { PluginGenerator } from './generators/plugin/pluginGenerator.ts';
import { GutenbergBlockGenerator } from './generators/block/gutenbergBlockGenerator.ts';
import { SyntaxChecker } from './verification/syntaxChecker.ts';
import { IntegrityChecker } from './verification/integrityChecker.ts';
import { RuntimeSandbox } from './verification/runtimeSandbox.ts';
import { SelfHealer } from './verification/selfHealer.ts';

export { OutputType, AIModelMode, StackType } from './types.ts';
export type {
  GeneratedFile,
  ComponentNode,
  HookUsage,
  FormAction,
  AnalysisReport,
  SyntaxErrorDetail,
  VerificationResult,
  ConversionRequest,
  ConversionResult
} from './types.ts';
export { SymbolRegistry } from './parser/symbolRegistry.ts';
export { ProjectDetector } from './ingestion/detector.ts';
export { AstScanner } from './parser/astScanner.ts';
export { ClassicThemeGenerator } from './generators/classic/classicThemeGenerator.ts';
export { BlockThemeGenerator } from './generators/fse/blockThemeGenerator.ts';
export { PluginGenerator } from './generators/plugin/pluginGenerator.ts';
export { GutenbergBlockGenerator } from './generators/block/gutenbergBlockGenerator.ts';
export { SyntaxChecker } from './verification/syntaxChecker.ts';
export { IntegrityChecker } from './verification/integrityChecker.ts';
export { RuntimeSandbox } from './verification/runtimeSandbox.ts';
export { SelfHealer } from './verification/selfHealer.ts';

export class RTWCompilerEngine {
  /**
   * Main entry point for RTW Universal Compiler:
   * Supports:
   * - Phase 1: Classic WordPress Themes
   * - Phase 2: Full Site Editing (FSE) Block Themes, WordPress Plugins, and Gutenberg Custom Blocks
   * Enforces the fundamental principle: "Correctness before Breadth".
   */
  public static async convert(request: ConversionRequest): Promise<ConversionResult> {
    const projectName = (request.projectName || 'RTW Theme').trim();
    const outputType = request.outputType || OutputType.CLASSIC_THEME;

    // 1. Prepare file map
    const fileMap: Record<string, string> = request.sourceFiles || {
      'src/App.tsx': request.sourceCode || 'export default function App() { return <div>RTW Ready</div>; }'
    };

    // 2. Step 1: Ingestion & Stack Detection
    const detection = ProjectDetector.detect(fileMap);
    const registry = new SymbolRegistry(projectName);
    const prefix = registry.getPrefix();

    if (detection.unsupportedReason) {
      return {
        success: false,
        projectName,
        outputType,
        report: {
          detectedStack: detection.stack,
          stackNameFa: detection.stackNameFa,
          projectSlug: registry.getSlug(),
          uniquePrefix: prefix,
          targetType: outputType,
          components: [],
          hooks: [],
          forms: [],
          externalDependencies: [],
          unsupportedDependencies: [],
          summaryFa: detection.unsupportedReason
        },
        verification: {
          passed: false,
          syntaxErrors: [],
          integrityIssues: [detection.unsupportedReason],
          missingScreenshot: outputType === OutputType.CLASSIC_THEME || outputType === OutputType.BLOCK_THEME,
          cdnDependenciesFound: [],
          orphanFilesFound: [],
          unwrappedFunctions: [],
          runtimeSandboxPassed: false,
          renderValidationPassed: false,
          missingHtmlElements: ['تمام المان‌ها (عدم شناسایی پشته استاندارد)'],
          selfHealedIssues: [],
          rawLog: detection.unsupportedReason,
          userFriendlyMessageFa: detection.unsupportedReason
        },
        files: [],
        timestamp: Date.now()
      };
    }

    // 3. Step 2: AST Analysis & Symbol Mapping
    const scan = AstScanner.scan(fileMap, registry);

    const report: AnalysisReport = {
      detectedStack: detection.stack,
      stackNameFa: detection.stackNameFa,
      projectSlug: registry.getSlug(),
      uniquePrefix: prefix,
      targetType: outputType,
      components: scan.components,
      hooks: scan.hooks,
      forms: scan.forms,
      externalDependencies: detection.hasTailwind ? ['tailwindcss (کامپایل محلی به CSS)'] : [],
      unsupportedDependencies: [],
      summaryFa: `پروژه با ساختار "${detection.stackNameFa}" با موفقیت تحلیل شد. تعداد ${scan.components.length} کامپوننت، ${scan.hooks.length} هوک و ${scan.forms.length} فرم شناسایی گردید.`
    };

    // 4. Step 3: Architecture-Specific Generation
    let files: GeneratedFile[];
    switch (outputType) {
      case OutputType.BLOCK_THEME:
        files = BlockThemeGenerator.generate(
          projectName,
          detection,
          scan,
          registry,
          request.enableRtl !== false
        );
        break;

      case OutputType.WP_PLUGIN:
        files = PluginGenerator.generate(
          projectName,
          detection,
          scan,
          registry,
          request.enableRtl !== false
        );
        break;

      case OutputType.GUTENBERG_BLOCK:
        files = GutenbergBlockGenerator.generate(
          projectName,
          detection,
          scan,
          registry,
          request.enableRtl !== false
        );
        break;

      case OutputType.CLASSIC_THEME:
      default:
        files = ClassicThemeGenerator.generate(
          projectName,
          detection,
          scan,
          registry,
          request.enableRtl !== false
        );
        break;
    }

    // 5. Step 4: Automated Verification & Self-Healing Loop
    const selfHealedIssues: string[] = [];

    // Run first pass of integrity check
    let integrity = IntegrityChecker.verify(files, prefix, outputType);
    if (!integrity.isValid) {
      // Trigger self-healing
      const healResult = SelfHealer.heal(files, projectName, prefix, outputType);
      if (healResult.healed) {
        files = healResult.repairedFiles;
        selfHealedIssues.push(...healResult.actionsApplied);
        // Re-verify after healing
        integrity = IntegrityChecker.verify(files, prefix, outputType);
      }
    }

    // Run syntax check on all PHP files
    const syntaxErrors = SyntaxChecker.checkSyntax(files);

    // Run runtime sandbox simulation
    const sandboxResult = RuntimeSandbox.execute(files, registry.getSlug(), outputType);

    const isFullyValid =
      integrity.isValid &&
      syntaxErrors.length === 0 &&
      sandboxResult.success;

    let targetNameFa = 'قالب کلاسیک وردپرس';
    if (outputType === OutputType.BLOCK_THEME) targetNameFa = 'قالب مدرن بلاکی (FSE) وردپرس';
    else if (outputType === OutputType.WP_PLUGIN) targetNameFa = 'افزونه ماژولار وردپرس';
    else if (outputType === OutputType.GUTENBERG_BLOCK) targetNameFa = 'بلوک اختصاصی گوتنبرگ (API v3)';

    const userFriendlyMessage = isFullyValid
      ? `${targetNameFa} "${projectName}" با موفقیت ۱۰۰٪ و بدون هیچ خطای PHP یا تداخل نام کامپایل شد و آماده نصب است.`
      : `فرآیند تبدیل در مرحله اعتبارسنجی متوقف شد. دلایل: ${[
          syntaxErrors.length ? 'خطای نحوی در فایل‌های PHP' : '',
          !integrity.isValid ? 'نقض قواعد یکپارچگی و ساختار خروجی' : '',
          !sandboxResult.success ? 'خطا در شبیه‌ساز اجرای وردپرس' : ''
        ].filter(Boolean).join('، ')}.`;

    const verification: VerificationResult = {
      passed: isFullyValid,
      syntaxErrors,
      integrityIssues: integrity.issues,
      missingScreenshot: integrity.missingScreenshot,
      cdnDependenciesFound: integrity.cdnDependenciesFound,
      orphanFilesFound: integrity.orphanFilesFound,
      unwrappedFunctions: integrity.unwrappedFunctions,
      runtimeSandboxPassed: !sandboxResult.hasFatalError && !sandboxResult.hasWsod,
      renderValidationPassed: sandboxResult.missingElements.length === 0,
      missingHtmlElements: sandboxResult.missingElements,
      selfHealedIssues,
      rawLog: sandboxResult.outputLog || 'All verification gates passed.',
      userFriendlyMessageFa: userFriendlyMessage
    };

    return {
      success: isFullyValid,
      projectName,
      outputType,
      report,
      verification,
      files: isFullyValid ? files : [],
      timestamp: Date.now()
    };
  }
}
