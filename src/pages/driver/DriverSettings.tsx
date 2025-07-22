import { useState } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { Bell, Globe, Shield, Moon } from "lucide-react";
const DriverSettingsContent = () => {
  const { t, language, setLanguage } = useLanguage();
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    earnings: true,
    updates: false,
  });
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

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
                  <Bell className="h-5 w-5" />
                  {t("notificationSettings")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("orderNotifications")}</p>
                      <p className="text-sm text-gray-500">
                        {t("receiveOrderNotifications")}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.orders}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          orders: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("messageNotifications")}</p>
                      <p className="text-sm text-gray-500">
                        {t("receiveMessageNotifications")}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          messages: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {t("earningsNotifications")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("receiveEarningsNotifications")}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.earnings}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          earnings: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t("systemNotifications")}</p>
                      <p className="text-sm text-gray-500">
                        {t("receiveUpdateNotifications")}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.updates}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          updates: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      dir={language === "ar" ? "rtl" : "ltr"}
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

            <Card></Card>

            <Card></Card>

            <div className="flex justify-end">
              <Button className="bg-safedrop-gold hover:bg-safedrop-gold/90">
                {t("saveChanges")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
const DriverSettings = () => {
  return (
    <LanguageProvider>
      <DriverSettingsContent />
    </LanguageProvider>
  );
};
export default DriverSettings;
