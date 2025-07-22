
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/ui/language-context';
import { Globe } from 'lucide-react';

const LanguageToggleDashboard = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <Button 
      variant="ghost" 
      onClick={toggleLanguage}
      className="flex items-center gap-2 w-full justify-center"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </Button>
  );
};

export default LanguageToggleDashboard;
