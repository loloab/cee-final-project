import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatAmount } from '../utils/currencies';
import { getCategoryByName, CATEGORIES } from '../utils/categories';
import StatsCard from '../components/StatsCard';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const currency = user?.preferredCurrency || 'THB';

  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [currency]);

  const loadDashboard = async () => {
    try {
      const [summaryRes, dailyRes, catRes, expRes] = await Promise.all([
        api.get(`/stats/summary?currency=${currency}`),
        api.get(`/stats/daily?weeks=1&currency=${currency}`),
        api.get(`/stats/categories?period=month&currency=${currency}`),
        api.get('/expenses?limit=5'),
      ]);

      setSummary(summaryRes.data);
      setDaily(dailyRes.data.daily);
      setCategoryData(catRes.data.categories);
      setRecentExpenses(expRes.data.expenses);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/expenses/${deleteConfirm}`);
      loadDashboard();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="page-content container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{formatAmount(payload[0].value, currency)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-content container">
      {/* Greeting */}
      <div className="dashboard-header animate-fade-in">
        <div>
          <h1>Hey, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-secondary">Here's your spending overview</p>
        </div>
        <div className="quick-actions">
          <Link to="/add" className="btn btn-primary btn-sm">➕ Add</Link>
          <Link to="/scan" className="btn btn-secondary btn-sm">📷 Scan</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          icon="☀️"
          label="Today"
          value={formatAmount(summary?.today || 0, currency)}
          color="var(--orange-500)"
          delay={0}
        />
        <StatsCard
          icon="📅"
          label="This Week"
          value={formatAmount(summary?.thisWeek || 0, currency)}
          color="var(--info)"
          delay={100}
        />
        <StatsCard
          icon="📆"
          label="This Month"
          value={formatAmount(summary?.thisMonth || 0, currency)}
          color="var(--cat-entertainment)"
          delay={200}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Daily Bar Chart */}
        <div className="chart-card card animate-fade-in">
          <h3>Daily Spending (This Week)</h3>
          <div className="chart-container">
            {daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={daily} barCategoryGap="20%">
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#777', fontWeight: 700, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#777', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="var(--orange-500)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">
                <span>📊</span>
                <p>No data yet — start adding expenses!</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="chart-card card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h3>Spending by Category</h3>
          <div className="chart-container">
            {categoryData.length > 0 ? (
              <div className="pie-chart-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      strokeWidth={3}
                      stroke="var(--surface)"
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={getCategoryByName(entry.category).color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatAmount(value, currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {categoryData.map((entry, i) => {
                    const cat = getCategoryByName(entry.category);
                    return (
                      <div key={i} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                        <span className="legend-label">{cat.emoji} {entry.category}</span>
                        <span className="legend-pct">{entry.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="chart-empty">
                <span>🍩</span>
                <p>No data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-section animate-fade-in" style={{ animationDelay: '250ms' }}>
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <Link to="/history" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="expenses-list">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((exp) => (
              <ExpenseCard
                key={exp._id}
                expense={exp}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="empty-state card">
              <span className="empty-icon">💸</span>
              <p className="empty-title">No expenses yet</p>
              <p className="empty-desc">Add your first expense or scan a receipt!</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Link to="/add" className="btn btn-primary btn-sm">➕ Add Expense</Link>
                <Link to="/scan" className="btn btn-secondary btn-sm">📷 Scan Receipt</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
