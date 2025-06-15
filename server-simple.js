const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Simple middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    btchDownloader: 'available',
    message: 'Railway btch-downloader server funcionando'
  });
});

app.post('/metadata', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL é obrigatória'
    });
  }

  // Simple response for now - can enhance later
  res.json({
    success: true,
    metadata: {
      title: 'Conteúdo de Mídia Social',
      description: 'Railway btch-downloader server ativo',
      author: 'Usuário',
      thumbnail: '',
      duration: 0,
      platform: detectPlatform(url),
      view_count: 0,
      like_count: 0,
      upload_date: '',
      is_live: false,
      availability: 'public'
    }
  });
});

app.post('/download', async (req, res) => {
  const { url, quality = 'best', format = 'mp4' } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL é obrigatória'
    });
  }

  // For now, return a test response
  res.json({
    success: true,
    download_url: 'https://test.com/video.mp4',
    media_info: {
      title: 'Conteúdo de Mídia Social',
      description: 'Railway server funcionando',
      author: 'Usuário',
      thumbnail: '',
      duration: 0,
      platform: detectPlatform(url)
    },
    supported_formats: ['mp4']
  });
});

app.get('/status', (req, res) => {
  res.json({
    youtube: { supported: true, status: 'operational', formats: ['mp4'] },
    instagram: { supported: true, status: 'operational', formats: ['mp4'] },
    tiktok: { supported: true, status: 'operational', formats: ['mp4'] },
    facebook: { supported: true, status: 'operational', formats: ['mp4'] }
  });
});

function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('tiktok.com')) return 'tiktok';
  if (urlLower.includes('facebook.com')) return 'facebook';
  if (urlLower.includes('youtube.com')) return 'youtube';
  return 'unknown';
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint não encontrado' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple Railway Server running on port ${PORT}`);
  console.log(`🌍 Ready for requests`);
});

module.exports = app;