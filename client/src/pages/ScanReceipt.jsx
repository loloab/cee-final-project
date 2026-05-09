import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES } from '../utils/categories';
import { formatAmount } from '../utils/currencies';
import CurrencySelector from '../components/CurrencySelector';
import LoadingSpinner from '../components/LoadingSpinner';
import './ScanReceipt.css';

export default function ScanReceipt() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('upload'); // upload | scanning | review | success
  const [preview, setPreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  // Editable fields
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [currency, setCurrency] = useState(user?.preferredCurrency || 'THB');
  const [total, setTotal] = useState('');
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('Other');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to API
    uploadReceipt(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const uploadReceipt = async (file) => {
    setStep('scanning');
    setError('');

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const res = await api.post('/scan/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data.data;
      setScanResult(data);

      // Populate editable fields
      setVendor(data.vendor || '');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setCurrency(data.currency || user?.preferredCurrency || 'THB');
      setTotal(data.total?.toString() || '');
      setItems(data.items || []);
      setCategory('Other');

      setStep('review');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan receipt. Try again or enter manually.');
      setStep('upload');
    }
  };

  const handleConfirm = async () => {
    setSaving(true);
    setError('');

    try {
      await api.post('/scan/confirm', {
        vendor,
        date,
        currency,
        items,
        total: parseFloat(total),
        category,
        note,
      });

      setStep('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === 'price' ? parseFloat(value) || 0 : value } : item
      )
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- UPLOAD STEP ----
  if (step === 'upload') {
    return (
      <div className="page-content container">
        <div className="scan-wrapper animate-slide-up">
          <div className="page-title">
            <h1>📷 Scan Receipt</h1>
            <p className="text-secondary">Upload a photo of your receipt or bill</p>
          </div>

          {error && <div className="error-message mb-md">{error}</div>}

          <div
            className="upload-zone card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📄</div>
            <h3>Drop your receipt here</h3>
            <p className="text-secondary">or click to browse files</p>
            <p className="text-sm text-secondary mt-sm">
              Supports JPEG, PNG, WebP • Max 10MB • Thai & English
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ---- SCANNING STEP ----
  if (step === 'scanning') {
    return (
      <div className="page-content container">
        <div className="scan-wrapper">
          <div className="scanning-state card animate-fade-in text-center">
            {preview && <img src={preview} alt="Receipt" className="scan-preview" />}
            <LoadingSpinner size={48} />
            <h2 style={{ marginTop: '16px' }}>Scanning your receipt...</h2>
            <p className="text-secondary">AI is extracting items and prices</p>
            <div className="scanning-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- SUCCESS STEP ----
  if (step === 'success') {
    return (
      <div className="page-content container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="success-card card animate-bounce text-center">
          <span style={{ fontSize: '4rem' }}>✅</span>
          <h2 style={{ marginTop: '12px' }}>Receipt Saved!</h2>
          <p className="text-secondary">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // ---- REVIEW STEP ----
  return (
    <div className="page-content container">
      <div className="scan-wrapper animate-slide-up">
        <div className="page-title">
          <h1>📝 Review & Confirm</h1>
          <p className="text-secondary">Verify the extracted data before saving</p>
        </div>

        {error && <div className="error-message mb-md">{error}</div>}

        <div className="review-layout">
          {/* Receipt Preview */}
          {preview && (
            <div className="preview-panel card">
              <img src={preview} alt="Receipt" className="receipt-img" />
            </div>
          )}

          {/* Editable Form */}
          <div className="review-form card">
            <div className="input-group">
              <label>Vendor</label>
              <input
                type="text"
                className="input-field"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="input-group" style={{ flex: 1 }}>
                <label>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Currency</label>
                <CurrencySelector value={currency} onChange={setCurrency} />
              </div>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div className="items-section">
                <label className="text-sm" style={{ fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Items
                </label>
                <div className="items-list">
                  {items.map((item, i) => (
                    <div key={i} className="item-row">
                      <input
                        type="text"
                        className="input-field item-name"
                        value={item.name}
                        onChange={(e) => updateItem(i, 'name', e.target.value)}
                        placeholder="Item name"
                      />
                      <input
                        type="number"
                        className="input-field item-price"
                        value={item.price}
                        onChange={(e) => updateItem(i, 'price', e.target.value)}
                        step="0.01"
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => removeItem(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="input-group">
              <label>Total Amount</label>
              <input
                type="number"
                className="input-field amount-input"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                step="0.01"
              />
            </div>

            {/* Category */}
            <div className="input-group">
              <label>Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="input-group">
              <label>Note (optional)</label>
              <textarea
                className="input-field"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Any notes..."
              />
            </div>

            <div className="review-actions">
              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleConfirm}
                disabled={saving}
              >
                {saving ? <LoadingSpinner size={20} color="#fff" /> : '✅ Confirm & Save'}
              </button>
              <button
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setStep('upload');
                  setPreview(null);
                  setScanResult(null);
                  setError('');
                }}
              >
                🔄 Scan Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
