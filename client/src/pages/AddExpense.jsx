import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES } from '../utils/categories';
import CurrencySelector from '../components/CurrencySelector';
import LoadingSpinner from '../components/LoadingSpinner';
import './AddExpense.css';

// Returns today's date in local time as YYYY-MM-DD
function localToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// YYYY-MM-DD → DD/MM/YYYY
function toDisplay(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// DD/MM/YYYY → YYYY-MM-DD (returns null if invalid)
function toISO(display) {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export default function AddExpense() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'THB');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toDisplay(localToday()));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!amount || !category || !description) {
      setError('Please fill in all required fields');
      return;
    }

    const isoDate = toISO(date);
    if (!isoDate) {
      setError('Please enter a valid date in DD/MM/YYYY format');
      return;
    }

    setLoading(true);

    try {
      await api.post('/expenses', {
        amount: parseFloat(amount),
        currency,
        category,
        description,
        note,
        date: isoDate,
        source: 'manual',
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-content container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="success-card card animate-bounce text-center">
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h2 style={{ marginTop: '12px' }}>Expense Added!</h2>
          <p className="text-secondary">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content container">
      <div className="add-expense-wrapper animate-slide-up">
        <div className="page-title">
          <h1>➕ Add Expense</h1>
          <p className="text-secondary">Manually log an expense</p>
        </div>

        <div className="card add-expense-form-card">
          {error && <div className="error-message mb-md">{error}</div>}

          <form onSubmit={handleSubmit} className="add-form">
            {/* Amount + Currency Row */}
            <div className="form-row">
              <div className="input-group" style={{ flex: 2 }}>
                <label htmlFor="expense-amount">Amount *</label>
                <input
                  id="expense-amount"
                  type="number"
                  className="input-field amount-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Currency</label>
                <CurrencySelector value={currency} onChange={setCurrency} className="currency-dropdown" />
              </div>
            </div>

            {/* Category Picker */}
            <div className="input-group">
              <label>Category *</label>
              <div className="category-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-chip ${category === cat.name ? 'selected' : ''}`}
                    style={{
                      '--chip-color': cat.color,
                      borderColor: category === cat.name ? cat.color : undefined,
                      backgroundColor: category === cat.name ? `${cat.color}15` : undefined,
                    }}
                    onClick={() => setCategory(cat.name)}
                  >
                    <span className="chip-emoji">{cat.emoji}</span>
                    <span className="chip-label">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="input-group">
              <label htmlFor="expense-desc">Description *</label>
              <input
                id="expense-desc"
                type="text"
                className="input-field"
                placeholder="e.g. Lunch at MK Restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Note */}
            <div className="input-group">
              <label htmlFor="expense-note">Note (optional)</label>
              <textarea
                id="expense-note"
                className="input-field"
                placeholder="Any additional details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>

            {/* Date */}
            <div className="input-group">
              <label htmlFor="expense-date">Date (DD/MM/YYYY)</label>
              <input
                id="expense-date"
                type="text"
                className="input-field"
                placeholder="DD/MM/YYYY"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                maxLength={10}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg mt-md"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size={20} color="#fff" /> : '💾 Save Expense'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
