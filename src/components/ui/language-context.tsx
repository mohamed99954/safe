import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { LanguageKey } from "@/lib/language-key";
import { translations } from "@/lib/i18n";

interface LanguageContextType {
  language: LanguageKey;
  setLanguage: (lang: LanguageKey) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<LanguageKey>(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    return savedLanguage === "en" || savedLanguage === "ar"
      ? savedLanguage
      : "ar";
  });

  useEffect(() => {
    // Store the language preference
    localStorage.setItem("preferred-language", language);

    // Update document attributes without forcing reflow
    requestAnimationFrame(() => {
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    });
  }, [language]);

  const t = (key: string) => {
    if (!translations[key]) {
      console.warn(`Translation for key "${key}" not found:`, key);
      return key;
    }

    if (!translations[key][language]) {
      console.warn(
        `Translation for key "${key}" in language "${language}" not found:`,
        key,
        language
      );
      return key;
    }

    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
