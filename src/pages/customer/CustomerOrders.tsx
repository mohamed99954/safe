import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Clock,
  Package,
  MapPin,
  DollarSign,
  Navigation,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

const CustomerOrdersContent = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        // Fetch active orders (available, picked_up, in_transit, approaching)
        const { data: activeData, error: activeError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .in("status", ["available", "picked_up", "in_transit", "approaching"])
          .order("created_at", { ascending: false });

        if (activeError) throw activeError;

        // Fetch completed or cancelled orders
        const { data: historyData, error: historyError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", user.id)
          .in("status", ["completed", "cancelled"])
          .order("created_at", { ascending: false });

        if (historyError) throw historyError;

        // Fetch driver information for orders with drivers assigned
        const enrichActiveOrders = await Promise.all(
          (activeData || []).map(async (order) => {
            if (order.driver_id) {
              const { data: driver } = await supabase
                .from("profiles")
                .select("first_name, last_name, phone")
                .eq("id", order.driver_id)
                .single();

              return { ...order, driver };
            }
            return order;
          })
        );

        const enrichHistoryOrders = await Promise.all(
          (historyData || []).map(async (order) => {
            if (order.driver_id) {
              const { data: driver } = await supabase
                .from("profiles")
                .select("first_name, last_name, phone")
                .eq("id", order.driver_id)
                .single();

              return { ...order, driver };
            }
            return order;
          })
        );

        setActiveOrders(enrichActiveOrders || []);
        setHistoryOrders(enrichHistoryOrders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء تحميل الطلبات"
            : "Error loading orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, language]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusBadge = (status) => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
      available: "bg-gray-100 text-gray-800",
      picked_up: "bg-blue-100 text-blue-800",
      in_transit: "bg-indigo-100 text-indigo-800",
      approaching: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`${badgeClasses.base} ${
          badgeClasses[status] || badgeClasses.base
        }`}
      >
        {status === "available"
          ? t("available")
          : status === "picked_up"
          ? t("pickedUp")
          : status === "in_transit"
          ? t("inTransit")
          : status === "approaching"
          ? t("approaching")
          : status === "completed"
          ? t("completed")
          : status === "cancelled"
          ? t("cancelled")
          : status}
      </span>
    );
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      setLoading(true);

      // Update order status to completed
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Create payment statistics
      const { error: statsError } = await supabase
        .from("order_payment_stats")
        .insert({
          order_id: orderId,
          driver_percentage: 75.0,
          platform_percentage: 15.0,
          customer_percentage: 10.0,
        });

      if (statsError) throw statsError;

      toast.success(
        language === "ar"
          ? "تم تأكيد استلام الطلب بنجاح"
          : "Order delivery confirmed successfully"
      );

      // Reload orders
      window.location.reload();
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء تأكيد استلام الطلب"
          : "Error confirming order delivery"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId) => {
    setOrderToCancel(orderId);
    setShowCancelDialog(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    try {
      setLoading(true);
      setShowCancelDialog(false);

      // Update order status to cancelled
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderToCancel);

      if (orderError) throw orderError;

      toast.success(
        language === "ar"
          ? "تم إلغاء الطلب بنجاح"
          : "Order cancelled successfully"
      );

      // Reload orders
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء إلغاء الطلب"
          : "Error cancelling order"
      );
    } finally {
      setLoading(false);
      setOrderToCancel(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("orders")}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="active">{t("Active Orders")}</TabsTrigger>
              <TabsTrigger value="history">{t("Order History")}</TabsTrigger>
            </TabsList>

            <TabsContent
              value="active"
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-xl font-semibold mb-4">
                {t("Active Orders")}
              </h3>

              {/* Responsive Table Container */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-max">
                  {activeOrders.length > 0 ? (
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Order Code")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Order ID")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]`}
                          >
                            {t("orderDate")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]`}
                          >
                            {t("from")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]`}
                          >
                            {t("to")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Driver")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]`}
                          >
                            {t("Status")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activeOrders.map((order) => [
                          <tr
                            key={`${order.id}-main`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.order_id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.order_number ||
                                order.order_number?.slice(0, 8)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                              <div
                                className="truncate"
                                title={order.pickup_location?.address}
                              >
                                {order.pickup_location?.address ||
                                  (language === "ar"
                                    ? "غير محدد"
                                    : "Not specified")}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                              <div
                                className="truncate"
                                title={order.dropoff_location?.address}
                              >
                                {order.dropoff_location?.address ||
                                  (language === "ar"
                                    ? "غير محدد"
                                    : "Not specified")}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.driver
                                ? `${order.driver.first_name} ${order.driver.last_name}`
                                : language === "ar"
                                ? "لم يتم التعيين بعد"
                                : "Not assigned yet"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex gap-2">
                                {/* Cancel button - only show for available and picked_up orders */}
                                {(order.status === "available" ||
                                  order.status === "picked_up") && (
                                  <Button
                                    onClick={() => handleCancelOrder(order.id)}
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1 whitespace-nowrap"
                                  >
                                    <X className="h-4 w-4" />
                                    {t("Cancel Order")}
                                  </Button>
                                )}

                                {/* Complete order button - only show for approaching orders */}
                                {order.status === "approaching" && (
                                  <Button
                                    onClick={() =>
                                      handleCompleteOrder(order.id)
                                    }
                                    variant="default"
                                    size="sm"
                                    className="gap-1 whitespace-nowrap"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    {t("Order Received")}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>,
                          <tr key={`${order.id}-map`}>
                            <td colSpan={8} className="px-4 py-4">
                              <StaticMap
                                pickup_location={order.pickup_location?.address}
                                dropoff_location={
                                  order.dropoff_location?.address
                                }
                                driver_location={order.driver_location}
                              />
                            </td>
                          </tr>,
                        ])}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p>{t("noCurrentOrders")}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="history"
              className="bg-white p-4 rounded-lg shadow"
            >
              <h3 className="text-xl font-semibold mb-4">
                {t("Order History")}
              </h3>

              {/* Responsive Table Container */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-max">
                  {historyOrders.length > 0 ? (
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Order Code")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Order ID")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[140px]`}
                          >
                            {t("orderDate")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-${
                              language === "ar" ? "left" : "left"
                            } text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]`}
                          >
                            {t("from")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-${
                              language === "ar" ? "left" : "left"
                            } text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]`}
                          >
                            {t("to")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]`}
                          >
                            {t("Driver")}
                          </th>
                          <th
                            scope="col"
                            className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[100px]`}
                          >
                            {t("Status")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {historyOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.order_id}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.order_number ||
                                order.order_number?.slice(0, 8)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                              <div
                                className="truncate"
                                title={order.pickup_location?.address}
                              >
                                {order.pickup_location?.address ||
                                  (language === "ar"
                                    ? "غير محدد"
                                    : "Not specified")}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-[200px] truncate">
                              <div
                                className="truncate"
                                title={order.dropoff_location?.address}
                              >
                                {order.dropoff_location?.address ||
                                  (language === "ar"
                                    ? "غير محدد"
                                    : "Not specified")}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.driver
                                ? `${order.driver.first_name} ${order.driver.last_name}`
                                : language === "ar"
                                ? "غير متوفر"
                                : "Not available"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getStatusBadge(order.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p>
                        {language === "ar"
                          ? "لا يوجد سجل للطلبات السابقة"
                          : "No order history available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Confirm Order Cancellation")}</DialogTitle>
            <DialogDescription>
              {t("Cancel Order Confirmation")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setOrderToCancel(null);
              }}
            >
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmCancelOrder}>
              {t("Confirm Cancellation")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function StaticMap({ pickup_location, dropoff_location, driver_location }) {
  const [mapUrl, setMapUrl] = useState("");
  const [error, setError] = useState(null);

  const GOOGLE_MAPS_API_KEY = "AIzaSyCydsClVwciuKXIgNiAy6YL2-FL1y4B6_w";

  const marker = driver_location
    ? `color:red|driver:A|${driver_location.lat},${driver_location.lng}`
    : "";

  useEffect(() => {
    if (!pickup_location || !dropoff_location) return;

    // Create static map URL directly without fetching directions
    const staticMapUrl =
      `https://maps.googleapis.com/maps/api/staticmap?` +
      `size=624x351` +
      `&markers=color:green|label:A|${encodeURIComponent(pickup_location)}` +
      `&markers=color:red|label=B|${encodeURIComponent(dropoff_location)}` +
      (marker ? `&markers=${encodeURIComponent(marker)}` : "") +
      `&key=${GOOGLE_MAPS_API_KEY}`;

    setMapUrl(staticMapUrl);
  }, [pickup_location, dropoff_location, marker]);

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">Failed to load map</div>
    );
  }

  return mapUrl ? (
    <img
      className="mx-auto max-w-full h-auto rounded-lg shadow-md"
      src={mapUrl}
      alt="Route map"
      onError={(e) => {
        console.error("Failed to load map image");
        setError(true);
      }}
    />
  ) : null;
}

const CustomerOrders = () => {
  return (
    <LanguageProvider>
      <CustomerOrdersContent />
    </LanguageProvider>
  );
};

export default CustomerOrders;
