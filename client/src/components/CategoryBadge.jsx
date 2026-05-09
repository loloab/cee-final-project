import { getCategoryByName } from '../utils/categories';

export default function CategoryBadge({ name, size = 'md' }) {
  const category = getCategoryByName(name);

  const sizeStyles = {
    sm: { fontSize: '0.7rem', padding: '2px 8px' },
    md: { fontSize: '0.8rem', padding: '4px 12px' },
    lg: { fontSize: '0.9rem', padding: '6px 14px' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: `${category.color}20`,
        color: category.color,
        fontWeight: 700,
        borderRadius: '9999px',
        textTransform: 'uppercase',
        letterSpacing: '0.3px',
        ...sizeStyles[size],
      }}
    >
      {category.emoji} {category.name}
    </span>
  );
}
