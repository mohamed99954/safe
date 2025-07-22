
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type Language = 'ar' | 'en';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle = ({ className }: LanguageToggleProps) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button 
      variant="ghost" 
      onClick={toggleLanguage}
      className={`px-2 ${className}`}
    >
      {language === 'ar' ? 'English' : 'العربية'}
    </Button>
  );
};

export default LanguageToggle;
