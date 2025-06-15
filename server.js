const express = require('express');
const cors = require('cors');
const btch = require('btch-downloader');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

  try {
    console.log(`🔍 Fetching metadata for: ${url}`);
    
    const platform = detectPlatform(url);
    let result;

    switch (platform) {
      case 'instagram':
        result = await btch.instagram(url);
        break;
      case 'tiktok':
        result = await btch.tiktok(url);
        break;
      case 'facebook':
        result = await btch.facebook(url);
        break;
      case 'youtube':
        result = await btch.youtube(url);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Plataforma não suportada'
        });
    }

    if (!result || !result.title) {
      return res.status(400).json({
        success: false,
        error: 'Não foi possível obter metadados deste conteúdo'
      });
    }

    res.json({
      success: true,
      metadata: {
        title: result.title || 'Sem título',
        description: result.desc || '',
        author: result.author || 'Desconhecido',
        thumbnail: result.thumbnail || '',
        duration: 0,
        platform: platform,
        view_count: 0,
        like_count: 0,
        upload_date: '',
        is_live: false,
        availability: 'public'
      }
    });

  } catch (error) {
    console.error('❌ Metadata error:', error.message);
    res.status(500).json({
      success: false,
      error: `Erro ao obter metadados: ${error.message}`
    });
  }
});

app.post('/download', async (req, res) => {
  const { url, quality = 'best', format = 'mp4' } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL é obrigatória'
    });
  }

  try {
    console.log(`⬇️ Downloading from: ${url}`);
    
    const platform = detectPlatform(url);
    let result;

    switch (platform) {
      case 'instagram':
        result = await btch.instagram(url);
        break;
      case 'tiktok':
        result = await btch.tiktok(url);
        break;
      case 'facebook':
        result = await btch.facebook(url);
        break;
      case 'youtube':
        result = await btch.youtube(url);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Plataforma não suportada'
        });
    }

    if (!result) {
      return res.status(400).json({
        success: false,
        error: 'Não foi possível baixar este conteúdo'
      });
    }

    // Determine download URL based on format preference
    let downloadUrl;
    if (format === 'mp3' && result.audio) {
      downloadUrl = result.audio;
    } else if (result.hd_video) {
      downloadUrl = result.hd_video;
    } else if (result.normal_video) {
      downloadUrl = result.normal_video;
    } else if (result.url_list && result.url_list.length > 0) {
      downloadUrl = result.url_list[0];
    } else if (result.video) {
      downloadUrl = result.video;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma URL de download disponível'
      });
    }

    res.json({
      success: true,
      download_url: downloadUrl,
      media_info: {
        title: result.title || 'Conteúdo de Mídia Social',
        description: result.desc || '',
        author: result.author || 'Desconhecido',
        thumbnail: result.thumbnail || '',
        duration: 0,
        platform: platform
      },
      supported_formats: format === 'mp3' ? ['mp3'] : ['mp4'],
      alternatives: {
        hd_video: result.hd_video,
        normal_video: result.normal_video,
        audio: result.audio
      }
    });

  } catch (error) {
    console.error('❌ Download error:', error.message);
    res.status(500).json({
      success: false,
      error: `Erro ao baixar: ${error.message}`
    });
  }
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
  console.log(`🚀 Railway btch-downloader Server running on port ${PORT}`);
  console.log(`🌍 Ready for requests at http://localhost:${PORT}`);
  console.log(`📱 Platforms: Instagram, TikTok, Facebook, YouTube`);
});

module.exports = app;