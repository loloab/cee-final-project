import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import CurrencySelector from './CurrencySelector';
import LoadingSpinner from './LoadingSpinner';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ preferredCurrency: '' });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const openSettings = () => {
    setSettingsForm({ preferredCurrency: user?.preferredCurrency || 'THB' });
    setShowSettings(true);
    setMenuOpen(false);
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await updateUser(settingsForm);
      setShowSettings(false);
    } catch (err) {
      console.error('Settings save error:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/add', label: 'Add', icon: '➕' },
    { path: '/scan', label: 'Scan', icon: '📷' },
    { path: '/history', label: 'History', icon: '📋' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to={user ? '/dashboard' : '/'} className="navbar-brand">
          <span className="brand-icon">🧾</span>
          <span className="brand-text">Billy.</span>
        </Link>

        {user && (
          <>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </Link>
              ))}
              <button className="nav-link" onClick={openSettings} style={{ background: 'transparent' }}>
                <span className="nav-icon">⚙️</span>
                <span className="nav-label">Settings</span>
              </button>
              <button className="nav-link logout-btn" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Logout</span>
              </button>
            </div>

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
            </button>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
            <h2>User Settings</h2>
            
            <div className="modal-form mt-md">
              <div className="input-group">
                <label>Preferred Currency</label>
                <CurrencySelector
                  value={settingsForm.preferredCurrency}
                  onChange={(val) => setSettingsForm({ ...settingsForm, preferredCurrency: val })}
                />
                <p className="text-secondary text-sm mt-sm">This is the default currency when adding expenses.</p>
              </div>

              <div className="modal-actions mt-lg">
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? <LoadingSpinner size={18} color="#fff" /> : '💾 Save Settings'}
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
