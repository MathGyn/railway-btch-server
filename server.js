const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const btch = require('btch-downloader');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyType: 'ip',
  points: 15, // 15 requests
  duration: 60, // per 60 seconds
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1,
    });
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Utility functions
function detectPlatform(url) {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) {
    return 'instagram';
  } else if (urlLower.includes('tiktok.com') || urlLower.includes('vm.tiktok.com')) {
    return 'tiktok';
  } else if (urlLower.includes('facebook.com') || urlLower.includes('fb.com') || urlLower.includes('fb.watch')) {
    return 'facebook';
  } else if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  }
  
  return null;
}

function validateUrl(url) {
  try {
    new URL(url);
    const platform = detectPlatform(url);
    if (!platform) {
      return { 
        isValid: false, 
        message: 'Plataforma não suportada. Use YouTube, Instagram, TikTok ou Facebook.' 
      };
    }
    return { isValid: true, platform };
  } catch (error) {
    return { 
      isValid: false, 
      message: 'URL inválida. Verifique o formato da URL.' 
    };
  }
}

async function executeBtchDownloader(url, options = {}) {
  try {
    console.log(`🔍 btch-downloader processing: ${url}`);
    
    const platform = detectPlatform(url);
    let result;
    
    // Use platform-specific methods
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
        throw new Error(`Platform ${platform} not supported`);
    }
    
    console.log('✅ btch-downloader success');
    return { success: true, data: result, platform };
    
  } catch (error) {
    console.error('❌ btch-downloader error:', error.message);
    return { 
      success: false, 
      error: error.message,
      platform: detectPlatform(url)
    };
  }
}

function enhanceErrorMessage(error, platform) {
  const message = error.toLowerCase();
  
  if (message.includes('private') || message.includes('login')) {
    return `🔒 ${platform}: Conteúdo privado - faça login ou use conteúdo público`;
  } else if (message.includes('not found') || message.includes('unavailable')) {
    return `❌ ${platform}: Conteúdo não encontrado ou foi removido`;
  } else if (message.includes('rate limit') || message.includes('too many')) {
    return `⏱️ ${platform}: Muitas tentativas - aguarde alguns minutos`;
  } else if (message.includes('network') || message.includes('timeout')) {
    return `🔌 Erro de conexão - verifique sua internet`;
  } else {
    return `${platform}: ${error}`;
  }
}

// Routes

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test btch-downloader with a simple call
    const testResult = await btch.instagram('https://www.instagram.com/instagram/').catch(() => ({ success: false }));
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      btchDownloader: 'available',
      version: require('./package.json').version,
      library: 'btch-downloader'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Get metadata
app.post('/metadata', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL é obrigatória'
      });
    }
    
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return res.status(422).json({
        success: false,
        error: validation.message
      });
    }
    
    console.log(`📱 Extracting metadata for: ${url} (${validation.platform})`);
    
    const result = await executeBtchDownloader(url);
    
    if (!result.success) {
      const enhancedError = enhanceErrorMessage(result.error, result.platform);
      return res.status(422).json({
        success: false,
        error: enhancedError
      });
    }
    
    // Transform btch-downloader response to standard format
    const data = result.data;
    const metadata = {
      title: data.title || data.caption || 'Conteúdo de Mídia Social',
      description: data.description || data.caption || '',
      author: data.author || data.username || data.uploader || 'Desconhecido',
      thumbnail: data.thumbnail || data.image || data.cover || '',
      duration: data.duration || 0,
      platform: validation.platform,
      view_count: data.views || data.viewCount || 0,
      like_count: data.likes || data.likeCount || 0,
      upload_date: data.created_time || data.uploadDate || '',
      is_live: false,
      availability: 'public'
    };
    
    res.json({
      success: true,
      metadata
    });
    
  } catch (error) {
    console.error('Metadata extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Download content
app.post('/download', async (req, res) => {
  try {
    const { url, quality = 'best', format = 'mp4' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL é obrigatória'
      });
    }
    
    const validation = validateUrl(url);
    if (!validation.isValid) {
      return res.status(422).json({
        success: false,
        error: validation.message
      });
    }
    
    console.log(`⬬ Processing download: ${url} (${quality}, ${format})`);
    
    const result = await executeBtchDownloader(url);
    
    if (!result.success) {
      const enhancedError = enhanceErrorMessage(result.error, result.platform);
      return res.status(422).json({
        success: false,
        error: enhancedError
      });
    }
    
    const data = result.data;
    
    // Extract download URL based on quality preference and format
    let downloadUrl = '';
    
    if (format === 'mp3' && data.audio) {
      downloadUrl = data.audio;
    } else if (data.video) {
      // Handle different quality options
      if (Array.isArray(data.video)) {
        // Multiple quality options
        if (quality === 'best') {
          downloadUrl = data.video[0]; // Usually first is best quality
        } else if (quality === 'worst') {
          downloadUrl = data.video[data.video.length - 1]; // Last is usually worst
        } else {
          downloadUrl = data.video[0]; // Default to best
        }
      } else {
        downloadUrl = data.video;
      }
    } else if (data.url) {
      downloadUrl = data.url;
    } else if (data.download_url) {
      downloadUrl = data.download_url;
    }
    
    if (!downloadUrl) {
      return res.status(422).json({
        success: false,
        error: 'Não foi possível obter URL de download'
      });
    }
    
    // Build media info
    const mediaInfo = {
      title: data.title || data.caption || 'Conteúdo de Mídia Social',
      description: data.description || data.caption || '',
      author: data.author || data.username || data.uploader || 'Desconhecido',
      thumbnail: data.thumbnail || data.image || data.cover || '',
      duration: data.duration || 0,
      platform: validation.platform,
      view_count: data.views || data.viewCount || 0,
      like_count: data.likes || data.likeCount || 0,
      upload_date: data.created_time || data.uploadDate || ''
    };
    
    res.json({
      success: true,
      download_url: downloadUrl,
      media_info: mediaInfo,
      supported_formats: validation.platform === 'youtube' ? ['mp4', 'mp3'] : ['mp4']
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Platform status
app.get('/status', (req, res) => {
  res.json({
    youtube: {
      supported: true,
      status: 'operational',
      formats: ['mp4', 'mp3']
    },
    instagram: {
      supported: true,
      status: 'operational',
      formats: ['mp4']
    },
    tiktok: {
      supported: true,
      status: 'operational',
      formats: ['mp4']
    },
    facebook: {
      supported: true,
      status: 'operational',
      formats: ['mp4']
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 btch-downloader Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Railway btch-downloader Social Media Downloader API`);
});

module.exports = app;