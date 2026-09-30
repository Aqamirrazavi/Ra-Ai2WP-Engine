#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { RTWCompilerEngine, OutputType } from '../../core-engine/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printUsage() {
  console.log(`
⚡ RTW Converter CLI — React to WordPress Universal Transpiler
Version: 1.3.0 (Phases 1, 2 & 3 Certified)

Usage:
  npx rtw-convert <source-file-or-dir-or-git-url-or-zip> [options]

Inputs Supported:
  - Git Repositories:       https://github.com/owner/repo.git, git@github.com:...
  - Compressed Archives:    ./archive.zip, ./archive.tar.gz
  - Directory of React:     ./src, ./my-react-app
  - Single React File:      ./src/App.tsx, ./components/Navbar.jsx

Options:
  -t, --type <type>        classic-theme | block-theme | plugin | block (default: block-theme)
  -n, --name <name>        Theme/Plugin name (default: "RTW Component")
  -b, --branch <branch>    Git branch to clone (optional)
  -o, --out <path>         Output directory path (default: "./build/wordpress")
  -z, --zip <path>         Output installable WordPress ZIP file
  --no-rtl                 Disable RTL styling
  --help, -h               Show this help message

Examples:
  npx rtw-convert https://github.com/vercel/next.js --type block-theme --name "NextWP"
  npx rtw-convert ./react-portfolio --type classic-theme --name "Modern Portfolio" --zip
  npx rtw-convert ./contact-form.zip --type plugin --name "Interactive Contact"
  npx rtw-convert ./src/ProductCard.tsx --type block --name "Product Card"
`);
}

function scanFilesRecursively(dir, baseDir = dir) {
  const result = {};
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist', 'build', '.cache'].includes(entry.name)) {
        continue;
      }
      Object.assign(result, scanFilesRecursively(fullPath, baseDir));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jsx', '.tsx', '.js', '.ts', '.css', '.json', '.html'].includes(ext)) {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        // Prevent path traversal
        if (!relPath.startsWith('..')) {
          result[relPath] = fs.readFileSync(fullPath, 'utf8');
        }
      }
    }
  }
  return result;
}

