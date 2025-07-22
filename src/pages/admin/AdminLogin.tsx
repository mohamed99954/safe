import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheckIcon, LockIcon, Loader2 } from "lucide-react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import Cookies from "js-cookie";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// Cookie configuration object
const COOKIE_OPTIONS = {
  secure: window.location.protocol === "https:",
  sameSite: "Strict",
  expires: 30,
} as const;

const AdminLoginContent = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const setAuthCookie = useCallback((name, value) => {
    Cookies.set(name, value, COOKIE_OPTIONS);
  }, []);

  const clearAuthCookies = useCallback(() => {
    Cookies.remove("adminAuth");
    Cookies.remove("adminEmail");
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const forceLogout = queryParams.get("logout") === "true";

    if (forceLogout) {
      clearAuthCookies();
      navigate("/admin", { replace: true });
      return;
    }

    const isAdminLoggedIn = Cookies.get("adminAuth") === "true";
    if (isAdminLoggedIn) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate, location, clearAuthCookies]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    if (!password) {
      toast.error(t("pleaseEnterEmailPassword"));
      setIsLoading(false);
      return;
    }

    try {
      if (password === ADMIN_PASSWORD) {
        setAuthCookie("adminAuth", "true");
        setAuthCookie("adminEmail", import.meta.env.VITE_ADMIN_EMAIL);

        const email = import.meta.env.VITE_ADMIN_EMAIL;

        const { data: existingUser } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", "admin")
          .maybeSingle();

        if (!existingUser) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: "admin",
              first_name: "Admin",
              last_name: "User",
              phone: "+966000000000",
              user_type: "admin",
              email: import.meta.env.VITE_ADMIN_EMAIL,
            });

          if (profileError) {
            console.error("Error creating admin profile:", profileError);
          }
        }

        try {
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("id")
            .eq("user_id", "admin")
            .eq("role", "admin")
            .maybeSingle();

          if (!existingRole) {
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: "admin",
                role: "admin",
              });

            if (roleError) {
              console.error("Error assigning admin role:", roleError);
            }
          }
        } catch (roleError) {
          console.error("Error checking/creating admin role:", roleError);
        }

        toast.success(t("loginSuccess"));

        navigate("/admin/dashboard", { replace: true });
      } else {
        throw new Error(t("invalidCredentials"));
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || t("invalidCredentials"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-safedrop-primary">
                {t("adminLogin")}
              </CardTitle>
              <CardDescription>{t("adminLoginDescription")}</CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <div className="relative">
                    <LockIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:right-auto rtl:left-3" />
                    <Input
                      id="password"
                      type="password"
                      className="pr-10 rtl:pr-4 rtl:pl-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("loggingIn")}
                    </>
                  ) : (
                    t("login")
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

const AdminLogin = () => (
  <LanguageProvider>
    <AdminLoginContent />
  </LanguageProvider>
);

export default AdminLogin;
