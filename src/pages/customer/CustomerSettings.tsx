import { useState } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Globe, Phone } from "lucide-react";
import { toast } from "sonner";

const CustomerSettingsContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleSaveChanges = () => {
    setLoading(true);
    // Simulate saving changes
    setTimeout(() => {
      setLoading(false);
      toast.success(t("settingsSaved"));
    }, 1000);
  };

  const getFormattedPhoneNumber = () => {
    return (
      <span className="inline-block" dir="ltr">
        &#x2066;+966 55 616 0601&#x2069;
      </span>
    );
  };

  // Function to format currency based on language
  const formatCurrency = (amount: number) => {
    return language === "ar" ? `${amount} ر.س` : `SAR ${amount}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">{t("settings")}</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {t("languageSettings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t("preferredLanguage")}
                    </label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={language}
                      onChange={(e) =>
                        setLanguage(e.target.value as "ar" | "en")
                      }
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  {t("Support Contact")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-base font-medium">
                      {getFormattedPhoneNumber()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                onClick={handleSaveChanges}
                disabled={loading}
              >
                {loading ? t("savingChanges") : t("saveChanges")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const CustomerSettings = () => {
  return (
    <LanguageProvider>
      <CustomerSettingsContent />
    </LanguageProvider>
  );
};

export default CustomerSettings;
