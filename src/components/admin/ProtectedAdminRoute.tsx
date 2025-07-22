import React, { ReactNode, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/components/ui/language-context";
import { Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { supabase } from "@/integrations/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userType, session, loading: authLoading } = useAuth();
  const [authStatus, setAuthStatus] = useState<
    "checking" | "authorized" | "unauthorized"
  >("checking");
  const [minimumLoadingTime, setMinimumLoadingTime] = useState(true);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRunInitialCheck = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinimumLoadingTime(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const currentUser = user || session?.user;

      if (userType === "admin") {
        localStorage.setItem("adminAuth", "true");
        Cookies.set("adminAuth", "true", {
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
          expires: 30,
        });
        if (!minimumLoadingTime) {
          setAuthStatus("authorized");
        }
        return;
      }

      if (currentUser) {
        const hasAdminStorage = localStorage.getItem("adminAuth") === "true";
        const hasAdminCookie = Cookies.get("adminAuth") === "true";

        if (hasAdminStorage || hasAdminCookie) {
          if (!minimumLoadingTime) {
            setAuthStatus("authorized");
          }
          return;
        }
      }

      if (currentUser?.user_metadata?.user_type === "admin") {
        localStorage.setItem("adminAuth", "true");
        Cookies.set("adminAuth", "true", {
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
          expires: 30,
        });
        if (!minimumLoadingTime) {
          setAuthStatus("authorized");
        }
        return;
      }

      if (currentUser && !authLoading) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", currentUser.id)
            .maybeSingle();

          if (!profileError && profileData?.user_type === "admin") {
            localStorage.setItem("adminAuth", "true");
            Cookies.set("adminAuth", "true", {
              secure: window.location.protocol === "https:",
              sameSite: "Strict",
              expires: 30,
            });
            if (!minimumLoadingTime) {
              setAuthStatus("authorized");
            }
            return;
          }

          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id)
            .eq("role", "admin")
            .maybeSingle();

          if (!roleError && roleData) {
            localStorage.setItem("adminAuth", "true");
            Cookies.set("adminAuth", "true", {
              secure: window.location.protocol === "https:",
              sameSite: "Strict",
              expires: 30,
            });
            if (!minimumLoadingTime) {
              setAuthStatus("authorized");
            }
            return;
          }

          if (currentUser.email) {
            const adminEmails = ["admin@safedrop.com", "support@safedrop.com"];

            if (adminEmails.includes(currentUser.email.toLowerCase())) {
              localStorage.setItem("adminAuth", "true");
              Cookies.set("adminAuth", "true", {
                secure: window.location.protocol === "https:",
                sameSite: "Strict",
                expires: 30,
              });
              if (!minimumLoadingTime) {
                setAuthStatus("authorized");
              }
              return;
            }
          }

          if (!minimumLoadingTime) {
            setAuthStatus("unauthorized");
          }
          return;
        } catch (error) {
          console.warn("Database check failed:", error);
        }
      }

      if (!authLoading) {
        if (!currentUser) {
          if (!minimumLoadingTime) {
            setAuthStatus("unauthorized");
          }
          return;
        }
      }

      if (authLoading && !hasRunInitialCheck.current) {
        hasRunInitialCheck.current = true;

        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }

        checkTimeoutRef.current = setTimeout(() => {
          const finalUser = user || session?.user;

          if (
            userType === "admin" ||
            localStorage.getItem("adminAuth") === "true"
          ) {
            if (!minimumLoadingTime) {
              setAuthStatus("authorized");
            }
          } else if (finalUser) {
            checkAdminAuth();
          } else {
            if (!minimumLoadingTime) {
              setAuthStatus("unauthorized");
            }
          }
        }, 3000);

        return;
      }
    };

    checkAdminAuth();

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [
    user,
    userType,
    session,
    authLoading,
    location.pathname,
    minimumLoadingTime,
  ]);

  useEffect(() => {
    if (!minimumLoadingTime && authStatus === "checking") {
      const currentUser = user || session?.user;

      if (
        userType === "admin" ||
        localStorage.getItem("adminAuth") === "true"
      ) {
        setAuthStatus("authorized");
      } else if (!currentUser && !authLoading) {
        setAuthStatus("unauthorized");
      }
    }
  }, [minimumLoadingTime, authStatus, user, session, userType, authLoading]);

  useEffect(() => {
    if (authStatus === "unauthorized") {
      localStorage.removeItem("adminAuth");
      Cookies.remove("adminAuth");

      if (!location.pathname.includes("/login")) {
        toast.error(
          t("adminAuthRequired") ||
            "يجب تسجيل الدخول كمسؤول للوصول إلى لوحة التحكم"
        );
        navigate("/login?redirect=admin", { replace: true });
      }
    }
  }, [authStatus, location.pathname, navigate, t]);

  // Simple loading screen matching the customer dashboard style
  if (authStatus === "checking" || minimumLoadingTime) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  // Show unauthorized state (brief before redirect)
  if (authStatus === "unauthorized") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">
              غير مصرح بالوصول
            </h2>
            <p className="text-gray-600 mb-6">
              ليس لديك صلاحية الوصول إلى لوحة تحكم المسؤول
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login?redirect=admin")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              تسجيل الدخول كمسؤول
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="w-full">{children}</div>;
};

export default ProtectedAdminRoute;
