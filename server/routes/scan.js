import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { parseReceipt } from '../services/gemini.js';
import Expense from '../models/Expense.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// POST /api/scan/receipt — Upload and parse receipt
router.post('/receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const result = await parseReceipt(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Scan receipt error:', error);
    res.status(500).json({
      message: 'Failed to parse receipt. Please try again or enter manually.',
      error: error.message,
    });
  }
});

// POST /api/scan/confirm — Confirm scanned data and save as expenses
router.post('/confirm', async (req, res) => {
  try {
    const { vendor, date, currency, items, total, category, note } = req.body;

    // If user wants to save as a single expense (total)
    if (total && !items?.length) {
      const expense = new Expense({
        userId: req.userId,
        amount: total,
        currency: currency || 'THB',
        category: category || 'Other',
        description: vendor || 'Scanned receipt',
        note: note || '',
        date: date ? new Date(date) : new Date(),
        source: 'scan',
        receiptData: { vendor, items: [], rawText: '' },
      });
      await expense.save();
      return res.status(201).json({ expenses: [expense] });
    }

    // Save individual items as separate expenses, or as a single one
    if (items?.length) {
      // Save as single expense with the total, but store items in receiptData
      const expense = new Expense({
        userId: req.userId,
        amount: total || items.reduce((sum, item) => sum + item.price, 0),
        currency: currency || 'THB',
        category: category || 'Other',
        description: vendor || 'Scanned receipt',
        note: note || '',
        date: date ? new Date(date) : new Date(),
        source: 'scan',
        receiptData: { vendor, items, rawText: '' },
      });
      await expense.save();
      return res.status(201).json({ expenses: [expense] });
    }

    res.status(400).json({ message: 'No items or total provided' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Confirm scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
