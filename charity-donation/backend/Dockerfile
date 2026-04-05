# ============================================
# HopeFund Backend - Production Dockerfile
# ============================================

# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# --- Stage 2: Production image ---
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 hopefund
    
# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove unnecessary files
RUN rm -f .env .env.* migrate_notifications.js

# Switch to non-root user
USER hopefund

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
