
// Create a centralized type for language keys
export type LanguageKey = 'ar' | 'en';

// Currency display formats
export const currencyFormat = {
  'ar': {
    symbol: 'ر.س',
    position: 'suffix',
    spaceBetween: true,
  },
  'en': {
    symbol: 'SAR',
    position: 'suffix',
    spaceBetween: true,
  }
};
