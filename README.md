# QuickKart — Full Stack E-Commerce Platform

A feature-rich MERN stack e-commerce platform with customer storefront, admin dashboard, and a REST API backend.

## 📁 Project Structure

```
project_fullstack/
├── client/                    # React customer frontend (Vite + TailwindCSS)
│   └── src/
│
├── admin/                     # React admin dashboard (Vite + TailwindCSS)
│   └── src/
│
├── server/                    # Express.js REST API
│   ├── server.js              # Application entry point
│   └── src/
│       ├── modules/           # Feature modules
│       │   ├── auth/          # JWT + Google OAuth 2.0
│       │   ├── users/
│       │   ├── products/
│       │   ├── categories/
│       │   ├── orders/
│       │   ├── cart/
│       │   ├── wallet/
│       │   ├── subscriptions/
│       │   ├── search/
│       │   ├── support/
│       │   └── admin/
│       ├── models/            # Mongoose schemas
│       ├── config/            # DB, env, OAuth config
│       └── core/              # Middleware, utilities, logger
│
├── .env.example               # Required environment variables template
└── package.json               # Root workspace scripts
```

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Cache / Token Store | Redis (ioredis) |
| Auth | JWT (access + refresh tokens), Google OAuth 2.0 |
| Logging | Winston |
| Security | Helmet, express-rate-limit, express-mongo-sanitize |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Redis instance — [Redis Cloud](https://redis.io/cloud/) free tier (25 MB) is sufficient
- Google OAuth credentials (optional, for Google sign-in)

### 1. Clone & Install

```bash
git clone https://github.com/Ajajeet93/QuickKart.git
cd QuickKart
```

Install dependencies for each app:

```bash
cd server && npm install
cd ../client && npm install
cd ../admin && npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
# Edit .env and fill in your values
```

Key variables (see `server/.env.example` for the full list):

```env
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Redis — Access Token Blacklist (see server/README.md for details)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=
REDIS_TLS=false
```

### 3. Run Locally

Open three terminals:

```bash
# Terminal 1 — Backend API
cd server && npm run dev
# Runs on http://localhost:5000

# Terminal 2 — Customer Frontend
cd client && npm run dev
# Runs on http://localhost:5173

# Terminal 3 — Admin Dashboard
cd admin && npm run dev
# Runs on http://localhost:5174
```

### Health Check

```
GET http://localhost:5000/api/health
```

## 🔌 API Overview

All endpoints are prefixed with `/api/v1/`.

| Route | Description |
|-------|-------------|
| `POST /auth/register` | Register new user |
| `POST /auth/login` | Login (returns JWT) |
| `POST /auth/google` | Google OAuth sign-in |
| `GET /products` | List products |
| `GET /products/:id` | Product details |
| `GET /categories` | List categories |
| `GET /cart` | Get user cart |
| `POST /cart` | Add to cart |
| `GET /orders` | User order history |
| `POST /orders` | Place order |
| `GET /wallet` | Wallet balance |
| `GET /search` | Search products |
| `GET /api/health` | Server health check |

## 🔐 Environment Variables Reference

See [`.env.example`](.env.example) for the full list of required variables.

## 📜 Scripts

From the root `package.json`:

```bash
npm run lint        # Run ESLint across all apps
npm run audit       # Run npm audit across all apps
```

From within each app directory:

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run lint        # Lint source files
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
