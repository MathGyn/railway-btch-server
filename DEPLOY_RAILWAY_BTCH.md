# 🚂 Deploy Railway btch-downloader Server

## 🎯 **Por que btch-downloader no Railway?**

✅ **Melhor para Social Media**:
- Funciona com IPs de servidor cloud (não é bloqueado)
- Proxy management nativo
- Otimizado para Instagram, TikTok, Facebook
- Menos detecção de bot que yt-dlp puro

✅ **Vantagens do Railway**:
- Seu próprio servidor controlado
- $5/mês previsível
- Logs e monitoring
- Auto-scaling

## 🚀 **Deploy Steps**

### **Método 1: GitHub (Recomendado)**

1. **Criar repositório GitHub**:
   ```
   Nome: railway-btch-server
   Público: ✅
   ```

2. **Push código**:
   ```bash
   # No diretório railway-btch-server
   git remote add origin https://github.com/SEU_USUARIO/railway-btch-server.git
   git push -u origin main
   ```

3. **Deploy no Railway**:
   - Acesse [railway.app](https://railway.app)
   - "New Project" → "Deploy from GitHub repo"
   - Selecione `railway-btch-server`
   - Railway detecta Dockerfile automaticamente
   - Deploy em ~2-3 minutos

### **Método 2: Railway CLI**

```bash
# Instalar CLI (se não tiver)
npm install -g @railway/cli

# Login
railway login

# Deploy
cd railway-btch-server
railway init
railway up
```

## ⚙️ **Configuração Pós-Deploy**

### 1. **Obter URL Railway**
Após deploy: `https://railway-btch-server-production-xxxx.up.railway.app`

### 2. **Configurar Frontend**
```bash
# No diretório principal socialtools
echo "VITE_RAILWAY_API_URL=https://SUA-URL-RAILWAY.railway.app" > .env
```

### 3. **Reiniciar Frontend**
```bash
npm run dev
```

## 🧪 **Testes de Funcionamento**

### 1. **Health Check**
```bash
curl https://SUA-URL.railway.app/health

# Esperado:
# {
#   "success": true,
#   "status": "healthy", 
#   "btchDownloader": "available"
# }
```

### 2. **Test Instagram**
```bash
curl -X POST https://SUA-URL.railway.app/metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.instagram.com/p/XXXXXXXXX/"}'
```

### 3. **Test YouTube**
```bash
curl -X POST https://SUA-URL.railway.app/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "quality": "best", "format": "mp4"}'
```

## 🎯 **Frontend Integration**

Após deploy bem-sucedido:

- 🟢 **Frontend detecta Railway** automaticamente
- 🟢 **Badge mostra "🚂 Railway"** 
- 🟢 **Downloads funcionam** para todas as plataformas
- 🟡 **Fallback para Supabase** se Railway offline

## 📊 **Vantagens vs yt-dlp**

| Aspecto | btch-downloader | yt-dlp |
|---------|----------------|--------|
| **Bot Detection** | ✅ Resistente | ❌ Bloqueado |
| **Cloud Servers** | ✅ Funciona | ❌ Detectado |
| **Instagram** | ✅ Funcional | ❌ Bloqueado |
| **TikTok** | ✅ Funcional | ❌ IP blocked |
| **YouTube** | ✅ Funcional | ❌ Bot detected |
| **Manutenção** | ✅ Baixa | ❌ Alta |

## 🛡️ **Recursos de Segurança**

- ✅ Rate limiting (15 req/min)
- ✅ CORS configurado
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Error handling aprimorado
- ✅ User-agent rotation (via btch-downloader)

## 📈 **Performance**

- **Alpine Docker**: Imagem leve e rápida
- **btch-downloader**: Otimizado para social media
- **Connection pooling**: Handling eficiente
- **Error recovery**: Robust platform handling

## 💰 **Custos**

- **Railway Starter**: $5/mês
- **Muito mais barato** que APIs premium ($50+/mês)
- **Sem limites** de requests (apenas rate limiting próprio)
- **Escalável** conforme necessário

## 🆘 **Troubleshooting**

### **Build falhou?**
- Verifique se todos os arquivos estão no repo
- Logs no Railway Dashboard mostram erro específico

### **btch-downloader não funciona?**
- Aguarde npm install completar (~1-2 min)
- Teste health endpoint primeiro

### **CORS errors?**
- Configure `ALLOWED_ORIGINS` no Railway
- Inclua domínio do frontend

### **Downloads lentos?**
- Normal para primeira execução
- btch-downloader faz cache interno

## ✅ **Checklist Final**

- [ ] Deploy Railway concluído
- [ ] Health check retorna success
- [ ] URL configurada no .env
- [ ] Frontend reiniciado
- [ ] Badge mostra "🚂 Railway"  
- [ ] Teste download Instagram
- [ ] Teste download YouTube
- [ ] Confirma fallback Supabase funciona

## 🎉 **Resultado Esperado**

**Downloads funcionando para:**
- ✅ **Instagram**: Posts, Reels, Stories
- ✅ **TikTok**: Vídeos sem watermark
- ✅ **YouTube**: Qualidade HD + áudio
- ✅ **Facebook**: Posts públicos

**Interface mostra:**
- 🟢 **"🚂 Railway"** badge quando ativo
- 🟡 **"⚡ Supabase"** badge como fallback
- 📊 **Status real** de cada plataforma

---

**🚀 PRONTO!** 

Social Media Downloader funcionando 100% com btch-downloader no Railway!