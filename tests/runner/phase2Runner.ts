import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RTWCompilerEngine, OutputType } from '../../core-engine/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Phase2TestSpec {
  id: string;
  name: string;
  folderName: string;
  outputType: OutputType;
  outputTypeFa: string;
  expectedFiles: string[];
}

const PHASE2_FIXTURES: Phase2TestSpec[] = [
  {
    id: 'P2-01',
    name: 'Modern Portfolio as FSE Block Theme',
    folderName: 'gf-01-portfolio',
    outputType: OutputType.BLOCK_THEME,
    outputTypeFa: 'قالب بلاکی FSE',
    expectedFiles: ['theme.json', 'templates/index.html', 'parts/header.html', 'parts/footer.html', 'style.css', 'screenshot.png', 'functions.php']
  },
  {
    id: 'P2-02',
    name: 'Contact Form as Modular WP Plugin',
    folderName: 'gf-02-contact-form',
    outputType: OutputType.WP_PLUGIN,
    outputTypeFa: 'افزونه ماژولار وردپرس',
    expectedFiles: ['assets/css/frontend.css', 'assets/js/frontend.js', 'readme.txt']
  },
  {
    id: 'P2-03',
    name: 'Multi-Page Documentation as FSE Block Theme',
    folderName: 'gf-03-multipage-blog',
    outputType: OutputType.BLOCK_THEME,
    outputTypeFa: 'قالب بلاکی FSE',
    expectedFiles: ['theme.json', 'templates/single.html', 'templates/page.html', 'templates/404.html', 'style.css', 'screenshot.png']
  },
  {
    id: 'P2-04',
    name: 'Product Catalog as Gutenberg Custom Block',
    folderName: 'gf-04-product-catalog',
    outputType: OutputType.GUTENBERG_BLOCK,
    outputTypeFa: 'بلوک اختصاصی گوتنبرگ (API v3)',
    expectedFiles: ['block.json', 'render.php', 'src/index.js', 'src/edit.js', 'build/style-index.css']
  },
  {
    id: 'P2-05',
    name: 'Filter Dashboard as Modular WP Plugin',
    folderName: 'gf-05-filter-dashboard',
    outputType: OutputType.WP_PLUGIN,
    outputTypeFa: 'افزونه ماژولار وردپرس',
    expectedFiles: ['assets/css/frontend.css', 'assets/js/frontend.js', 'readme.txt']
  }
];

function loadFilesRecursively(dir: string, baseDir: string = dir): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, loadFilesRecursively(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath);
      result[relPath] = fs.readFileSync(fullPath, 'utf8');
    }
  }
  return result;
}

export async function runPhase2TestSuite(): Promise<{ allPassed: boolean; summary: string }> {
  console.log('\n======================================================');
  console.log('   🚀 RTW CONVERTER — PHASE 2 VERIFICATION SUITE       ');
  console.log('   FSE Block Themes, Modular Plugins & Gutenberg Blocks');
  console.log('======================================================\n');

  let passedCount = 0;

  for (const spec of PHASE2_FIXTURES) {
    const fixtureDir = path.join(__dirname, '../golden-fixtures', spec.folderName);
    console.log(`[TESTING] ${spec.id}: ${spec.name} (${spec.outputTypeFa})...`);

    const files = loadFilesRecursively(fixtureDir);
    if (Object.keys(files).length === 0) {
      console.log(`  ❌ FAIL: Fixture files not found in ${fixtureDir}`);
      continue;
    }

    try {
      const result = await RTWCompilerEngine.convert({
        projectName: spec.name,
        sourceFiles: files,
        outputType: spec.outputType,
        enableRtl: true
      });

      const { verification } = result;

      const hasSyntaxErrors = verification.syntaxErrors.length > 0;
      const hasIntegrityIssues = verification.integrityIssues.length > 0;
      const unwrappedFunctions = verification.unwrappedFunctions.length > 0;
      const unwrappedClasses = verification.unwrappedClasses?.length > 0;
      const cdnFound = verification.cdnDependenciesFound.length > 0;
      const sandboxFailed = !verification.runtimeSandboxPassed;

      // Check required files
      const generatedPaths = new Set(result.files.map(f => f.filePath));
      const missingExpected = spec.expectedFiles.filter(p => !generatedPaths.has(p));

      // Extra checks
      let formatSpecificCheckFailed = false;
      if (spec.outputType === OutputType.BLOCK_THEME) {
        const themeJson = result.files.find(f => f.filePath === 'theme.json');
        if (!themeJson || JSON.parse(themeJson.content).version !== 3) {
          formatSpecificCheckFailed = true;
          console.log('     - theme.json missing or invalid version');
        }
      } else if (spec.outputType === OutputType.WP_PLUGIN) {
        const mainPhp = result.files.find(f => f.filePath.endsWith('.php') && f.content.includes('Plugin Name:'));
        if (!mainPhp || !mainPhp.content.includes('ABSPATH') || !mainPhp.content.includes('add_shortcode')) {
          formatSpecificCheckFailed = true;
          console.log('     - Main plugin PHP missing ABSPATH or add_shortcode');
        }
      } else if (spec.outputType === OutputType.GUTENBERG_BLOCK) {
        const blockJson = result.files.find(f => f.filePath === 'block.json');
        if (!blockJson || JSON.parse(blockJson.content).apiVersion !== 3) {
          formatSpecificCheckFailed = true;
          console.log('     - block.json missing or invalid apiVersion');
        }
      }

      const isPass =
        result.success &&
        !hasSyntaxErrors &&
        !hasIntegrityIssues &&
        !unwrappedFunctions &&
        !unwrappedClasses &&
        !cdnFound &&
        !sandboxFailed &&
        !formatSpecificCheckFailed &&
        missingExpected.length === 0;

      if (isPass) {
        console.log(`  ✅ PASS: 100% compliant, 0 PHP errors, ${result.files.length} files generated, sandbox verified.`);
        passedCount++;
      } else {
        console.log(`  ❌ FAIL:`);
        if (hasSyntaxErrors) console.log(`     - Syntax Errors:`, verification.syntaxErrors);
        if (hasIntegrityIssues) console.log(`     - Integrity Issues:`, verification.integrityIssues);
        if (unwrappedFunctions) console.log(`     - Unwrapped Functions:`, verification.unwrappedFunctions);
        if (cdnFound) console.log(`     - CDN Dependencies:`, verification.cdnDependenciesFound);
        if (sandboxFailed) console.log(`     - Sandbox Failed! Log:`, verification.rawLog);
        if (missingExpected.length) console.log(`     - Missing Expected Files:`, missingExpected);
      }
    } catch (err: any) {
      console.log(`  ❌ EXCEPTION:`, err.message);
    }
    console.log('------------------------------------------------------');
  }

  const allPassed = passedCount === PHASE2_FIXTURES.length;
  console.log(`\n======================================================`);
  console.log(`   PHASE 2 SUITE RESULT: ${passedCount} / ${PHASE2_FIXTURES.length} PASSED`);
  console.log(`   STATUS: ${allPassed ? '🟢 100% CERTIFIED (Phase 2 Complete)' : '🔴 FAILED (Phase 2 Blocked)'}`);
  console.log(`======================================================\n`);

  return {
    allPassed,
    summary: `${passedCount}/${PHASE2_FIXTURES.length} Phase 2 Tests Passed.`
  };
}

runPhase2TestSuite().then(res => {
  if (!res.allPassed) {
    process.exit(1);
  }
});
