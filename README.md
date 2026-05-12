# Billy — Expense Tracker

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `client/src/pages/` | 7 pages: Landing, Login, Register, Dashboard, AddExpense, ScanReceipt, History |
| `client/src/components/` | 7 reusable components: Navbar, StatsCard, ExpenseCard, CategoryBadge, CurrencySelector, LoadingSpinner, ProtectedRoute |
| `client/src/context/` | AuthContext for JWT session management |
| `client/src/utils/` | API client (Axios), categories, currencies |
| `server/routes/` | 4 route files: auth, expenses, scan, stats |
| `server/models/` | User + Expense Mongoose models |
| `server/services/` | Gemini + Currency API integrations |
| `server/middleware/` | JWT auth + Multer upload |
| `api/index.js` | Vercel serverless entry point |

---

## How to Run Locally

After you've cloned this project:

### 1. Create `.env` file

```bash
cp .env.example server/.env
```

Edit `server/.env` with your values:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=pick-any-secret-string
GEMINI_API_KEY=your-key-from-aistudio.google.com
PORT=5000
```

### 2. Start the backend

```bash
cd server
npm run dev
```

### 3. Start the frontend (in another terminal)

```bash
cd client
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173**

---

## How to Deploy to Vercel

1. Push the project to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel's dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
4. Deploy — Vercel auto-detects the config from `vercel.json`

---
