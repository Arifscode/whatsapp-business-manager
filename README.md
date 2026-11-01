# WhatsApp Business Manager

A mobile-first web app for managing a small ladies accessories business (purses, handbags, bridal items, jewelry) with WhatsApp as the primary customer channel.

## Features

- 📦 Product management with photo, pricing, and variant support
- 📱 WhatsApp message generator (copy-paste to forward to customers)
- 🛒 Order collection via public form + manual entry
- 🚚 Batch dispatch with automatic shipping cost splitting
- 📦 Packaging material inventory with per-unit cost tracking
- 💰 Financial dashboard — revenue, costs, profit, margin %
- 📲 Mobile-first PWA (installable on phone)

## Project Structure

```
/
├── client/          # React + Vite + Tailwind CSS frontend
├── server/          # Node.js + Express + Prisma + SQLite backend
├── package.json     # Root scripts (runs both together)
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies

```bash
npm run install:all
```

### Environment Variables

Copy the example env files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

See each `.env.example` for documentation of required variables.

### Database Setup

```bash
cd server
npx prisma migrate dev --name init
npm run seed
```

### Run Development Servers

```bash
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001
- Customer Order Form: http://localhost:5173/order

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite database path (e.g. `file:./dev.db`) |
| `JWT_SECRET` | Secret key for JWT tokens (use a long random string) |
| `OPERATOR_PASSWORD_HASH` | bcrypt hash of the operator login password |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `PORT` | Server port (default: 3001) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:5173`) |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g. `http://localhost:3001`) |
| `VITE_ORDER_FORM_URL` | Public order form URL shown in WhatsApp messages |

## Authentication

The operator app is password-protected. The customer order form (`/order`) is public.

**Default dev password:** `admin` (only works when `OPERATOR_PASSWORD_HASH` is not set)

**Set a real password for production:**
```bash
cd server
node scripts/generate-hash.js YourChosenPassword
# Copy the hash output → set as OPERATOR_PASSWORD_HASH env var
```

## Deployment

### Backend — Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo, select the `server` folder as root
3. Add a **Volume** mounted at `/app/prisma` for SQLite persistence
4. Set these environment variables in Railway:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `file:/app/prisma/prod.db` |
| `JWT_SECRET` | a long random string (e.g. generate with `openssl rand -hex 32`) |
| `OPERATOR_PASSWORD_HASH` | output of `node scripts/generate-hash.js yourpassword` |
| `CLIENT_URL` | your Vercel frontend URL (set after deploying frontend) |
| `CLOUDINARY_CLOUD_NAME` | from cloudinary.com free account |
| `CLOUDINARY_API_KEY` | from cloudinary.com |
| `CLOUDINARY_API_SECRET` | from cloudinary.com |
| `PORT` | `3001` (Railway sets this automatically) |

5. After deploy, run the DB migration once via Railway shell:
   ```bash
   npx prisma migrate deploy --schema prisma/schema.prisma
   node prisma/seed.js
   ```

### Frontend — Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `client`
3. Set these environment variables in Vercel:

| Variable | Value |
|---|---|
| `VITE_API_URL` | your Railway backend URL (e.g. `https://your-app.railway.app`) |
| `VITE_ORDER_FORM_URL` | your Vercel URL + `/order` (e.g. `https://your-app.vercel.app/order`) |

4. Deploy — Vercel auto-deploys on every push to `main`

## Version History

| Version | Description |
|---|---|
| v0.1 | Project scaffold & database schema |
| v0.2 | Product management |
| v0.3 | WhatsApp message generator |
| v0.4 | Customer order form |
| v0.5 | Order management dashboard |
| v0.6 | Packaging material inventory |
| v0.7 | Batch dispatch & shipping cost split |
| v0.8 | Profit & financials dashboard |
| v0.9 | Mobile polish & PWA |
| v1.0 | Authentication & deployment |
