# QuickKart — Backend API

Express.js REST API for the QuickKart e-commerce platform.

## Tech Stack

| | |
|-|-|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Cache / Token Store | Redis (ioredis) |
| Auth | JWT (access + refresh tokens), Google OAuth 2.0 |
| Validation | Zod |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |
| Logging | Winston |
| Cron Jobs | node-cron |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)
- Redis instance — [Redis Cloud](https://redis.io/cloud/) free tier (25 MB) is sufficient
- Google OAuth credentials (optional)

### Install & Run

```bash
npm install
npm run dev
```

Runs on **http://localhost:5000**

### Environment Variables

Create a `.env` file in this directory (copy from `.env.example`):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/quickkart
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Redis — Access Token Blacklist
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=
REDIS_TLS=false
```

### Available Scripts

```bash
npm run dev     # Start with nodemon (auto-restart)
npm run start   # Start without nodemon (production)
npm run lint    # Run ESLint
```

## API Reference

Base URL: `/api/v1`

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (sets cookie + returns tokens) |
| POST | `/auth/logout` | Logout (clears cookie) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/google` | Google OAuth sign-in |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get current user profile |
| PUT | `/user/profile` | Update profile |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (paginated, filterable) |
| GET | `/products/:id` | Get single product |
| POST | `/products` | Create product (admin) |
| PUT | `/products/:id` | Update product (admin) |
| DELETE | `/products/:id` | Delete product (admin) |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category (admin) |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get cart |
| POST | `/cart` | Add item to cart |
| PUT | `/cart/:itemId` | Update item quantity |
| DELETE | `/cart/:itemId` | Remove item from cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get user orders |
| POST | `/orders` | Place order |
| GET | `/orders/:id` | Get order details |
| PUT | `/orders/:id/status` | Update order status (admin) |

### Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet` | Get wallet balance & transactions |
| POST | `/wallet/add` | Add funds |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscriptions` | Get subscription plans |
| POST | `/subscriptions/subscribe` | Subscribe to a plan |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=term` | Search products |

### Support

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/support` | Create support ticket |
| GET | `/support` | Get user's tickets |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |
| GET | `/admin/users` | List all users |
| GET | `/admin/orders` | List all orders |
| GET | `/admin/stats` | Dashboard statistics |

### Health

```
GET /api/health
→ { "status": "ok", "environment": "development", "timestamp": "..." }
```

## Project Structure

```
server/
├── server.js              # App entry point (middleware, routes, startup)
├── scripts/               # Utility scripts (seed, admin creation)
│   ├── seed.js
│   ├── create_specific_admin.js
│   ├── make_admin.js
│   ├── resetAndCreateAdmin.js
│   └── cleanupDb.js
└── src/
    ├── config/
    │   ├── database.js    # MongoDB connection lifecycle
    │   ├── redis.js       # Redis connection lifecycle
    │   └── env.js         # Zod-validated environment variables
    ├── core/
    │   ├── logger/        # Winston logger
    │   ├── middlewares/   # errorHandler, auth guards (+ blacklist check)
    │   └── utils/         # JWT helpers, tokenService, tokenBlacklist, pagination
    ├── cron/
    │   ├── subscriptionCron.js    # Auto-expire subscriptions
    │   └── orderSimulationCron.js # Order status simulation
    ├── models/            # Mongoose schemas
    └── modules/           # Feature modules (routes + controllers + services)
        ├── auth/
        ├── users/
        ├── products/
        ├── categories/
        ├── orders/
        ├── cart/
        ├── wallet/
        ├── subscriptions/
        ├── search/
        ├── support/
        └── admin/
```

## Utility Scripts

Run from within the `server/` directory:

```bash
# Seed the database with sample products/categories
node scripts/seed.js

# Create an admin user
node scripts/create_specific_admin.js

# Reset and create a fresh admin
node scripts/resetAndCreateAdmin.js

# Clean up the database
node scripts/cleanupDb.js
```

## Rate Limiting

| Scope | Limit |
|-------|-------|
| Global | 100 requests / minute per IP |
| Auth endpoints | 15 requests / minute per IP |

## 🔐 Security — Token Blacklisting

QuickKart implements a **two-layer token invalidation** strategy on logout:

### 1. Refresh Token — MongoDB Whitelist

Every issued refresh token is saved in the `RefreshToken` collection. On logout it is **immediately deleted**. Attempting to reuse a revoked refresh token returns `401 — Refresh token has been revoked`.

A MongoDB TTL index auto-cleans expired documents as a safety net:
```js
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 2. Access Token — Redis Blacklist

Access tokens are short-lived (15 min) and stateless by design. On logout the current access token is stored in Redis:

```
Key   : token:<jwt_string>
Value : "invalid"
TTL   : Remaining seconds from the token's own exp claim (dynamic)
```

Every protected request checks the blacklist:
```
POST /auth/logout
  → Delete refresh_token from MongoDB
  → SET token:<access_jwt> "invalid" EX <remaining_seconds> in Redis
  → Clear access_token + refresh_token cookies

GET /api/v1/* (protected)
  → Verify JWT signature  ✓
  → Check Redis blacklist ✓  → 401 "Token has been revoked" if found
```

**Fail-open**: If Redis is temporarily unavailable, the blacklist check is skipped (logged as a warning) — the app stays online. Adjust to fail-closed in `tokenBlacklist.js` if stricter security is required.

### Why Redis and not just MongoDB?

| | MongoDB | Redis |
|---|---|---|  
| Lookup speed | ~5–10 ms | ~0.1–0.5 ms |
| Auto-expiry | TTL index (eventual) | Native `EX` (exact) |
| Memory usage | Higher | ~600 bytes/token |
| Best for | Refresh tokens (7d) | Access tokens (15m) |
