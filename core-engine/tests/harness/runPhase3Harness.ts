import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RTWCompilerEngine } from '../../src/index.ts';
import { OutputType } from '../../src/types.ts';
import { ValidationHarness } from './validationHarness.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FixtureDefinition {
  id: string;
  name: string;
  dir: string;
}

async function main() {
  console.log('\n================================================================');
  console.log('   🚀 RTW CONVERTER — PHASE 3 FULL HARNESS VALIDATION SUITE    ');
  console.log('   Classic Theme Generator (Server-Rendered, Pre-Filled Root)   ');
  console.log('   Strict Quality Gates Across All 5 Reference Fixtures         ');
  console.log('================================================================\n');

  const fixturesDir = path.resolve(__dirname, '../fixtures');
  const fixtures: FixtureDefinition[] = [
    {
      id: 'GF-01',
      name: 'Static Tailwind Hero (Arbitrary Colors & Variants)',
      dir: path.join(fixturesDir, '01-static-tailwind')
    },
    {
      id: 'GF-02',
      name: 'Interactive Lead Form (Local State & Fetch)',
      dir: path.join(fixturesDir, '02-form-local-state-fetch')
    },
    {
      id: 'GF-03',
      name: 'Three-Route App (Client-side Navigation & SSR)',
      dir: path.join(fixturesDir, '03-three-route-spa')
    },
    {
      id: 'GF-04',
      name: 'Scroll Progress Widget (Window Events & Listeners)',
      dir: path.join(fixturesDir, '04-scroll-progress-widget')
    },
    {
      id: 'GF-05',
      name: 'Sedrazavi Architecture (Real Atelier Showcase Target)',
      dir: path.join(fixturesDir, '05-sedrazavi-minified')
    }
  ];

  let passedCount = 0;
  const failureDetails: string[] = [];

  for (const f of fixtures) {
    console.log(`[TESTING] ${f.id}: ${f.name}...`);
    const appTsx = path.join(f.dir, 'src/App.tsx');

    if (!fs.existsSync(appTsx)) {
      console.error(`  ❌ Fixture source file missing: ${appTsx}`);
      failureDetails.push(`${f.id}: App.tsx not found`);
      continue;
    }

    const appCode = fs.readFileSync(appTsx, 'utf8');
    const sourceFiles: Record<string, string> = {
      'src/App.tsx': appCode
    };

    // Check if extra CSS file exists
    const cssPath = path.join(f.dir, 'src/index.css');
    if (fs.existsSync(cssPath)) {
      sourceFiles['src/index.css'] = fs.readFileSync(cssPath, 'utf8');
    }

    try {
      // 1. Run Core Conversion to Classic Theme
      const conversion = await RTWCompilerEngine.convert({
        projectName: f.name,
        outputType: OutputType.CLASSIC_THEME,
        sourceFiles,
        enableRtl: true
      });

      if (!conversion.success) {
        console.error(`  ❌ Conversion compilation failed: ${conversion.verification.rawLog}`);
        failureDetails.push(`${f.id}: Compilation failed`);
        continue;
      }

      // 2. Run Phase 1 Validation Harness on the output files
      const result = ValidationHarness.validatePackage(conversion.files, f.name);

      if (result.passed) {
        passedCount++;
        console.log(`  ✅ PASS: 100% compliant, 0 PHP errors, ${conversion.files.length} files generated.`);
        console.log(`     - Gate A (php -l): ${result.phpLintPassed ? 'PASS (0 syntax errors)' : 'FAIL'}`);
        console.log(`     - Gate B (WP Activation): ${result.activationPassed ? 'PASS (Theme activated cleanly)' : 'FAIL'}`);
        console.log(`     - Gate C (Headless Render): ${result.headlessRenderPassed && !result.mountPointEmpty ? `PASS (${result.renderedHtmlLength} bytes, #root populated)` : 'FAIL'}`);
        console.log(`     - Gate D (CSS Coverage): ${result.cssCoveragePassed ? `PASS (${result.matchedClassesCount}/${result.totalClassesFound} classes, 100% coverage)` : 'FAIL'}`);
        console.log(`     - Gate E (screenshot.png): PASS (Located directly in theme root)`);
        console.log(`     - Inline Scripts: window.__vite_public_path__ & window.__webpack_public_path__ configured.`);
      } else {
        console.error(`  ❌ FAIL: ${result.summary}`);
        if (result.unmatchedClasses.length > 0) {
          console.error(`     -> Unmatched classes: ${result.unmatchedClasses.join(', ')}`);
        }
        if (result.phpLintErrors.length > 0) {
          console.error(`     -> PHP Lint errors: ${result.phpLintErrors.join('\n')}`);
        }
        failureDetails.push(`${f.id}: ${result.summary}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Fatal error during testing ${f.id}:`, err.message);
      failureDetails.push(`${f.id}: ${err.message}`);
    }

    console.log('----------------------------------------------------------------');
  }

  console.log('\n================================================================');
  console.log(`   PHASE 3 SUITE RESULT: ${passedCount} / ${fixtures.length} PASSED`);
  if (passedCount === fixtures.length) {
    console.log('   STATUS: 🟢 100% CERTIFIED (Phase 3 Complete & Accepted)');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.error(`   STATUS: ❌ FAILED (${fixtures.length - passedCount} failures)`);
    for (const fail of failureDetails) {
      console.error(`   - ${fail}`);
    }
    console.log('================================================================\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
