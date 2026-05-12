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

## How to Deploy to Vercel

The application is structured to be easily deployed on Vercel as a single project.

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New... > Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section and add the following keys with their respective values:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV` (Set to `production`)
5. Click **Deploy**. Vercel will automatically detect the build settings and use the `vercel.json` configuration for routing API requests to the serverless backend.

---