function mapOutputType(typeStr) {
  switch ((typeStr || '').toLowerCase()) {
    case 'classic-theme':
    case 'classic':
      return OutputType.CLASSIC_THEME;
    case 'plugin':
    case 'wp-plugin':
      return OutputType.WP_PLUGIN;
    case 'block':
    case 'gutenberg-block':
      return OutputType.GUTENBERG_BLOCK;
    case 'block-theme':
    case 'fse':
    default:
      return OutputType.BLOCK_THEME;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const inputSource = args[0];
  let outputTypeStr = 'block-theme';
  let projectName = 'RTW Component';
  let outputDir = './build/wordpress';
  let zipPath = null;
  let branch = null;
  let enableRtl = true;

  for (let i = 1; i < args.length; i++) {
    if ((args[i] === '-t' || args[i] === '--type') && args[i + 1]) {
      outputTypeStr = args[++i];
    } else if ((args[i] === '-n' || args[i] === '--name') && args[i + 1]) {
      projectName = args[++i];
    } else if ((args[i] === '-o' || args[i] === '--out') && args[i + 1]) {
      outputDir = args[++i];
    } else if ((args[i] === '-z' || args[i] === '--zip')) {
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        zipPath = args[++i];
      } else {
        zipPath = true; // flag present
      }
    } else if ((args[i] === '-b' || args[i] === '--branch') && args[i + 1]) {
      branch = args[++i];
    } else if (args[i] === '--no-rtl') {
      enableRtl = false;
    }
  }

  const targetOutputType = mapOutputType(outputTypeStr);

  console.log(`\n======================================================`);
  console.log(`⚡ RTW Converter — React to WordPress Universal Suite`);
  console.log(`======================================================`);
  console.log(`📍 Input Source: ${inputSource}`);
  console.log(`🎯 Output Format: ${targetOutputType}`);
  console.log(`🏷️  Project Name:  ${projectName}`);
  console.log(`------------------------------------------------------`);

  let tempDir = null;
  let sourceFiles = {};

  try {
    // 1. Ingestion: Git URL, Archive, Directory, or Single File
    const isGitUrl = inputSource.startsWith('http://') || inputSource.startsWith('https://') || inputSource.startsWith('git@') || inputSource.endsWith('.git');
    const isArchive = inputSource.endsWith('.zip') || inputSource.endsWith('.tar.gz');

    if (isGitUrl) {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtw_git_'));
      console.log(`\n[STEP 1/3: INGESTION] Cloning Git repository...`);
      const branchArg = branch ? `--branch "${branch}"` : '';
      execSync(`git clone --depth 1 ${branchArg} "${inputSource}" "${tempDir}"`, { stdio: 'inherit' });
      sourceFiles = scanFilesRecursively(tempDir);
    } else if (isArchive && fs.existsSync(inputSource)) {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rtw_archive_'));
      console.log(`\n[STEP 1/3: INGESTION] Unpacking archive...`);
      if (inputSource.endsWith('.zip')) {
        execSync(`unzip -q "${inputSource}" -d "${tempDir}"`);
      } else {
        execSync(`tar -xzf "${inputSource}" -C "${tempDir}"`);
      }
      sourceFiles = scanFilesRecursively(tempDir);
    } else if (fs.existsSync(inputSource)) {
      console.log(`\n[STEP 1/3: INGESTION] Scanning local source path...`);
      const stat = fs.statSync(inputSource);
      if (stat.isDirectory()) {
        sourceFiles = scanFilesRecursively(inputSource);
      } else {
        sourceFiles[path.basename(inputSource)] = fs.readFileSync(inputSource, 'utf8');
      }
    } else {
      console.error(`❌ Error: Source input "${inputSource}" not found or invalid.`);
      process.exit(1);
    }

    const fileCount = Object.keys(sourceFiles).length;
    console.log(`✓ Loaded ${fileCount} source files for processing.`);

    // 2. Compilation & AST Analysis via RTWCompilerEngine
    console.log(`\n[STEP 2/3: AST ANALYSIS & TRANSPILATION] Analyzing components, hooks & state...`);
    const result = await RTWCompilerEngine.convert({
      projectName,
      sourceFiles,
      outputType: targetOutputType,
      enableRtl
    });

    console.log(`  - Stack Detected: ${result.report.stackNameFa} (${result.report.detectedStack})`);
    console.log(`  - Components Identified: ${result.report.components.length}`);
    console.log(`  - React Hooks Mapped:    ${result.report.hooks.length}`);
    console.log(`  - Form Actions Handled:  ${result.report.forms.length}`);

    // 3. Verification & Self-Healing Gates
    console.log(`\n[STEP 3/3: VERIFICATION & SELF-HEALING GATES]`);
    const { verification } = result;

    if (verification.selfHealedIssues.length > 0) {
      console.log(`  🩹 Self-Healing Actions Applied (${verification.selfHealedIssues.length}):`);
      for (const issue of verification.selfHealedIssues) {
        console.log(`     ✓ ${issue}`);
      }
    }

    console.log(`  - Syntax Errors:     ${verification.syntaxErrors.length === 0 ? '✅ 0 PHP Errors' : `❌ ${verification.syntaxErrors.length} Errors`}`);
    console.log(`  - Security & Guard:  ${verification.integrityIssues.length === 0 ? '✅ 100% Function & Class Isolation' : '❌ Issues found'}`);
    console.log(`  - Runtime Sandbox:   ${verification.runtimeSandboxPassed ? '✅ Passed (No WSOD, valid output)' : '❌ Execution failed'}`);

    if (!result.success) {
      console.error(`\n❌ Compilation stopped by Quality Gate:`);
      console.error(`   ${verification.userFriendlyMessageFa}`);
      if (verification.syntaxErrors.length > 0) {
        console.error('Syntax Details:', verification.syntaxErrors);
      }
      process.exit(1);
    }

    // 4. Writing Output Files
    const targetDir = path.resolve(process.cwd(), outputDir);
    fs.mkdirSync(targetDir, { recursive: true });

    for (const file of result.files) {
      const destPath = path.join(targetDir, file.filePath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      if (file.language === 'binary') {
        fs.writeFileSync(destPath, Buffer.from(file.content, 'base64'));
      } else {
        fs.writeFileSync(destPath, file.content, 'utf8');
      }
    }

    console.log(`\n📁 Generated ${result.files.length} production files in: ${targetDir}`);

    // 5. Creating ZIP Archive if requested
    if (zipPath) {
      const finalZipName = typeof zipPath === 'string' ? zipPath : `${result.report.projectSlug || 'wordpress-package'}.zip`;
      const finalZipPath = path.resolve(process.cwd(), finalZipName);

      try {
        execSync(`cd "${targetDir}" && zip -rq "${finalZipPath}" ./*`);
        console.log(`📦 WordPress Installable ZIP ready: ${finalZipPath}`);
      } catch {
        console.log(`ℹ️ To package as zip manually, run: cd "${targetDir}" && zip -r package.zip ./*`);
      }
    }

    console.log(`\n======================================================`);
    console.log(`🎉 100% SUCCESS: ${verification.userFriendlyMessageFa}`);
    console.log(`======================================================\n`);

  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {}
    }
  }
}

main().catch(err => {
  console.error('\n❌ Uncaught Fatal Error:', err.message);
  process.exit(1);
});
