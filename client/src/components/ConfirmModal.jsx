import '../index.css'; // Just using index.css classes, so no need if not present

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal card animate-slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
        <h2>{title}</h2>
        <p className="text-secondary mt-sm mb-md">{message}</p>
        <div className="modal-actions mt-lg" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-danger btn-block" onClick={onConfirm}>Yes, Delete</button>
          <button className="btn btn-secondary btn-block" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
