# ─────────────────────────────────────────────────────────────────────────────
# QuickKart Server Dockerfile
# INT377 DevOps Project — Phase 2: Docker
#
# Design decisions:
#   - node:20-alpine keeps image ~80MB vs ~900MB for full node image
#   - npm ci --only=production excludes devDependencies (nodemon etc.)
#   - Non-root user 'node' for least-privilege security
#   - HEALTHCHECK enables Docker & Kubernetes probes to detect crashes
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
# Copy package files before source code so Docker caches this layer
COPY package.json package-lock.json ./

# ci = clean install, exact versions from lock file, no devDependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY . .

# Run as non-root user (security best practice)
# The 'node' user is built into the node:alpine image
USER node

# Expose the application port
EXPOSE 5000

# Health check — Docker daemon will restart container if this fails 3 times
# Requires /api/health to return HTTP 200 within 10 seconds
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
