# QuickKart — Admin Dashboard

React 18 admin panel for managing the QuickKart e-commerce platform, built with Vite and TailwindCSS.

## Features

- Product management (create, edit, delete)
- Category management
- Order management and status updates
- User management
- Support ticket handling
- Sales analytics and reporting
- Subscription plan management

## Tech Stack

| | |
|-|-|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | TailwindCSS |
| HTTP Client | Axios |
| Routing | React Router |

## Getting Started

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:5000` (see [`../server`](../server))
- Admin account in the database (use `server/scripts/create_specific_admin.js`)

### Install & Run

```bash
npm install
npm run dev
```

Runs on **http://localhost:5174**

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000
```

### Available Scripts

```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Creating an Admin Account

Use the seed scripts in the server directory:

```bash
cd ../server
node scripts/create_specific_admin.js
# or
node scripts/resetAndCreateAdmin.js
```

## Project Structure

```
admin/
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
