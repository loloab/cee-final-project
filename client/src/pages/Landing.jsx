import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing">
      <div className="landing-hero container">
        <div className="hero-content animate-slide-up">
          <div className="hero-badge">✨ Smart Expense Tracking</div>
          <h1 className="hero-title">
            Track Spending.<br />
            <span className="text-orange">Scan Receipts.</span><br />
            Stay on Budget.
          </h1>
          <p className="hero-subtitle">
            Snap a photo of any receipt — Thai or English — and let AI do the rest.
            Visualize your spending with beautiful charts and stay in control of your money.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started — It's Free
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              I Have an Account
            </Link>
          </div>
        </div>

        <div className="hero-visual animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="feature-cards-stack">
            <div className="preview-card card-1">
              <div className="preview-emoji">📷</div>
              <div className="preview-title">Scan Receipts</div>
              <div className="preview-desc">Thai & English — AI-powered</div>
            </div>
            <div className="preview-card card-2">
              <div className="preview-emoji">📊</div>
              <div className="preview-title">Visual Insights</div>
              <div className="preview-desc">Charts & spending breakdown</div>
            </div>
            <div className="preview-card card-3">
              <div className="preview-emoji">💱</div>
              <div className="preview-title">Multi-Currency</div>
              <div className="preview-desc">Track in any currency</div>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section container">
        <h2 className="features-heading text-center">
          Why <span className="text-orange">Billy</span>?
        </h2>
        <div className="features-grid">
          {[
            { emoji: '🤖', title: 'AI Receipt Scanning', desc: 'Powered by Google Gemini — extracts items, prices, and totals from any receipt photo.' },
            { emoji: '🇹🇭', title: 'Thai & English', desc: 'Works perfectly with both Thai and English receipts and bills.' },
            { emoji: '📈', title: 'Beautiful Charts', desc: 'See daily, weekly, and monthly trends with colorful, interactive charts.' },
            { emoji: '🏷️', title: 'Smart Categories', desc: '8 predefined categories with notes for organized tracking.' },
            { emoji: '💰', title: 'Multi-Currency', desc: 'Track expenses in any currency with automatic conversion.' },
            { emoji: '⚡', title: 'Blazing Fast', desc: 'Lightning fast performance with a playful, fun interface.' },
          ].map((feature, i) => (
            <div key={i} className="feature-card card animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="feature-emoji">{feature.emoji}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="landing-footer container text-center">
        <p className="text-secondary text-sm">
          Built with ❤️ and 🧾 • Billy © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
