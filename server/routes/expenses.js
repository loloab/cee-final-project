import express from 'express';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/expenses — Create expense
router.post('/', async (req, res) => {
  try {
    const { amount, currency, category, description, note, date, source, receiptData } = req.body;

    const expense = new Expense({
      userId: req.userId,
      amount,
      currency: currency || 'THB',
      category,
      description,
      note: note || '',
      date: date || new Date(),
      source: source || 'manual',
      receiptData: receiptData || undefined,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/expenses — List expenses with filtering & pagination
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category, source, limit = 20, page = 1 } = req.query;

    const query = { userId: req.userId };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Category filter
    if (category) query.category = category;

    // Source filter
    if (source) query.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Expense.countDocuments(query),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('List expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/expenses/:id — Get single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/expenses/:id — Update expense
router.put('/:id', async (req, res) => {
  try {
    const { amount, currency, category, description, note, date } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { amount, currency, category, description, note, date },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/expenses/:id — Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
