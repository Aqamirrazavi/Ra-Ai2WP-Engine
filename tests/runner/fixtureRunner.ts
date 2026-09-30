import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RTWCompilerEngine } from '../../core-engine/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FixtureTestSpec {
  id: string;
  name: string;
  folderName: string;
  requiredChecks: string[];
}

const FIXTURES: FixtureTestSpec[] = [
  {
    id: 'GF-01',
    name: 'Modern Portfolio (Vite + React + Tailwind)',
    folderName: 'gf-01-portfolio',
    requiredChecks: ['Zero CDN calls', 'Bundled style.css', 'Screenshot present', 'Zero syntax errors']
  },
  {
    id: 'GF-02',
    name: 'Interactive Contact Form (React + State + AJAX)',
    folderName: 'gf-02-contact-form',
    requiredChecks: ['AJAX handler generated', 'Nonce verified', 'function_exists on handler', 'Zero syntax errors']
  },
  {
    id: 'GF-03',
    name: 'Multi-Page Documentation / Blog (React Router)',
    folderName: 'gf-03-multipage-blog',
    requiredChecks: ['Hierarchy page.php & single.php', 'wp_nav_menu present', 'Zero syntax errors']
  },
  {
    id: 'GF-04',
    name: 'Product Catalog with Fetch (useEffect + Dynamic Cards)',
    folderName: 'gf-04-product-catalog',
    requiredChecks: ['Loop rendering in index.php', 'Dynamic classes bundled', 'Zero syntax errors']
  },
  {
    id: 'GF-05',
    name: 'Dashboard with Complex Filter (React State & Live Search)',
    folderName: 'gf-05-filter-dashboard',
    requiredChecks: ['Search form markup', 'theme-interactions.js present', 'Zero syntax errors']
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

export async function runGoldenFixturesSuite(): Promise<{ allPassed: boolean; summary: string }> {
  console.log('\n======================================================');
  console.log('   🚀 RTW CONVERTER — GOLDEN FIXTURES QUALITY GATE     ');
  console.log('   Phase 1 Non-Negotiable Verification Test Suite     ');
  console.log('======================================================\n');

  let passedCount = 0;
  const failureLogs: string[] = [];

  for (const fixture of FIXTURES) {
    const fixtureDir = path.join(__dirname, '../golden-fixtures', fixture.folderName);
    console.log(`[TESTING] ${fixture.id}: ${fixture.name}...`);

    const files = loadFilesRecursively(fixtureDir);
    if (Object.keys(files).length === 0) {
      console.log(`  ❌ FAIL: Fixture files not found in ${fixtureDir}`);
      failureLogs.push(`${fixture.id}: Fixture files missing`);
      continue;
    }

    try {
      const result = await RTWCompilerEngine.convert({
        projectName: fixture.name,
        sourceFiles: files,
        enableRtl: true
      });

      const { verification, report } = result;

      // Assertions
      const hasSyntaxErrors = verification.syntaxErrors.length > 0;
      const hasIntegrityIssues = verification.integrityIssues.length > 0;
      const missingScreenshot = verification.missingScreenshot;
      const unwrappedFunctions = verification.unwrappedFunctions.length > 0;
      const cdnFound = verification.cdnDependenciesFound.length > 0;
      const sandboxFailed = !verification.runtimeSandboxPassed;

      const isPass =
        result.success &&
        !hasSyntaxErrors &&
        !hasIntegrityIssues &&
        !missingScreenshot &&
        !unwrappedFunctions &&
        !cdnFound &&
        !sandboxFailed &&
        result.files.length >= 9;

      if (isPass) {
        console.log(`  ✅ PASS: 100% compliant, 0 PHP errors, ${result.files.length} files generated, sandbox verified.`);
        passedCount++;
      } else {
        console.log(`  ❌ FAIL:`);
        if (hasSyntaxErrors) {
          console.log(`     - Syntax Errors:`, verification.syntaxErrors);
        }
        if (hasIntegrityIssues) {
          console.log(`     - Integrity Issues:`, verification.integrityIssues);
        }
        if (missingScreenshot) {
          console.log(`     - Missing Screenshot!`);
        }
        if (unwrappedFunctions) {
          console.log(`     - Unwrapped Functions:`, verification.unwrappedFunctions);
        }
        if (cdnFound) {
          console.log(`     - External CDN Dependencies:`, verification.cdnDependenciesFound);
        }
        if (sandboxFailed) {
          console.log(`     - Runtime Sandbox Failed! Log:`, verification.rawLog);
        }
        failureLogs.push(`${fixture.id}: ${verification.userFriendlyMessageFa}`);
      }
    } catch (err: any) {
      console.log(`  ❌ EXCEPTION:`, err.message);
      failureLogs.push(`${fixture.id} crashed: ${err.message}`);
    }
    console.log('------------------------------------------------------');
  }

  const allPassed = passedCount === FIXTURES.length;
  console.log(`\n======================================================`);
  console.log(`   SUITE RESULT: ${passedCount} / ${FIXTURES.length} PASSED`);
  console.log(`   STATUS: ${allPassed ? '🟢 100% CERTIFIED (Phase 1 Ready)' : '🔴 FAILED (Phase 1 Blocked)'}`);
  console.log(`======================================================\n`);

  return {
    allPassed,
    summary: `${passedCount}/${FIXTURES.length} Golden Fixtures Passed.`
  };
}

runGoldenFixturesSuite().then(res => {
  if (!res.allPassed) {
    process.exit(1);
  }
});
