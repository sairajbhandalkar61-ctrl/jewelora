# 🚀 Jewelora – Complete Cloud Production Deployment Guide

This guide walks you through taking your local **Jewelora** application and deploying it live on the internet using free-tier cloud infrastructure:

```
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│  Vercel (React) │ ────► │  Render (Node)  │ ────► │  Cloud MySQL (Aiven)   │
│  Live Frontend  │       │   Live API      │       │   Live Production DB   │
└─────────────────┘       └─────────────────┘       └────────────────────────┘
```

> [!CRITICAL]
> **IMPORTANT ARCHITECTURAL RULE:**  
> The live production website **MUST NOT** depend on your local personal computer or local XAMPP!  
> - **In Local Development:** React runs on `localhost:5173`, Express runs on `localhost:5000`, and MySQL runs on local XAMPP on your PC.  
> - **In Cloud Production:** React runs on **Vercel**, Express runs on **Render**, and MySQL runs on a **Cloud MySQL Database (e.g. Aiven)**.  
> Once deployed, anyone in the world can access Jewelora even when your computer is turned off.

---

## Pre-Deployment Checklist
- [ ] A GitHub account ([github.com](https://github.com/))
- [ ] A Vercel account ([vercel.com](https://vercel.com/))
- [ ] A Render account ([render.com](https://render.com/))
- [ ] A Cloud MySQL account ([aiven.io](https://aiven.io/) or [railway.app](https://railway.app/))

---

## STEP 1: Create a New GitHub Repository

1. Open your browser and go to [https://github.com/new](https://github.com/new).
2. Set **Repository name** to: `jewelora` (or `jewelora-management-system`).
3. Choose **Public** or **Private** (Public is recommended if you want to showcase the project).
4. **DO NOT** check "Add a README file", "Add .gitignore", or choose a license (we already created production versions for you).
5. Click **Create repository**.
6. Copy your repository URL. It will look like:
   `https://github.com/YOUR_GITHUB_USERNAME/jewelora.git`

---

## STEP 2: Initialize & Push Code to GitHub

Open a terminal or command prompt inside your project root folder (`c:\Users\Admin\Downloads\JW Management System\Jewelora`):

```bash
# 1. Initialize local Git repository (if not already initialized)
git init

# 2. Set the default branch to main
git branch -M main

# 3. Stage all clean project files
git add .

# 4. Commit the production-ready code
git commit -m "feat: initial production-ready release of Jewelora Jewellery Management System"

# 5. Link your local project to your GitHub repository
# >>> REPLACE 'YOUR_GITHUB_REPOSITORY_URL' with your real URL from Step 1 <<<
git remote add origin YOUR_GITHUB_REPOSITORY_URL

# 6. Push to GitHub
git push -u origin main
```

*(If you ever update code later, simply run `git add .`, `git commit -m "update"`, and `git push`.)*

---

## STEP 3: Create a Free Cloud MySQL Database (e.g., Aiven)

You need a managed MySQL database hosted on the cloud. **Aiven** offers a generous free tier for MySQL:

1. Sign up for a free account at [https://aiven.io/](https://aiven.io/).
2. Click **Create Service** → select **MySQL**.
3. Choose the **Free Plan** (or developer tier) and select a cloud region close to you (e.g., Mumbai, Singapore, or Frankfurt).
4. Give it a name like `jewelora-mysql` and click **Create Service**.
5. Wait ~2 minutes until the service status turns **Running**.
6. On the service overview page, locate your connection parameters:
   - **Host** (e.g. `mysql-xxxx-jewelora.aivencloud.com`)
   - **Port** (e.g. `12345`)
   - **User** (usually `avnadmin`)
   - **Password** (click to copy the generated password)
   - **Database Name** (usually `defaultdb`)

---

## STEP 4: Import Database Schema & Seed Data

Now import the complete schema from `database/jewelora.sql` into your new cloud database:

### Option A: Using DBeaver / TablePlus / MySQL Workbench (Recommended)
1. Open DBeaver or MySQL Workbench.
2. Create a new MySQL Connection using the **Host, Port, User, Password, and Database Name** from Step 3.
3. Check **Use SSL** (or select "Require SSL").
4. Test the connection and connect.
5. Open SQL Editor → Open File → select `database/jewelora.sql` from your project.
6. Execute the entire script.

### Option B: Using MySQL CLI
```bash
mysql -h YOUR_CLOUD_HOST -P YOUR_CLOUD_PORT -u YOUR_CLOUD_USER -p YOUR_CLOUD_DBNAME < database/jewelora.sql
```

Verify that 5 tables are created: `jewellery`, `customers`, `suppliers`, `purchases`, and `sales`.

---

## STEP 5: Deploy the Backend API to Render

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and sign in.
2. Click **New +** → select **Web Service**.
3. Select **Build and deploy from a Git repository** → connect your GitHub account and select your `jewelora` repository.
4. Configure the Web Service settings:
   - **Name:** `jewelora-api`
   - **Region:** Choose the region closest to your cloud database.
   - **Branch:** `main`
   - **Root Directory:** Leave blank (or enter `server`)
   - **Runtime:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Instance Type:** `Free`

---

## STEP 6: Configure Render Environment Variables

In the Render Web Service configuration, scroll to **Environment Variables** and add:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production error shielding |
| `PORT` | `5000` | Port Express listens on |
| `DB_HOST` | *Your Cloud DB Host from Step 3* | e.g. `mysql-xx.aivencloud.com` |
| `DB_PORT` | *Your Cloud DB Port from Step 3* | e.g. `12345` |
| `DB_USER` | *Your Cloud DB User from Step 3* | e.g. `avnadmin` |
| `DB_PASSWORD` | *Your Cloud DB Password from Step 3* | Copy from Aiven |
| `DB_NAME` | *Your Cloud DB Name from Step 3* | e.g. `defaultdb` |
| `DB_SSL` | `true` | **Required** for Cloud MySQL SSL handshake |
| `JWT_SECRET` | *Any long random string* | e.g. `jwl_prod_secret_84719283749` |
| `FRONTEND_URL` | *Temporarily leave as `*` or fill after Step 7* | Will update with Vercel link |

5. Click **Create Web Service**.
6. Render will build and deploy your backend.
7. Once deployed, note down your live Render backend URL:
   `https://jewelora-api.onrender.com`
8. Verify it in your browser:  
   Visit `https://jewelora-api.onrender.com/api/health`  
   You should see:
   ```json
   {
     "status": "ok",
     "service": "Jewelora API",
     "database": "connected"
   }
   ```

---

## STEP 7: Deploy the Frontend to Vercel

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard) and sign in.
2. Click **Add New...** → **Project**.
3. Import your `jewelora` GitHub repository.
4. In the **Configure Project** screen:
   - **Project Name:** `jewelora` (or custom name)
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `client`
   - **Build and Output Settings:**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

---

## STEP 8: Configure Vercel Environment Variables

In the Vercel project configuration, expand **Environment Variables** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` |

*(Replace with your real Render backend URL from Step 6, without trailing slash)*

5. Click **Deploy**.
6. Vercel will install dependencies, build the React bundle with Vite, and deploy your site to a global CDN.
7. Copy your live Vercel URL:
   `https://jewelora.vercel.app` (or `https://jewelora-xxxx.vercel.app`)

---

## STEP 9: Update Backend CORS on Render

Now that you have your live frontend URL, lock down CORS for security:

1. Go back to [Render Dashboard](https://dashboard.render.com/) → click on your `jewelora-api` service.
2. Go to **Environment** tab.
3. Update `FRONTEND_URL`:
   - Set value to: `https://YOUR-FRONTEND.vercel.app` (e.g. `https://jewelora.vercel.app`)
4. Click **Save Changes**. Render will automatically restart your server with strict CORS enabled.

---

## STEP 10: Complete System Verification

Open your live Vercel URL in your browser and test each core workflow:

1. **Authentication:**
   - Sign in using `admin` / `admin123` (or click *"Autofill Demo Login"*).
2. **Dashboard:**
   - Check that all 8 KPI cards render real database totals.
   - Verify the Revenue Area Chart displays timelines.
   - Verify that Inventory Alerts list items from your cloud database.
3. **Jewellery Vault:**
   - Switch between Grid and Table views.
   - Click *"Add Jewellery Piece"* → enter gold specs → verify the Live Price Calculator computes 3% GST.
   - Save the item and verify it appears in your cloud database immediately.
   - Click on an item to inspect the Spec Sheet modal.
4. **POS & Billing:**
   - Select items to add to the cart.
   - Select payment method (Cash, UPI, Card, Wire).
   - Click *"Complete Sale & Generate Invoice"*.
   - Confirm that the item stock decrements.
   - View the Commercial Tax Invoice modal and click *"Print Tax Invoice"* to verify standard A4 print rendering.
5. **Customer & Supplier CRM:**
   - Open `/customers` and inspect customer profile drawers.
   - Open `/suppliers` and inspect supplier order volumes.
6. **Reports & Analytics:**
   - Open `/reports` and check Category Mix and Payment Distribution charts.
   - Click *"Export CSV"* to verify report download.
7. **Omnibar:**
   - Press `Ctrl + K` to search across jewellery, patrons, and invoices.
8. **Theme Toggle:**
   - Toggle between Dark and Light mode.

---

## Troubleshooting Common Issues

### Issue 1: "Unable to connect to Jewelora server"
- **Cause:** Render free tier spins down after 15 minutes of inactivity (cold start takes ~40 seconds to wake up).
- **Fix:** Open `https://YOUR-BACKEND.onrender.com/api/health` directly in your browser. Wait for it to respond with `"status": "ok"`, then refresh your frontend.

### Issue 2: CORS Error in Browser Console
- **Cause:** `FRONTEND_URL` on Render does not match your exact Vercel URL (e.g. trailing slash or wrong subdomain).
- **Fix:** Ensure `FRONTEND_URL` on Render exactly matches `https://your-app.vercel.app` without a trailing `/`.

### Issue 3: 404 Error when refreshing page on Vercel
- **Cause:** Single Page App routing not rewriting to `index.html`.
- **Fix:** We have included `client/vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` which resolves this automatically.

### Issue 4: Database SSL Error (`HANDSHAKE_SSL_ERROR` or `SSL connection required`)
- **Cause:** Cloud MySQL instances (Aiven, TiDB, Railway) require encrypted connections.
- **Fix:** Ensure `DB_SSL=true` is set in your Render environment variables.
