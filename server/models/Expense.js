import mongoose from 'mongoose';

const CATEGORIES = [
  'Food & Drinks',
  'Transportation',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
];

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  currency: {
    type: String,
    required: true,
    default: 'THB',
    uppercase: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: CATEGORIES,
      message: '{VALUE} is not a valid category',
    },
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
  },
  source: {
    type: String,
    enum: ['manual', 'scan'],
    default: 'manual',
  },
  receiptData: {
    vendor: String,
    items: [
      {
        name: String,
        price: Number,
      },
    ],
    rawText: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient user+date queries
expenseSchema.index({ userId: 1, date: -1 });

export { CATEGORIES };
const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
