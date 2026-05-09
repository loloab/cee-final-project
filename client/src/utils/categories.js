export const CATEGORIES = [
  { id: 'food', name: 'Food & Drinks', emoji: '🍔', color: '#FF6B35' },
  { id: 'transport', name: 'Transportation', emoji: '🚗', color: '#1CB0F6' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#CE82FF' },
  { id: 'bills', name: 'Bills & Utilities', emoji: '💡', color: '#FF9500' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#FF4B6E' },
  { id: 'healthcare', name: 'Healthcare', emoji: '💊', color: '#58CC02' },
  { id: 'education', name: 'Education', emoji: '📚', color: '#FFD100' },
  { id: 'other', name: 'Other', emoji: '📦', color: '#AFAFAF' },
];

export function getCategoryByName(name) {
  return CATEGORIES.find((c) => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
}

export function getCategoryColor(name) {
  return getCategoryByName(name).color;
}

export function getCategoryEmoji(name) {
  return getCategoryByName(name).emoji;
}
