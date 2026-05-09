import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES } from '../utils/categories';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './History.css';

export default function History() {
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const loadExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (categoryFilter) params.set('category', categoryFilter);
      if (sourceFilter) params.set('source', sourceFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await api.get(`/expenses?${params}`);
      setExpenses(res.data.expenses);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Load expenses error:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, sourceFilter, startDate, endDate]);

  useEffect(() => {
    loadExpenses(1);
  }, [loadExpenses]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      loadExpenses(pagination.page);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleEdit = (expense) => {
    setEditing(expense);
    setEditForm({
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      description: expense.description,
      note: expense.note || '',
      date: new Date(expense.date).toISOString().split('T')[0],
    });
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await api.put(`/expenses/${editing._id}`, editForm);
      setEditing(null);
      loadExpenses(pagination.page);
    } catch (err) {
      console.error('Edit error:', err);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="page-content container">
      <div className="history-wrapper animate-fade-in">
        <div className="page-title">
          <h1>📋 Expense History</h1>
          <p className="text-secondary">{pagination.total} total expenses</p>
        </div>

        {/* Filters */}
        <div className="filters-bar card">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="input-field filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Source</label>
            <select
              className="input-field filter-select"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="manual">✏️ Manual</option>
              <option value="scan">📷 Scanned</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">From</label>
            <input
              type="date"
              className="input-field filter-select"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">To</label>
            <input
              type="date"
              className="input-field filter-select"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Expense List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <LoadingSpinner size={40} />
          </div>
        ) : expenses.length > 0 ? (
          <>
            <div className="expenses-list">
              {expenses.map((exp) => (
                <ExpenseCard
                  key={exp._id}
                  expense={exp}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page <= 1}
                  onClick={() => loadExpenses(pagination.page - 1)}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => loadExpenses(pagination.page + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state card">
            <span className="empty-icon">🔍</span>
            <p className="empty-title">No expenses found</p>
            <p className="empty-desc">
              {categoryFilter || sourceFilter || startDate || endDate
                ? 'Try adjusting your filters'
                : 'Start adding expenses to see them here!'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal card animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Expense</h2>

            <div className="modal-form">
              <div className="input-group">
                <label>Description</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Amount</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                    step="0.01"
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Category</label>
                <select
                  className="input-field"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Note</label>
                <textarea
                  className="input-field"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleEditSave}
                  disabled={editLoading}
                >
                  {editLoading ? <LoadingSpinner size={18} color="#fff" /> : '💾 Save Changes'}
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
