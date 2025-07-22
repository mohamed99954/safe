
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/ui/language-context";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-safedrop-primary to-safedrop-primary/90">
      <div className="text-center px-4">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <Package className="h-12 w-12 text-safedrop-gold" />
          </div>
        </div>
        <h1 className="text-7xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-white/90 mb-8">
          {t('pageNotFound')}
        </p>
        <Button
          asChild
          variant="outline"
          className="bg-white text-safedrop-primary hover:bg-gray-100"
        >
          <a href="/">
            {t('returnHome')}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
