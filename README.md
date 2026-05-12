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

## How to Set Up and Run Locally

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

If you haven't already, clone the project and navigate into it:

```bash
git clone <your-repo-url>
cd final-project
```

### 2. Set Up the Backend Environment

The backend requires a few environment variables to connect to MongoDB and the Gemini API.

```bash
cp .env.example server/.env
```

Open `server/.env` and fill in your details:
```env
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/billy?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-jwt-secret
GEMINI_API_KEY=your-key-from-aistudio.google.com
PORT=5000
```

### 3. Install Dependencies and Start the Backend

Open a terminal window, navigate to the `server` directory, install dependencies, and start the development server.

```bash
cd server
npm install
npm run dev
```

The server should now be running on `http://localhost:5000`.

### 4. Install Dependencies and Start the Frontend

Open a **new** terminal window, navigate to the `client` directory, install dependencies, and start the Vite development server.

```bash
cd client
npm install
npm run dev
```

### 5. Open the Application

Visit **[http://localhost:5173](http://localhost:5173)** in your browser to start using Billy!

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