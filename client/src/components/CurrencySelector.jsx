import { CURRENCIES } from '../utils/currencies';

export default function CurrencySelector({ value, onChange, className = '' }) {
  return (
    <select
      className={`input-field ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.symbol} {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
