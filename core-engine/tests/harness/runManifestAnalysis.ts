import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ManifestAnalyzer } from '../../src/parser/manifestAnalyzer.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('\n======================================================');
  console.log('   🚀 RTW CONVERTER — PHASE 2 MANIFEST ANALYZER       ');
  console.log('   Extracting Structured JSON Manifest for Fixture 5  ');
  console.log('   (Sedrazavi Architecture Portfolio Target)          ');
  console.log('======================================================\n');

  const fixture5Dir = path.resolve(__dirname, '../fixtures/05-sedrazavi-minified');
  const appTsxPath = path.join(fixture5Dir, 'src/App.tsx');

  if (!fs.existsSync(appTsxPath)) {
    console.error(`❌ Fixture 5 App.tsx not found at: ${appTsxPath}`);
    process.exit(1);
  }

  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  const fileMap: Record<string, string> = {
    'src/App.tsx': appContent
  };

  const manifest = ManifestAnalyzer.analyzeProject('Sedrazavi Architecture', fileMap);

  // Assertions required by Phase 2 Acceptance Criteria
  if (manifest.apiEndpoints.length === 0) {
    console.error('❌ Phase 2 Gate Failed: No fetch() API endpoints extracted!');
    process.exit(1);
  }

  const targetFetch = manifest.apiEndpoints.find(e => e.rawUrl === '/wp-json/sedrazavi/v1/projects');
  if (!targetFetch) {
    console.error('❌ Phase 2 Gate Failed: /wp-json/sedrazavi/v1/projects was not extracted!');
    process.exit(1);
  }

  if (manifest.designTokens.arbitraryHexFound.length === 0) {
    console.error('❌ Phase 2 Gate Failed: Arbitrary Hex tokens were not extracted!');
    process.exit(1);
  }

  if (manifest.contentSections.length === 0) {
    console.error('❌ Phase 2 Gate Failed: Verbatim content sections were not extracted!');
    process.exit(1);
  }

  // Save the manifest JSON next to Fixture 5
  const manifestOutPath = path.join(fixture5Dir, 'manifest.json');
  const manifestJsonString = JSON.stringify(manifest, null, 2);
  fs.writeFileSync(manifestOutPath, manifestJsonString, 'utf8');

  console.log('✅ Structured Manifest JSON extracted and verified successfully.');
  console.log(`📁 File written to: ${manifestOutPath}`);
  console.log(`🔑 SHA-256 Manifest Hash: ${manifest.manifestHash}\n`);
  console.log('--- MANIFEST SUMMARY ---');
  console.log(`- Project Name:    ${manifest.projectName} (${manifest.projectSlug})`);
  console.log(`- Routes Found:    ${manifest.routes.length} (${manifest.routes.map(r => r.path).join(', ')})`);
  console.log(`- Content Sections: ${manifest.contentSections.length}`);
  console.log(`- Design Tokens:   ${manifest.designTokens.arbitraryHexFound.length} arbitrary colors (${manifest.designTokens.arbitraryHexFound.join(', ')})`);
  console.log(`- API Calls Mapped: ${manifest.apiEndpoints.length}`);
  for (const ep of manifest.apiEndpoints) {
    console.log(`  -> [${ep.method}] ${ep.rawUrl} (Namespace: ${ep.namespace}, Endpoint: ${ep.endpoint}) in ${ep.callerComponent}`);
  }
  console.log('------------------------\n');

  console.log('--- MANIFEST JSON PREVIEW ---');
  console.log(manifestJsonString);
  console.log('--- END PREVIEW ---\n');

  console.log('======================================================');
  console.log('   PHASE 2 ACCEPTANCE GATE: PASS (100% Certified)     ');
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('Fatal error during manifest extraction:', err);
  process.exit(1);
});
