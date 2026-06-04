# QuickKart — Customer Frontend

React 18 storefront for the QuickKart e-commerce platform, built with Vite and TailwindCSS.

## Features

- Browse products by category
- Product search
- Shopping cart
- User authentication (JWT + Google OAuth)
- Order placement and history
- Wallet system
- Subscription plans
- Responsive design

## Tech Stack

| | |
|-|-|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | TailwindCSS |
| HTTP Client | Axios |
| Routing | React Router |
| State | Context API / Zustand |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:5000` (see [`../server`](../server))

### Install & Run

```bash
npm install
npm run dev
```

Runs on **http://localhost:5173**

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Available Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Project Structure

```
client/
├── public/           # Static assets
├── src/
│   ├── assets/       # Images, icons
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route-level page components
│   ├── hooks/        # Custom React hooks
│   ├── context/      # React Context providers
│   ├── services/     # API call functions
│   └── utils/        # Helpers and utilities
├── index.html
└── vite.config.js
```
