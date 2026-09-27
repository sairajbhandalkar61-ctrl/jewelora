# 💎 Jewelora – Jewellery Management System

> **Intelligent Jewellery Business Command Center & Commercial Showroom ERP**  
> An enterprise-grade, luxury-aesthetic web application designed for fine jewellery houses, diamond merchants, bullion traders, and retail showrooms.

---

## 1. Project Overview

**Jewelora** is a full-stack jewellery business management platform engineered to streamline showroom operations, certified vault inventory tracking, bullion procurement, point-of-sale (POS) billing with automated GST computation, commercial tax invoicing, and customer/vendor relationship management.

Unlike generic retail software, Jewelora is tailor-made for the jewellery trade:
- Calculates real-time prices based on live metal weights, daily gold/silver bullion rates, making charges, and stone charges.
- Generates official Indian GST compliant Tax Invoices (3% IGST or 1.5% CGST + 1.5% SGST) with HSN codes, purity stamps, and A4 print layout.
- Provides an executive dashboard with 8 KPI indicators, revenue vs. procurement cashflow charts, and smart reorder stock alerts.

---

## 2. Features

- **Executive Command Center:**
  - 8 real-time KPI metric cards (Total Pieces, Active Customers, Suppliers, Vault Stock, Today's Sales, Outflow, Safety Stock Warnings, Vault Valuation).
  - SVG Area Chart for cashflow dynamics across *Today, 7D, 30D, 3M, 1Y*.
  - Best-selling jewellery leaderboard by revenue and volume.
  - Showroom activity feed tracking sales and inward procurement.
- **Jewellery Vault & Inventory:**
  - Grid Card View and Tabular Dense List view with category filter chips (Rings, Necklaces, Earrings, Bangles, Chains, Pendants, Bracelets).
  - **Live Bullion Pricing Calculator:** Enter gross weight, metal rate/g, craftsmanship making charges, and stone charges to auto-calculate subtotal, 3% GST, and retail price.
  - Detailed piece specification sheet modal with hallmark verification badge and chronological audit logs.
- **POS & Commercial Billing:**
  - Visual catalogue with real-time stock depletion guards (prevents adding more than vault balance).
  - Fast Cart drawer with inline patron lookup and *Quick Add Customer*.
  - Multi-method settlement: Cash, UPI / QR, Credit/Debit Card, Bank Wire.
  - Automated sequential tax invoice generation (`INV-2026-XXXX`).
- **Commercial Tax Invoice & Printing:**
  - Full GST tax invoice layout with showroom GSTIN, customer details, HSN codes, itemized weights, tax breakdown, and authorized signatory blocks.
  - Dedicated `@media print` A4 stylesheet for clean counter printing.
- **Customer CRM & Supplier Ledger:**
  - Customer directory with lifetime purchase totals, AOV (Average Order Value), and transaction history drawer.
  - Bullion supplier directory with purchase volumes and order logs.
- **Procurement & Inward Stock Reconciler:**
  - Record supplier purchase invoices that automatically increment vault quantities and update cost valuation.
- **Business Intelligence & Financial Reports:**
  - Gross turnover, bullion procurement outflow, operating margin, and inventory asset valuation.
  - Category sales mix and payment settlement distribution donut charts.
  - One-click CSV spreadsheet export for accounting audits.
- **Global Showroom Omnibar (`Ctrl + K`):**
  - Instant keyboard-navigable search across vault items, customers, suppliers, and past invoices.
- **Theme & Luxury Design System:**
  - Obsidian & Warm Charcoal surfaces with polished Royal Gold accents.
  - Full Dark Mode and Light Mode support with smooth CSS custom properties.

---

## 3. Screenshots

*(Screenshots can be stored in the `/screenshots` directory)*

| Command Center Dashboard | Jewellery Vault & Live Calculator |
|:---:|:---:|
| ![Dashboard](screenshots/dashboard.png) | ![Jewellery](screenshots/jewellery.png) |

| POS Billing & Cart Drawer | Commercial GST Tax Invoice |
|:---:|:---:|
| ![POS Billing](screenshots/pos.png) | ![Tax Invoice](screenshots/invoice.png) |

---

## 4. Tech Stack

- **Frontend:**
  - React 19 (Hooks, Context API, Dynamic Theming)
  - Vite 7 (Ultra-fast build tooling and asset pipeline)
  - React Router DOM 7 (Declarative client-side routing)
  - Lucide React (Luxury vector iconography)
  - Pure SVG Visualization (Hardware-accelerated charts with zero heavy dependencies)
- **Backend:**
  - Node.js & Express 5 (RESTful API architecture)
  - CORS middleware (Strict origin authorization)
  - Dotenv (Environment variable isolation)
- **Database:**
  - MySQL 8.0+ / MariaDB 10.4+
  - Connection Pool (`mysql2/promise`) with SSL cloud support
- **Deployment Targets:**
  - Frontend: **Vercel**
  - Backend: **Render**
  - Database: **Aiven / Railway / TiDB Cloud / PlanetScale**

---

## 5. System Architecture

```
┌────────────────────────────────────────────────────────┐
│              Client Browser (Vercel)                   │
│   React 19 + Vite 7 SPA (Port 5173 / Production URL)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / JSON REST API
                            ▼
┌────────────────────────────────────────────────────────┐
│               Backend Server (Render)                  │
│       Node.js + Express 5 (Port 5000 / Production)     │
│   • Health Check (/api/health)                         │
│   • CORS Origin Verification                           │
│   • Transactional Stock Increment / Decrement          │
└───────────────────────────┬────────────────────────────┘
                            │ mysql2 Connection Pool (SSL)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Cloud MySQL Database (Aiven)               │
│       jewelora_db (InnoDB, utf8mb4, Normalized)        │
│   • jewellery  • sales  • purchases                    │
│   • customers  • suppliers                             │
└────────────────────────────────────────────────────────┘
```

---

## 6. Project Structure

```
Jewelora/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable luxury components
│   │   │   ├── billing/        # POS Catalogue, Cart Drawer, Tax Invoice Modal
│   │   │   ├── common/         # Buttons, Modals, Badges, Charts, Skeletons
│   │   │   ├── customers/      # Customer Form & 360 Profile Drawer
│   │   │   ├── dashboard/      # KPI Cards, Area Chart, Alerts, Top Sellers
│   │   │   ├── jewellery/      # Cards, Dense Table, Live Calc Modal
│   │   │   └── suppliers/      # Supplier Form & Procurement Profile
│   │   ├── context/            # ThemeContext & ToastContext
│   │   ├── layouts/            # App Shell, Sidebar, Topbar Omnibar
│   │   ├── pages/              # Route views (Dashboard, Vault, POS, Reports)
│   │   ├── styles/             # Modular luxury CSS system
│   │   ├── utils/              # Currency (INR), Gold Calculations, CSV export
│   │   ├── api.js              # Centralized API client (Environment-aware)
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Client environment template
│   ├── package.json            # Client dependencies
│   ├── vercel.json             # Vercel SPA routing rules
│   └── vite.config.js          # Vite bundler configuration
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # Cloud-ready MySQL pool (SSL supported)
│   ├── routes/                 # REST endpoints
│   │   ├── customers.js        # /api/customers
│   │   ├── dashboard.js        # /api/dashboard
│   │   ├── jewellery.js        # /api/jewellery
│   │   ├── purchases.js        # /api/purchases
│   │   ├── reports.js          # /api/reports
│   │   ├── sales.js            # /api/sales
│   │   └── suppliers.js        # /api/suppliers
│   ├── .env.example            # Server environment template
│   ├── package.json            # Server dependencies
│   └── server.js               # Express entrypoint & health check
│
├── database/
│   └── jewelora.sql            # Master DDL & Certified seed data
│
├── .env.example                # Root environment template
├── .gitignore                  # Git exclusions (secrets, builds, dependencies)
├── DEPLOYMENT.md               # Step-by-step production cloud deployment guide
├── package.json                # Root orchestration scripts
├── render.yaml                 # Render Blueprint deployment definition
└── vercel.json                 # Root Vercel deployment configuration
```

---

## 7. Environment Variables

### Root / Server (`server/.env`)
| Variable | Description | Local Value | Production Example |
|---|---|---|---|
| `PORT` | Backend listening port | `5000` | `5000` |
| `NODE_ENV` | Runtime environment | `development` | `production` |
| `FRONTEND_URL` | Allowed CORS frontend origin | `http://localhost:5173` | `https://jewelora.vercel.app` |
| `DB_HOST` | MySQL hostname | `localhost` | `mysql-xx.aivencloud.com` |
| `DB_PORT` | MySQL port | `3306` (or `3307`) | `12345` |
| `DB_USER` | MySQL username | `root` | `avnadmin` |
| `DB_PASSWORD` | MySQL password | *empty* | `your_secret_db_password` |
| `DB_NAME` | Database name | `jewelora_db` | `defaultdb` |
| `DB_SSL` | Enable SSL for Cloud MySQL | `false` | `true` |
| `JWT_SECRET` | Secret key for auth tokens | *random string* | `strong_random_secret_hash` |

### Client (`client/.env`)
| Variable | Description | Local Value | Production Example |
|---|---|---|---|
| `VITE_API_URL` | Base URL of Express backend | `http://localhost:5000` | `https://jewelora-api.onrender.com` |

---

## 8. Database Setup

### Local Development (XAMPP / MySQL)
1. Open XAMPP Control Panel and start MySQL (default port 3306 or configured port).
2. Open terminal or phpMyAdmin and import `database/jewelora.sql`:
   ```bash
   mysql -u root -p < database/jewelora.sql
   ```

### Cloud Production Database (Aiven / TiDB / Railway)
1. Create a free MySQL database instance on [Aiven](https://aiven.io/) or [Railway](https://railway.app/).
2. Import `database/jewelora.sql` using any MySQL GUI (DBeaver, MySQL Workbench, TablePlus) or via CLI:
   ```bash
   mysql -h YOUR_CLOUD_HOST -P YOUR_PORT -u YOUR_USER -p YOUR_DB_NAME < database/jewelora.sql
   ```
3. Set `DB_SSL=true` in backend environment variables.

---

## 9. Running Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- MySQL / MariaDB (Local XAMPP or Cloud)

### Installation
```bash
# Clone the repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd Jewelora

# Install all dependencies (server + client)
npm run install-all
```

### Running Both Servers
```bash
# Run both Backend (:5000) and Frontend (:5173) concurrently
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

- Open **[http://localhost:5173](http://localhost:5173)** in your browser.
- Health Check: **[http://localhost:5000/api/health](http://localhost:5000/api/health)**

---

## 10. Demo Authentication Credentials

The application includes an automated one-click demo login button on the sign-in screen:

- **Username:** `admin`
- **Password:** `admin123`

---

## 11. API Reference

All endpoints return standardized JSON responses.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Public service & database health check |
| `GET` | `/api/dashboard` | 8 KPIs, revenue timeline, alerts, top sellers |
| `GET` | `/api/jewellery` | Vault inventory catalog with search & filters |
| `GET` | `/api/jewellery/:id` | Single item spec sheet with movement log |
| `POST` | `/api/jewellery` | Create new certified jewellery piece |
| `PUT` | `/api/jewellery/:id` | Update physical specs & pricing |
| `DELETE` | `/api/jewellery/:id` | Remove piece from vault |
| `GET` | `/api/sales` | All sales invoices with customer & item details |
| `POST` | `/api/sales` | Record POS checkout (auto-decrements stock) |
| `GET` | `/api/purchases` | All procurement purchase records |
| `POST` | `/api/purchases` | Record inward supplier restock (auto-increments stock) |
| `GET` | `/api/customers` | Verified patron CRM directory |
| `GET` | `/api/suppliers` | Bullion vendor partner directory |
| `GET` | `/api/reports/analytics` | Executive turnover, category mix, valuation |

---

## 12. Production Deployment

For complete, detailed instructions on deploying the frontend to **Vercel**, backend to **Render**, and database to a **Cloud MySQL** provider, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 13. Security Best Practices

- **Zero Credentials in Git:** All secrets are externalized via environment variables.
- **SQL Injection Defense:** All queries utilize parameterized statements (`pool.query("SELECT ... WHERE id = ?", [id])`).
- **CORS Restricted:** Backend only accepts requests from configured `FRONTEND_URL`.
- **Sanitized Errors:** Internal database error traces and directory paths are shielded from client responses in production.

---

## 14. License

Distributed under the MIT License. See `LICENSE` for more information.
