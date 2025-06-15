# Railway btch-downloader Server

Express.js server with btch-downloader for social media downloading, optimized for Railway deployment.

## ✨ Features

- 🚀 **btch-downloader integration** - Reliable social media content extraction
- 🔒 **Security** - Rate limiting, CORS, helmet  
- 📱 **Multi-platform** - Instagram, TikTok, Facebook, YouTube
- ⚡ **Fast** - Optimized Alpine Docker image
- 🛡️ **Production ready** - Error handling, logging, health checks
- 🎯 **Anti-bot resilient** - btch-downloader handles platform protections

## 🎯 Why btch-downloader over yt-dlp?

- ✅ **Better bot detection bypass** - Works with cloud servers
- ✅ **Proxy management** - Built-in proxy rotation  
- ✅ **Platform-specific optimizations** - Each platform handled uniquely
- ✅ **Less maintenance** - Updates automatically handle platform changes

## 📡 API Endpoints

### `GET /health`
Service health check
```json
{
  "success": true,
  "status": "healthy",
  "btchDownloader": "available"
}
```

### `POST /metadata`
Extract content metadata
```json
{
  "url": "https://www.instagram.com/p/XXXXXXXXX/"
}
```

### `POST /download`
Get download URL with quality options
```json
{
  "url": "https://www.instagram.com/p/XXXXXXXXX/",
  "quality": "best",
  "format": "mp4"
}
```

### `GET /status`
Platform availability status

## 🚀 Railway Deployment

1. **Create Railway Project**
2. **Connect Repository** 
3. **Deploy** - Railway detects Dockerfile automatically
4. **Configure Frontend** with Railway URL

## 🔧 Environment Variables

```bash
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:8081
PORT=3001  # Railway sets this automatically
```

## 📊 Supported Platforms

- ✅ **Instagram** - Posts, Stories, Reels
- ✅ **TikTok** - Videos, no watermark options
- ✅ **Facebook** - Public videos and posts  
- ✅ **YouTube** - Videos with quality options

## 🛡️ Security Features

- Rate limiting (15 requests/minute per IP)
- CORS protection
- Helmet security headers
- Input validation
- Error handling with enhanced messages

## 📈 Performance

- **Alpine Linux** - Small, fast Docker image
- **btch-downloader** - Optimized for social media platforms
- **Connection pooling** - Efficient request handling
- **Error recovery** - Robust platform-specific error handling

## 🔄 Integration

Works seamlessly with SocialTools frontend:
- **Primary backend** when Railway is available
- **Automatic failover** to Supabase if needed
- **Real-time status** monitoring
- **Quality selection** support