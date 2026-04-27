# 🛒 QuickKart - Full-Stack E-commerce & Subscription Platform

**QuickKart** is a high-performance, feature-rich MERN stack application designed for modern e-commerce. It uniquely combines traditional product purchasing with a powerful **Subscription-as-a-Service (SaaS)** model, allowing users to schedule recurring deliveries (Daily, Weekly, Monthly) with automated wallet-based payments.

---

## 🌟 Key Features

### 📅 Enterprise Subscription System
- **Recurring Deliveries**: Subscribe to products with flexible frequencies (Daily, Weekly, Monthly).
- **Automated Order Generation**: Integrated Cron jobs process active subscriptions every morning at 9:00 AM to generate automated orders.
- **Subscription Management**: Pause, Cancel, or Update frequency and delivery address for active subscriptions.
- **Dynamic Pricing**: Automatic 15% discount applied to all subscription-based items.

### 💳 Integrated Wallet & Payments
- **Prepaid Wallet**: Users can add funds to their virtual wallet for seamless, one-tap payments.
- **Transactional Integrity**: Detailed logging of all wallet transactions (Credits/Debits).
- **Insufficient Balance Alerts**: Smart checks ensure subscriptions only process if the wallet has sufficient funds.

### 🔐 Advanced Authentication
- **Multi-Factor Auth Support**: Traditional Email/Password login combined with **Google OAuth/One-Tap** integration.
- **Secure Sessions**: JWT tokens stored in `httpOnly` cookies to prevent XSS attacks.

### 🛠️ Comprehensive Admin Dashboard
- **Inventory Management**: Full control over products, categories, and stock variants.
- **Order Lifecyle Control**: Manage orders from `Pending` and `Confirmed` to `Out for Delivery` and `Delivered`.
- **Customer Support Tickets**: A built-in support module for admins to resolve user queries and return requests.
- **User Insights**: Manage and view all registered users and their transaction history.

### 🎨 Premium User Experience
- **Modern Responsive Design**: Built with Tailwind CSS 4 and Framer Motion for smooth, high-end transitions.
- **State Persistence**: Efficient state management using Redux Toolkit to ensure a fluid, single-page experience.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Redux Toolkit, Tailwind CSS 4, Framer Motion, Radix UI, Lucide React |
| **Backend** | Node.js, Express.js, node-cron |
| **Database** | MongoDB, Mongoose ODM |
| **Security** | JSON Web Tokens (JWT), Bcrypt.js, Google OAuth 2.0 |
| **Utilities** | Axios, Cookie-Parser, Dotenv |

---

## 📂 Project Structure

```text
QuickKart/
├── client/           # Customer Frontend (React + Vite)
│   ├── src/store/    # Redux Slices (Auth, Product, Cart)
│   └── src/pages/    # Product, Checkout, Subscription Pages
├── admin/            # Administrative Dashboard (React + Vite)
│   ├── src/pages/    # Order, Category, and User Management
│   └── src/components/ # Reusable Admin UI Components
├── server/           # Express.js Backend API
│   ├── models/       # Mongoose Schemas (Subscription, Order, User, etc.)
│   ├── routes/       # API Endpoints (Auth, Wallet, Subscriptions, Search)
│   └── cron/         # Scheduled Tasks for Subscription Processing
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Ajajeet93/QuickKart.git
   cd QuickKart
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   # Create a .env file (VITE_API_URL, etc.)
   npm run dev
   ```

4. **Setup Admin**
   ```bash
   cd ../admin
   npm install
   npm run dev
   ```

---

## 📝 API Endpoints (Brief)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth` | POST | Login/Register/Google Login |
| `/api/subscriptions` | POST/GET | Create/Manage Recurring Deliveries |
| `/api/wallet` | POST/GET | Add Funds / Check Balance |
| `/api/products` | GET | Fetch Product Catalog with Filters |
| `/api/admin` | GET/PATCH | Admin-only Order and Inventory Management |

---

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## 📄 License
This project is licensed under the ISC License.

---
*Created with ❤️ by [Ajajeet93](https://github.com/Ajajeet93)*
