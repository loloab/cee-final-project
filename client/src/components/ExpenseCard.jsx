import { getCategoryByName } from '../utils/categories';
import { formatAmount } from '../utils/currencies';
import './ExpenseCard.css';

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const category = getCategoryByName(expense.category);
  const dateStr = new Date(expense.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="expense-card animate-fade-in">
      <div className="expense-left">
        <div
          className="expense-emoji"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.emoji}
        </div>
        <div className="expense-info">
          <div className="expense-description">{expense.description}</div>
          <div className="expense-meta">
            <span
              className="expense-category-badge"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.name}
            </span>
            {expense.source === 'scan' && (
              <span className="expense-scan-badge">📷 Scanned</span>
            )}
            <span className="expense-date">{dateStr}</span>
          </div>
          {expense.note && <div className="expense-note">📝 {expense.note}</div>}
        </div>
      </div>
      <div className="expense-right">
        <div className="expense-amount">
          {formatAmount(expense.amount, expense.currency)}
        </div>
        <div className="expense-actions">
          {onEdit && (
            <button className="action-btn edit-btn" onClick={() => onEdit(expense)} title="Edit">
              ✏️
            </button>
          )}
          {onDelete && (
            <button className="action-btn delete-btn" onClick={() => onDelete(expense._id)} title="Delete">
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
