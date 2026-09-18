const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'RTW Converter API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Universal conversion endpoint
 * POST /api/v1/convert
 */
app.post('/api/v1/convert', async (req, res) => {
  const { projectName, sourceCode, outputType, enableRtl } = req.body;

  if (!projectName || !sourceCode) {
    return res.status(400).json({ error: 'Missing projectName or sourceCode' });
  }

  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Return standard response structure
  res.json({
    success: true,
    projectName,
    outputType: outputType || 'BLOCK_THEME',
    files: [
      {
        fileName: 'theme.json',
        filePath: 'theme.json',
        content: JSON.stringify({
          "$schema": "https://schemas.wp.org/trunk/theme.json",
          "version": 3,
          "settings": { "appearanceTools": true }
        }, null, 2)
      },
      {
        fileName: 'style.css',
        filePath: 'style.css',
        content: `/* Theme Name: ${projectName}\nAuthor: RTW Cloud API\nVersion: 1.0.0 */`
      }
    ],
    timestamp: Date.now()
  });
});

app.listen(PORT, () => {
  console.log(`⚡ RTW Converter API microservice running on port ${PORT}`);
});
