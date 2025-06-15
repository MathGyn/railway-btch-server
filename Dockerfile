# Use Node.js 18 with Debian (more compatible than Alpine)
FROM node:18

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install Node.js dependencies with verbose output
RUN npm install --production --verbose || (echo "npm install failed" && exit 1)

# Clean npm cache
RUN npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port (Railway uses PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# Start the application
CMD ["node", "server.js"]