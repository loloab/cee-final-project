import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 32, color = 'var(--orange-500)' }) {
  return (
    <div
      className="loading-spinner"
      style={{
        width: size,
        height: size,
        borderColor: `${color}33`,
        borderTopColor: color,
      }}
    />
  );
}
