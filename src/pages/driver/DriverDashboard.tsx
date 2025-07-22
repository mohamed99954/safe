import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  Package,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import ComplaintFormModal from "./ComplaintFormModal";

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user, session } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    data: driverData,
    isLoading: isLoadingDriver,
    error: driverError,
  } = useQuery({
    queryKey: ["driver-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", user.id)
        .single();

      if (driverError) {
        console.error("Error fetching driver data:", driverError);
        throw driverError;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        throw profileError;
      }

      return { ...driver, profile };
    },
    enabled: !!user?.id,
  });

  // Enhanced query for financial statistics
  const { data: financialStats, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["driver-financial-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        const { count: completedOrders, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (ordersError) {
          console.error("Error fetching completed orders:", ordersError);
          throw ordersError;
        }

        const { data: transactions, error: transactionsError } = await supabase
          .from("financial_transactions")
          .select("amount, transaction_type, status")
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
          throw transactionsError;
        }

        const totalEarnings = transactions
          .filter((t) => t.transaction_type === "driver_payout")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const platformCommission = transactions
          .filter((t) => t.transaction_type === "platform_fee")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          completedOrders: completedOrders || 0,
          totalEarnings,
          platformCommission,
          availableBalance: totalEarnings - platformCommission,
        };
      } catch (error) {
        console.error("Error calculating financial stats:", error);
        return {
          completedOrders: 0,
          totalEarnings: 0,
          platformCommission: 0,
          availableBalance: 0,
        };
      }
    },
    enabled: !!user?.id,
    retry: 2,
  });

  // Rating query
  const { data: ratingData } = useQuery({
    queryKey: ["driver-rating", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      try {
        const { data: ratings, error: ratingsError } = await supabase
          .from("driver_ratings")
          .select("rating")
          .eq("driver_id", user.id);

        if (ratingsError) {
          console.error("Error fetching driver ratings:", ratingsError);
          throw ratingsError;
        }

        if (ratings && ratings.length > 0) {
          const validRatings = ratings.filter(
            (r) => r.rating != null && !isNaN(r.rating)
          );
          if (validRatings.length > 0) {
            const totalRating = validRatings.reduce(
              (sum, r) => sum + Number(r.rating),
              0
            );
            const avgRating = totalRating / validRatings.length;
            return avgRating;
          }
        }

        return 0;
      } catch (error) {
        console.error("Error calculating driver rating:", error);
        return 0;
      }
    },
    enabled: !!user?.id,
  });

  // Updated notifications query - fetching from driver_notifications table
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["driver-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("driver_notifications")
          .select("*")
          .eq("driver_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false })
          .limit(99); // Only get latest 5 unread notifications for dashboard

        if (error) {
          console.error("Error fetching notifications:", error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Error in notifications query:", error);
        return [];
      }
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Add currency formatter helper
  const formatCurrency = (amount: number) => {
    const formattedAmount = amount.toFixed(2);
    return language === "ar"
      ? `${formattedAmount} ر.س`
      : `SAR ${formattedAmount}`;
  };

  useEffect(() => {
    const checkAuthAndData = async () => {
      const driverAuth = localStorage.getItem("driverAuth");
      if (!driverAuth || driverAuth !== "true") {
        toast({
          title: t("unauthorizedAccess"),
          description: t("pleaseLoginFirst"),
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: t("unauthorizedAccess"),
            description: t("pleaseLoginFirst"),
            variant: "destructive",
          });
          localStorage.removeItem("driverAuth");
          navigate("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error in driver dashboard init", error);
        toast({
          title: t("systemErrorOccurred"),
          description: t("errorFetchingAccountData"),
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    checkAuthAndData();
  }, [navigate, toast, t]);

  const renderAccountStatusBanner = () => {
    if (!driverData) return null;

    if (driverData.status === "approved") {
      return (
        <div className="bg-green-50 ltr:border-l-4 rtl:border-r-4 border-green-500 p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-green-800">
                {t("accountApproved")}
              </p>
              <p className="text-green-700 text-sm">
                {t("accountApprovedDesc")}
              </p>
            </div>
          </div>
        </div>
      );
    }
    if (driverData.status === "pending") {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start">
            <Clock className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                {t("accountPending")}
              </p>
              <p className="text-yellow-700 text-sm">
                {t("accountPendingDesc")}
              </p>
            </div>
          </div>
        </div>
      );
    }
    if (driverData.status === "rejected") {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <p className="font-medium text-red-800">{t("accountRejected")}</p>
              <p className="text-red-700 text-sm">{t("accountRejectedDesc")}</p>
              {driverData.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">
                    {t("rejectionReason")}
                  </h3>
                  <p className="text-red-700 mt-2">
                    {driverData.rejection_reason}
                  </p>
                </div>
              )}
              <p className="text-gray-600 mt-4">{t("reapplyNote")}</p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => navigate("/driver/profile")}
              >
                {t("reapply")}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    if (driverData.status === "frozen") {
      return (
        <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <p className="font-bold text-red-700">{t("accountFrozen")}</p>
              <p className="mt-2 text-red-600">{t("accountFrozenDesc")}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "rating":
        return <Star className="h-5 w-5 text-yellow-600" />;
      case "earning":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "complaint":
      case "complaint_confirmation":
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case "complaint_resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "system":
        return <Bell className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoadingDriver || !isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  if (driverError) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">{t("systemError")}</h2>
          <p className="text-gray-600">{t("errorLoadingAccount")}</p>
          <Button onClick={() => window.location.reload()}>
            {t("refreshPage")}
          </Button>
        </div>
      </div>
    );
  }

  const completedOrdersCount = financialStats?.completedOrders || 0;
  const formattedRating = (ratingData || 0).toFixed(1);
  const unreadNotificationsCount = notificationsData?.length || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-bold text-gray-900">
              {t("driverDashboardTitle")}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            {renderAccountStatusBanner()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("completedOrdersCount")}
                      </p>
                      <h3 className="text-2xl font-bold">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          completedOrdersCount
                        )}
                      </h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("rating")}
                      </p>
                      <div
                        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate("/driver/ratings")}
                      >
                        <h3 className="text-2xl font-bold">
                          {formattedRating}
                        </h3>
                        <div className="text-yellow-500 ml-2 text-lg">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i} className="inline-block">
                                {i < Math.floor(ratingData || 0)
                                  ? "★"
                                  : i === Math.floor(ratingData || 0) &&
                                    (ratingData || 0) % 1 >= 0.5
                                  ? "★"
                                  : "☆"}
                              </span>
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">/5.0</span>
                      </div>
                    </div>
                    <div
                      className="bg-yellow-100 p-3 rounded-full cursor-pointer hover:bg-yellow-200 transition-colors"
                      onClick={() => navigate("/driver/ratings")}
                    >
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t("availableBalance")}
                      </p>
                      <h3
                        className="text-2xl font-bold"
                        dir={language === "ar" ? "rtl" : "ltr"}
                      >
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          formatCurrency(financialStats?.availableBalance || 0)
                        )}
                      </h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications and financial summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("notifications")}</CardTitle>
                    {unreadNotificationsCount > 0 && (
                      <Badge variant="destructive" className="bg-red-500">
                        {unreadNotificationsCount} {t("newNotifications")}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!notificationsData || notificationsData.length === 0 ? (
                    <div className="text-center p-6">
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t("noNewNotifications")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notificationsData.slice(0, 3).map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start p-3 rounded-lg bg-blue-50 border border-blue-200"
                        >
                          <div className="bg-white p-2 rounded-full shadow-sm mr-3 rtl:ml-3">
                            {getNotificationIcon(
                              notification.notification_type
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 mb-1">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                notification.created_at
                              ).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => navigate("/driver/notifications")}
                  >
                    {t("viewAllNotifications")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("earningsSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("totalEarnings")}</p>
                      <p className="font-medium">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          formatCurrency(financialStats?.totalEarnings || 0)
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">{t("platformFee")}</p>
                      <p className="font-medium">
                        {isLoadingFinancial ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          formatCurrency(
                            financialStats?.platformCommission || 0
                          )
                        )}
                      </p>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between font-medium">
                        <p>{t("availableBalance")}</p>
                        <p>
                          {isLoadingFinancial ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            formatCurrency(
                              financialStats?.availableBalance || 0
                            )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex mt-6 gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/driver/earnings")}
                    >
                      {t("paymentDetails")}
                    </Button>
                    {/* <Button
                      className="bg-safedrop-gold hover:bg-safedrop-gold/90 flex-1"
                      onClick={() =>
                        toast({
                          title: t("withdrawalRequestSent"),
                          variant: "default",
                          className: "bg-green-500 text-white",
                        })
                      }
                    >
                      {t("requestWithdrawal")}
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support card with Complaint Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t("supportAndHelp")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex items-center justify-center gap-2"
                    onClick={() => navigate("/driver/support")}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{t("contactSupport")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex items-center justify-center gap-2"
                    onClick={() => navigate("/driver/support")}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>{t("faq")}</span>
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {t("havingProblem")}
                  </p>
                  <ComplaintFormModal
                    trigger={
                      <Button variant="secondary" className="w-full">
                        {t("reportIssue")}
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  return (
    <LanguageProvider>
      <DriverDashboardContent />
    </LanguageProvider>
  );
};

export default DriverDashboard;
