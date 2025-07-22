import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Cookies from "js-cookie";

const PendingApprovalContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [driverStatus, setDriverStatus] = useState({
    status: "pending",
    rejection_reason: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any orphaned cookies/storage on mount
  useEffect(() => {
    Cookies.remove("pendingUserDetails");

    // Also clean up any driver file entries that don't match current user
    if (user?.id) {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("driverFiles_") && !key.includes(user.id)) {
          localStorage.removeItem(key);
        }
      }
    }
  }, [user?.id]);

  const fetchDriverStatus = async () => {
    if (!user?.id) {
      setError(t("failedToGetUserInfo"));
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Use the server function to check driver status
      const { data, error: rpcError } = await supabase.rpc(
        "get_driver_status_v3",
        {
          in_driver_id: user.id,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      // If the row simply doesn't exist yet, treat as pending
      if (!data?.success) {
        if (data.error?.includes("No driver record")) {
          setDriverStatus({ status: "pending", rejection_reason: null });
        } else {
          throw new Error(data.error || t("profileCheckError"));
        }
      } else {
        setDriverStatus({
          status: data.status,
          rejection_reason: data.rejection_reason,
        });

        // Auto-redirect approved drivers
        if (data.status === "approved") {
          navigate("/driver/dashboard");
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching driver status:", err);
      setError(t("profileCheckError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial + polling every 30s
  useEffect(() => {
    fetchDriverStatus();
    const interval = setInterval(fetchDriverStatus, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const clearAll = async () => {
    // Remove cookies + localStorage + sessionStorage
    Object.keys(Cookies.get()).forEach((c) => Cookies.remove(c, { path: "/" }));
    localStorage.clear();
    sessionStorage.clear();
  };

  const handleBackToLogin = async () => {
    await clearAll();
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="w-full max-w-md p-8 bg-white shadow-xl rounded-xl animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <div
            className={`bg-amber-50 border-amber-500 p-4 mb-6 ${
              language === "ar"
                ? "border-r-4 text-left"
                : "border-l-4 text-left"
            }`}
          >
            <p className="font-bold text-amber-800">{t("systemError")}</p>
            <p className="text-amber-700 mt-2">{error}</p>
          </div>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={fetchDriverStatus}
            >
              {t("retryAction")}
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleBackToLogin}
            >
              {t("backToLoginPage")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // APPROVED
  if (driverStatus?.status === "approved") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <div
            className={`bg-green-50 border-green-500 p-4 mb-6 ${
              language === "ar"
                ? "border-r-4 text-left"
                : "border-l-4 text-left"
            }`}
          >
            <p className="font-bold text-green-800">
              {t("applicationApproved")}
            </p>
            <p className="text-green-700 mt-2">{t("canNowUseApp")}</p>
          </div>
          <Button
            variant="default"
            className="w-full mt-4"
            onClick={() => navigate("/driver/dashboard")}
          >
            {t("goToDashboard")}
          </Button>
        </div>
      </div>
    );
  }

  // REJECTED
  if (driverStatus?.status === "rejected") {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div
            className={`bg-red-50 border-red-500 p-4 mb-6 ${
              language === "ar"
                ? "border-r-4 text-left"
                : "border-l-4 text-left"
            }`}
          >
            <p className="font-bold text-red-800">{t("applicationRejected")}</p>
            <p className="text-red-700 mt-2">
              {driverStatus.rejection_reason || t("noRejectionReason")}
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full mb-2"
            onClick={signOut}
          >
            {t("signOut")}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleBackToLogin}
          >
            {t("backToLoginPage")}
          </Button>
        </div>
      </div>
    );
  }

  // PENDING (no record yet or still under review)
  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 p-4 ${
        language === "ar" ? "rtl" : "ltr"
      }`}
    >
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
        <img
          src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
          alt="SafeDrop Logo"
          className="h-20 mx-auto mb-6"
        />
        <div
          className={`bg-yellow-50 border-yellow-500 p-4 mb-6 ${
            language === "ar" ? "border-r-4 text-left" : "border-l-4 text-left"
          }`}
        >
          <div
            className={`flex items-start ${
              language === "ar" ? "flex-row" : "gap-2"
            }`}
          >
            <Clock
              className={`h-10 w-10 text-yellow-500 ${
                language === "ar" ? "ml-3" : "mr-3"
              }`}
            />
            <div>
              <p className="font-bold text-yellow-800">
                {t("accountUnderReview")}
              </p>
              <p className="text-yellow-700 mt-2">
                {t("thankYouForRegistering")}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {t("whatHappensNow")}
        </h2>
        <ol
          className={`space-y-2 mb-6 ${
            language === "ar" ? "text-left" : "text-left"
          }`}
        >
          <li>
            <strong>1.</strong> {t("reviewStep1")}
          </li>
          <li>
            <strong>2.</strong> {t("reviewStep2")}
          </li>
          <li>
            <strong>3.</strong> {t("reviewStep3")}
          </li>
        </ol>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={fetchDriverStatus}
          >
            {t("updateStatus")}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleBackToLogin}
          >
            {t("backToLoginPage")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const PendingApproval = () => (
  <LanguageProvider>
    <PendingApprovalContent />
  </LanguageProvider>
);

export default PendingApproval;
