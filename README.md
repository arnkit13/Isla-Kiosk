# Isla Kiosk

A complete point-of-sale (POS) and ordering kiosk system with a React (Vite) frontend, supporting both a built-in serverless API for Vercel and a standalone Java Spring Boot REST backend.

## Project Structure

- **`frontend/`**: React application built with Vite, Lucide icons, SheetJS (`xlsx`), and Canvas Confetti for an interactive ordering experience, customer display, and owner dashboard.
- **`backend/`**: Java Spring Boot 4 REST API for managing orders, order status, and sales metrics with JSON persistence.
- **`api/`**: High-performance Vercel Serverless Functions providing the complete `/api` suite out of the box when deployed on Vercel.

---

## Deploying to Vercel

This repository is pre-configured for **zero-config deployment** on Vercel.

### Option 1: Import via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com/) and click **Add New...** > **Project**.
2. Select and import your GitHub repository: `arnkit13/Isla-Kiosk`.
3. Keep default settings:
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build` (configured automatically via root `vercel.json`)
   - **Output Directory**: `frontend/dist`
4. Click **Deploy**.

> **Note**: Out of the box, the deployment utilizes the built-in Vercel Serverless API in `api/` with pre-loaded demo orders and full POS & Analytics functionality!

### Option 2: Connecting an External Spring Boot Backend

If you host your Spring Boot `backend/` on a service like [Render](https://render.com), [Railway](https://railway.app), or [Fly.io](https://fly.io):

1. In your Vercel Project Dashboard, navigate to **Settings** > **Environment Variables**.
2. Add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-host.com/api`
3. Trigger a redeploy. The frontend will automatically route all requests to your Java Spring Boot backend.

---

## Local Development

### Prerequisites

- **Node.js**: v18 or later
- **Java**: JDK 17 or later (only if running the Spring Boot backend locally)

### Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

### Running Backend Locally (Optional)

```bash
cd backend
./mvnw spring-boot:run
```

The backend server runs on `http://localhost:8080`.
