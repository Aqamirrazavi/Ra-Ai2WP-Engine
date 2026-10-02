import express from 'express';
import cors from 'cors';
import { RTWCompilerEngine, OutputType } from '../core-engine/src/index.ts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RTW Converter API',
    version: '1.2.0',
    phasesCertified: [1, 2, 3, 4, 5],
    timestamp: new Date().toISOString()
  });
});

/**
 * Universal conversion endpoint
 * POST /api/v1/convert
 */
app.post('/api/v1/convert', async (req, res) => {
  try {
    const { projectName, sourceCode, sourceFiles, outputType, enableRtl } = req.body;

    if (!projectName) {
      return res.status(400).json({ error: 'Missing projectName' });
    }

    const filesToConvert = sourceFiles || {
      'src/App.tsx': sourceCode || ''
    };

    if (Object.keys(filesToConvert).length === 0) {
      return res.status(400).json({ error: 'Missing sourceFiles or sourceCode' });
    }

    let mappedOutputType = OutputType.CLASSIC_THEME;
    const typeStr = (outputType || '').toUpperCase();
    if (typeStr === 'BLOCK_THEME' || typeStr === 'FSE') {
      mappedOutputType = OutputType.BLOCK_THEME;
    } else if (typeStr === 'WP_PLUGIN' || typeStr === 'PLUGIN') {
      mappedOutputType = OutputType.WP_PLUGIN;
    } else if (typeStr === 'GUTENBERG_BLOCK' || typeStr === 'BLOCK') {
      mappedOutputType = OutputType.GUTENBERG_BLOCK;
    }

    const result = await RTWCompilerEngine.convert({
      projectName,
      outputType: mappedOutputType,
      sourceFiles: filesToConvert,
      enableRtl: enableRtl !== false
    });

    res.json({
      success: result.success,
      projectName,
      outputType: mappedOutputType,
      files: result.files,
      verification: result.verification,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('API Conversion Error:', err);
    res.status(500).json({
      error: 'Conversion failed',
      message: err.message
    });
  }
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ RTW Converter API microservice running on port ${PORT}`);
  });
}
