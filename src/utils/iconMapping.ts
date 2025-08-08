export interface IconOption {
  keyword: string;
  icon: string;
  label: string;
}

export const ICON_MAPPING: IconOption[] = [
  { keyword: 'food', icon: '🍕', label: 'Food' },
  { keyword: 'transport', icon: '🚗', label: 'Transport' },
  { keyword: 'shopping', icon: '🛍️', label: 'Shopping' },
  { keyword: 'entertainment', icon: '🎬', label: 'Entertainment' },
  { keyword: 'health', icon: '🏥', label: 'Health' },
  { keyword: 'education', icon: '📚', label: 'Education' },
  { keyword: 'home', icon: '🏠', label: 'Home' },
  { keyword: 'work', icon: '💼', label: 'Work' },
  { keyword: 'travel', icon: '✈️', label: 'Travel' },
  { keyword: 'bills', icon: '📄', label: 'Bills' },
  { keyword: 'utilities', icon: '⚡', label: 'Utilities' },
  { keyword: 'insurance', icon: '🛡️', label: 'Insurance' },
  { keyword: 'gifts', icon: '🎁', label: 'Gifts' },
  { keyword: 'sports', icon: '⚽', label: 'Sports' },
  { keyword: 'technology', icon: '💻', label: 'Technology' },
  { keyword: 'beauty', icon: '💄', label: 'Beauty' },
  { keyword: 'pets', icon: '🐕', label: 'Pets' },
  { keyword: 'coffee', icon: '☕', label: 'Coffee' },
  { keyword: 'alcohol', icon: '🍺', label: 'Alcohol' },
  { keyword: 'other', icon: '📌', label: 'Other' },
];

export function getIconByKeyword(keyword: string): string {
  const option = ICON_MAPPING.find(opt => opt.keyword === keyword);
  return option?.icon || '📌';
}

export function getKeywordByIcon(icon: string): string {
  const option = ICON_MAPPING.find(opt => opt.icon === icon);
  return option?.keyword || 'other';
}
