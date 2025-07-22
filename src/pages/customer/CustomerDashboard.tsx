import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Clock,
  CheckCircle,
  PlusCircle,
  Eye,
  Bell,
  MessageSquare,
  Star,
  DollarSign,
  HelpCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import CustomerComplaintFormModal from "./CustomerComplaintFormModal";

const CustomerDashboardContent = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    in_transit: 0,
    completed: 0,
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);

  // Customer notifications query
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["customer-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("customer_notifications")
          .select("*")
          .eq("customer_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false })
          .limit(5); // Only get latest 5 unread notifications for dashboard

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

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch orders statistics
        const { data: allOrders, error: ordersError } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_id", user.id);

        if (ordersError) throw ordersError;

        // Calculate stats
        const stats = {
          totalOrders: allOrders ? allOrders.length : 0,
          in_transit: allOrders
            ? allOrders.filter((order) =>
                ["pending", "assigned", "in_transit"].includes(order.status)
              ).length
            : 0,
          completed: allOrders
            ? allOrders.filter((order) => order.status === "completed").length
            : 0,
        };
        setStats(stats);

        // Fetch active orders
        const { data: active, error: activeError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .in("status", ["available", "picked_up", "in_transit", "approaching"])
          .order("created_at", { ascending: false })
          .limit(5);

        if (activeError) throw activeError;
        setActiveOrders(active || []);

        // Fetch recent history orders
        const { data: history, error: historyError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .in("status", ["completed", "cancelled"])
          .order("created_at", { ascending: false })
          .limit(5);

        if (historyError) throw historyError;
        setHistoryOrders(history || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(t("errorLoadingData"));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, t]);

  const handleCreateOrder = () => {
    navigate("/customer/create-order");
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
        return <Settings className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const unreadNotificationsCount = notificationsData?.length || 0;

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {t("customerDashboardTitle")}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t("overview")}
              </h2>
              <Button
                onClick={handleCreateOrder}
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2"
              >
                <PlusCircle size={16} />
                {t("newOrder")}
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("totalOrders")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("inProgress")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.in_transit}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("completed")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.completed}</p>
                </CardContent>
              </Card>
            </div>

            {/* Notifications and Support Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Notifications Card */}
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
                              {language === "ar"
                                ? new Date(
                                    notification.created_at
                                  ).toLocaleDateString("ar-SA")
                                : new Date(
                                    notification.created_at
                                  ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => navigate("/customer/notifications")}
                  >
                    {t("viewAllNotifications")}
                  </Button>
                </CardContent>
              </Card>

              {/* Support and Help Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("supportAndHelp")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex items-center justify-center gap-2"
                      onClick={() => navigate("/customer/support")}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>{t("contactSupport")}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex items-center justify-center gap-2"
                      onClick={() => navigate("/customer/support")}
                    >
                      <HelpCircle className="h-5 w-5" />
                      <span>{t("faq")}</span>
                    </Button>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {t("havingProblem")}
                    </p>
                    <CustomerComplaintFormModal
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

            {/* Recent Orders Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{t("recentOrders")}</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/customer/orders")}
                  >
                    {t("viewAllOrders")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeOrders.length > 0 || historyOrders.length > 0 ? (
                  <div className="space-y-4">
                    {[...activeOrders, ...historyOrders]
                      .slice(0, 5)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/customer/orders`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {t("orderNumberTitle")}: {order.order_number}
                              </p>
                              <p className="text-sm text-gray-500">
                                {language === "ar"
                                  ? new Date(
                                      order.created_at
                                    ).toLocaleDateString("ar-SA")
                                  : new Date(
                                      order.created_at
                                    ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                order.status === "completed"
                                  ? "default"
                                  : order.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {t(`status.${order.status}`)}
                            </Badge>
                            <Eye className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t("noOrdersYet")}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t("createFirstOrder")}
                    </p>
                    <Button
                      onClick={handleCreateOrder}
                      className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {t("createOrder")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  return (
    <LanguageProvider>
      <CustomerDashboardContent />
    </LanguageProvider>
  );
};

export default CustomerDashboard;
