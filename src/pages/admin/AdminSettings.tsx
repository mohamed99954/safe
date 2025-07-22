import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Globe } from "lucide-react";

const AdminSettingsContent = () => {
  const { t, language, setLanguage } = useLanguage();
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

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
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  return (
    <LanguageProvider>
      <AdminSettingsContent />
    </LanguageProvider>
  );
};

export default AdminSettings;
