import './StatsCard.css';

export default function StatsCard({ icon, label, value, color = 'var(--orange-500)', delay = 0 }) {
  return (
    <div
      className="stats-card animate-slide-up"
      style={{ animationDelay: `${delay}ms`, borderTopColor: color }}
    >
      <div className="stats-icon">{icon}</div>
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </div>
  );
}
