# ─────────────────────────────────────────────────────────────────────────────
# QuickKart Client Dockerfile — Multi-Stage Build
# INT377 DevOps Project — Phase 2: Docker
#
# Design:
#   Stage 1 (builder): Full Node.js environment to compile React → dist/
#   Stage 2 (runner):  Nginx Alpine only — no Node.js runtime in final image
#   Final image size: ~25MB (vs ~400MB if Node.js was included)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDeps for build)
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy source and build the Vite React application
COPY . .

# VITE_API_URL is injected at build time via Docker Compose build args
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

# VITE_GOOGLE_CLIENT_ID is injected at build time
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config (handles SPA routing)
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy only the built files from Stage 1 — no Node.js in this image
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx listens on 80
EXPOSE 80

# Health check via nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
