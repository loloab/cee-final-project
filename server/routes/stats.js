import express from 'express';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';
import { convert } from '../services/currency.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

/**
 * Helper: Convert expense amounts to target currency
 */
async function convertAmount(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount;
  try {
    return await convert(amount, fromCurrency, toCurrency);
  } catch {
    return amount; // Fallback: return original if conversion fails
  }
}

// GET /api/stats/summary — Quick summary (today, this week, this month)
router.get('/summary', async (req, res) => {
  try {
    const { currency = 'THB' } = req.query;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startOfMonth },
    });

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;

    for (const exp of expenses) {
      const converted = await convertAmount(exp.amount, exp.currency, currency);
      const expDate = new Date(exp.date);

      thisMonth += converted;
      if (expDate >= startOfWeek) thisWeek += converted;
      if (expDate >= startOfDay) today += converted;
    }

    res.json({
      today: Math.round(today * 100) / 100,
      thisWeek: Math.round(thisWeek * 100) / 100,
      thisMonth: Math.round(thisMonth * 100) / 100,
      currency,
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stats/daily — Daily spending for past N weeks
router.get('/daily', async (req, res) => {
  try {
    const { weeks = 1, currency = 'THB' } = req.query;

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - parseInt(weeks) * 7);
    startDate.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    // Group by day
    const dailyMap = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Initialize all days
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = {
        date: key,
        day: dayNames[d.getDay()],
        total: 0,
      };
    }

    // Sum expenses
    for (const exp of expenses) {
      const key = new Date(exp.date).toISOString().split('T')[0];
      if (dailyMap[key]) {
        const converted = await convertAmount(exp.amount, exp.currency, currency);
        dailyMap[key].total += converted;
      }
    }

    const daily = Object.values(dailyMap).map((d) => ({
      ...d,
      total: Math.round(d.total * 100) / 100,
    }));

    res.json({ daily, currency });
  } catch (error) {
    console.error('Daily stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stats/monthly — Monthly totals for a given year
router.get('/monthly', async (req, res) => {
  try {
    const { year = new Date().getFullYear(), currency = 'THB' } = req.query;

    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year) + 1, 0, 1);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate },
    });

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthly = monthNames.map((name, i) => ({
      month: name,
      monthIndex: i,
      total: 0,
    }));

    for (const exp of expenses) {
      const monthIdx = new Date(exp.date).getMonth();
      const converted = await convertAmount(exp.amount, exp.currency, currency);
      monthly[monthIdx].total += converted;
    }

    // Round totals
    monthly.forEach((m) => {
      m.total = Math.round(m.total * 100) / 100;
    });

    res.json({ monthly, year: parseInt(year), currency });
  } catch (error) {
    console.error('Monthly stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stats/yearly — Yearly totals
router.get('/yearly', async (req, res) => {
  try {
    const { currency = 'THB' } = req.query;

    const expenses = await Expense.find({ userId: req.userId });

    const yearlyMap = {};
    for (const exp of expenses) {
      const year = new Date(exp.date).getFullYear();
      if (!yearlyMap[year]) yearlyMap[year] = { year, total: 0 };
      const converted = await convertAmount(exp.amount, exp.currency, currency);
      yearlyMap[year].total += converted;
    }

    const yearly = Object.values(yearlyMap)
      .sort((a, b) => b.year - a.year)
      .map((y) => ({ ...y, total: Math.round(y.total * 100) / 100 }));

    res.json({ yearly, currency });
  } catch (error) {
    console.error('Yearly stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/stats/categories — Spending breakdown by category
router.get('/categories', async (req, res) => {
  try {
    const { period = 'month', currency = 'THB' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate },
    });

    const categoryMap = {};
    let grandTotal = 0;

    for (const exp of expenses) {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { category: exp.category, total: 0, count: 0 };
      }
      const converted = await convertAmount(exp.amount, exp.currency, currency);
      categoryMap[exp.category].total += converted;
      categoryMap[exp.category].count += 1;
      grandTotal += converted;
    }

    const categories = Object.values(categoryMap)
      .map((c) => ({
        ...c,
        total: Math.round(c.total * 100) / 100,
        percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    res.json({ categories, grandTotal: Math.round(grandTotal * 100) / 100, period, currency });
  } catch (error) {
    console.error('Categories stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
