
import { LanguageKey } from "./language-key";
import { translations } from "./translations";

// Function to translate text based on the current language
export const translate = (key: string, language: LanguageKey): string => {
  if (!translations[key]) {
    console.warn(`Translation for key "${key}" not found`);
    return key;
  }
  
  if (!translations[key][language]) {
    console.warn(`Translation for key "${key}" in language "${language}" not found`);
    // Return the other language as fallback rather than the key itself
    return translations[key][language === 'ar' ? 'en' : 'ar'] || key;
  }
  
  return translations[key][language];
};

// Export translations for use throughout the application
export { translations };
