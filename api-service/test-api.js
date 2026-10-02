import { RTWCompilerEngine, OutputType } from '../core-engine/src/index.ts';

async function testApiServiceEngineConnection() {
  console.log('Testing api-service connection to RTWCompilerEngine...');

  const sampleReact = `
    import React from 'react';
    export default function App() {
      return (
        <div className="bg-[#0B132B] text-white p-8">
          <h1 className="text-3xl font-bold">API Service Test</h1>
          <p className="text-slate-300">Live test for Phase 6 unfreezing.</p>
        </div>
      );
    }
  `;

  const result = await RTWCompilerEngine.convert({
    projectName: 'API Service Test',
    outputType: OutputType.CLASSIC_THEME,
    sourceFiles: { 'src/App.tsx': sampleReact },
    enableRtl: true
  });

  if (!result.success) {
    console.error('❌ Engine conversion failed:', result.verification.rawLog);
    process.exit(1);
  }

  console.log('✅ PASS: API Service successfully interfaces with RTWCompilerEngine.');
  console.log(`   - Generated ${result.files.length} WordPress files.`);
  console.log('   - Output verified with zero errors.');
}

testApiServiceEngineConnection().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
