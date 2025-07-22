import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/components/ui/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverSidebar from "@/components/driver/DriverSidebar";
import {
  Clock,
  AlertTriangle,
  MapPin,
  RefreshCw,
  SaudiRiyal,
} from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import OrderDetailsCard from "@/components/driver/OrderDetailsCard";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LanguageProvider } from "@/components/ui/language-context";

// Move the component content to be inside a component that is used only after LanguageProvider is initialized
const DriverOrdersContent = () => {
  const { t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const [activeTab, setActiveTab] = useState("current");
  const [lastAcceptedOrderId, setLastAcceptedOrderId] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [driverSubscription, setDriverSubscription] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  // Location state
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Request location permission and start tracking
  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError(
        t("locationNotSupported") || "الموقع الجغرافي غير مدعوم في هذا المتصفح"
      );
      toast.error(
        t("locationNotSupported") || "الموقع الجغرافي غير مدعوم في هذا المتصفح"
      );
      return;
    }

    setIsRequestingLocation(true);
    setLocationError(null);

    try {
      // Request high accuracy location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      setDriverLocation(location);
      setLocationError(null);
      toast.success(
        t("locationEnabledSuccessfully") || "تم تفعيل الموقع الجغرافي بنجاح"
      );

      // Start watching position for continuous updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location watch error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 60000,
        }
      );

      setLocationWatchId(watchId);
    } catch (error: unknown) {
      console.error("Location request error:", error);
      let errorMessage =
        t("locationRequestFailed") || "فشل في الحصول على الموقع الجغرافي";

      if (error && typeof error === "object" && "code" in error) {
        const geoError = error as GeolocationPositionError;
        switch (geoError.code) {
          case 1: // PERMISSION_DENIED
            errorMessage =
              t("locationPermissionDenied") ||
              "تم رفض الإذن للوصول للموقع الجغرافي";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage =
              t("locationUnavailable") || "الموقع الجغرافي غير متاح";
            break;
          case 3: // TIMEOUT
            errorMessage =
              t("locationTimeout") || "انتهت مهلة الحصول على الموقع الجغرافي";
            break;
        }
      }

      setLocationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRequestingLocation(false);
    }
  }, [t]);

  // Auto-request location on component mount
  useEffect(() => {
    if (user?.id && !driverLocation && !locationError) {
      requestLocation();
    }

    // Cleanup location watch on unmount
    return () => {
      if (locationWatchId) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [
    user?.id,
    driverLocation,
    locationError,
    locationWatchId,
    requestLocation,
  ]);

  // Fetch driver's current availability status on component mount
  useEffect(() => {
    const fetchDriverStatus = async () => {
      if (!user?.id) return;

      try {
        const { data: driverData, error } = await supabase
          .from("drivers")
          .select("is_available, status")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching driver status:", error);
          return;
        }

        if (driverData) {
          // Only set available if driver is approved
          setIsAvailable(
            driverData.status === "approved" && driverData.is_available === true
          );
        }
      } catch (err) {
        console.error("Error in fetchDriverStatus:", err);
      }
    };

    fetchDriverStatus();
  }, [user?.id]);

  // Add this function to check driver subscription
  const checkDriverSubscription = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: driverData, error } = await supabase
        .from("drivers")
        .select(
          "subscription_status, subscription_expires_at, subscription_plan, subscription_amount"
        )
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching subscription:", error);
        return;
      }

      // Check if subscription is active and not expired
      const isSubscriptionActive =
        driverData?.subscription_status === "active" &&
        driverData?.subscription_expires_at &&
        new Date(driverData.subscription_expires_at) > new Date();

      setDriverSubscription({
        ...driverData,
        isActive: isSubscriptionActive,
      });
    } catch (err) {
      console.error("Error checking subscription:", err);
    }
  }, [user?.id]);

  // Add useEffect to check subscription on mount
  useEffect(() => {
    checkDriverSubscription();
  }, [user?.id, checkDriverSubscription]);

  // Update driver availability when toggle changes
  const updateDriverAvailability = async (newAvailability: boolean) => {
    if (!user?.id || updatingAvailability) return;

    setUpdatingAvailability(true);

    try {
      // First check if driver is approved
      const { data: driverCheck, error: checkError } = await supabase
        .from("drivers")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking driver status:", checkError);
        toast.error(
          t("errorCheckingDriverStatus") || "خطأ في التحقق من حالة السائق"
        );
        setUpdatingAvailability(false);
        return;
      }

      if (!driverCheck || driverCheck.status !== "approved") {
        toast.error(
          t("driverNotApproved") ||
            "يجب الموافقة على حسابك من قبل الإدارة أولاً"
        );
        setIsAvailable(false);
        setUpdatingAvailability(false);
        return;
      }

      // Update availability
      const { error: updateError } = await supabase
        .from("drivers")
        .update({
          is_available: newAvailability,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating driver availability:", updateError);
        toast.error(
          t("errorUpdatingAvailability") || "خطأ في تحديث حالة التوفر"
        );
        // Revert the state
        setIsAvailable(!newAvailability);
      } else {
        setIsAvailable(newAvailability);
        toast.success(
          newAvailability
            ? t("nowAvailableForOrders") || "أنت متاح الآن لاستلام الطلبات"
            : t("nowNotAvailableForOrders") || "أنت غير متاح لاستلام الطلبات"
        );
      }
    } catch (err) {
      console.error("Error in updateDriverAvailability:", err);
      toast.error(t("errorUpdatingAvailability") || "خطأ في تحديث حالة التوفر");
      // Revert the state
      setIsAvailable(!newAvailability);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  // Add subscription creation function
  const createSubscription = async (planType: string) => {
    // Set the appropriate loading state based on plan type
    if (planType === "monthly") {
      setMonthlyLoading(true);
    } else {
      setYearlyLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-driver-subscription",
        {
          body: {
            driverId: user.id,
            planType: planType,
          },
        }
      );

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Redirect to payment
      window.location.href = data.paymentUrl;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "خطأ في إنشاء الاشتراك";
      toast.error(errorMessage);
    } finally {
      // Reset the appropriate loading state
      if (planType === "monthly") {
        setMonthlyLoading(false);
      } else {
        setYearlyLoading(false);
      }
    }
  };

  const handleAvailabilityToggle = () => {
    if (updatingAvailability) return;

    // Check subscription before allowing availability toggle
    if (!driverSubscription?.isActive) {
      setShowSubscriptionModal(true);
      return;
    }

    const newAvailability = !isAvailable;
    updateDriverAvailability(newAvailability);
  };

  const availableOrders = Array.isArray(orders)
    ? orders.filter(
        (order) => !order.driver_id && order.status === "available" && order.id
      )
    : [];

  const currentOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.driver_id === user?.id &&
          ["picked_up", "in_transit", "approaching"].includes(order.status) &&
          order.id
      )
    : [];

  const completedOrders = Array.isArray(orders)
    ? orders.filter(
        (order) =>
          order.driver_id === user?.id &&
          order.status === "completed" &&
          order.id
      )
    : [];

  useEffect(() => {
    if (currentOrders.length > 0) {
      setActiveTab("current");
      setLastAcceptedOrderId(null);
    }
  }, [currentOrders.length]);

  const handleAcceptOrder = async (id: string) => {
    if (isProcessing) {
      return;
    }

    if (!user?.id) {
      toast.error(
        t("mustLoginToAcceptOrder") || "يجب تسجيل الدخول لقبول الطلب"
      );
      return;
    }

    setIsProcessing(true);

    try {
      const { data: orderCheck, error: checkError } = await supabase
        .from("orders")
        .select("id, status, driver_id")
        .eq("id", id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking order status:", checkError);
        toast.error(
          t("errorCheckingOrderStatus") || "حدث خطأ أثناء التحقق من حالة الطلب"
        );
        return;
      }

      if (!orderCheck) {
        console.error("Order not found in database");
        toast.error(t("orderNotFound") || "لم يتم العثور على الطلب");
        return;
      }

      if (orderCheck.status !== "available" || orderCheck.driver_id) {
        console.error(
          "Order is no longer available for acceptance",
          orderCheck
        );
        toast.error(
          t("orderNoLongerAvailable") || "هذا الطلب لم يعد متاحاً للقبول"
        );
        return;
      }

      const { data: updateData, error: updateError } = await supabase
        .from("orders")
        .update({
          driver_id: user.id,
          status: "picked_up",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (updateError) {
        console.error("Error accepting order:", updateError);
        toast.error(t("errorAcceptingOrder") || "حدث خطأ أثناء قبول الطلب");
        return;
      }

      if (!updateData || updateData.length === 0) {
        console.error("No data returned from update operation");
        toast.error(
          t("errorAcceptingOrderNoData") ||
            "حدث خطأ أثناء قبول الطلب - لم يتم العثور على الطلب"
        );
        return;
      }

      toast.success(
        t("orderAcceptedSuccessfully") ||
          `تم قبول الطلب رقم ${id.substring(0, 8)} بنجاح`
      );
      setLastAcceptedOrderId(id);

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      await refetch();

      setActiveTab("current");
    } catch (err) {
      console.error("Error accepting order:", err);
      toast.error(t("errorAcceptingOrder") || "حدث خطأ أثناء قبول الطلب");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t("loadingOrders") || "جاري تحميل الطلبات..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DriverSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              {t("errorLoadingOrders") || "خطأ في تحميل الطلبات"}
            </p>
            <Button onClick={() => refetch()}>
              {t("tryAgain") || "حاول مرة أخرى"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {t("manageOrders")}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      driverLocation
                        ? "bg-green-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <MapPin
                    className={`h-4 w-4 ${
                      driverLocation ? "text-green-600" : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      driverLocation ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {driverLocation
                      ? t("locationActive") || "الموقع نشط"
                      : t("locationInactive") || "الموقع غير نشط"}
                  </span>
                  {!driverLocation && !isRequestingLocation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={requestLocation}
                      className="text-xs px-3 py-1 border-safedrop-gold text-safedrop-gold hover:bg-safedrop-gold hover:text-white transition-colors"
                    >
                      <RefreshCw className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
                      {t("enableLocation") || "تفعيل الموقع"}
                    </Button>
                  )}
                  {isRequestingLocation && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-3 w-3 border-2 border-safedrop-gold border-t-transparent rounded-full"></div>
                      <span className="text-xs text-safedrop-gold font-medium">
                        {t("locating") || "جاري التحديد"}...
                      </span>
                    </div>
                  )}
                </div>

                {/* Availability Toggle */}
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {t("availabilityStatus") || "حالة التوفر"}:
                  </span>
                  <div
                    className={`relative h-7 w-14 cursor-pointer rounded-full transition-all duration-300 shadow-inner ${
                      updatingAvailability
                        ? "bg-gray-300 cursor-not-allowed"
                        : isAvailable
                        ? "bg-gradient-to-r from-safedrop-gold to-amber-500 shadow-safedrop-gold/30"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    onClick={handleAvailabilityToggle}
                  >
                    <div
                      className={`absolute transition-all duration-300 h-5 w-5 top-1 rounded-full bg-white shadow-lg ${
                        isAvailable
                          ? "right-1 rtl:left-1 rtl:right-auto"
                          : "left-1 rtl:right-1 rtl:left-auto"
                      } ${
                        isAvailable
                          ? "shadow-safedrop-gold/40"
                          : "shadow-gray-400/40"
                      }`}
                    />
                    {updatingAvailability && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      isAvailable ? "text-safedrop-gold" : "text-gray-500"
                    }`}
                  >
                    {isAvailable
                      ? t("availableForOrders") || "متاح للطلبات"
                      : t("notAvailableForOrders") || "غير متاح"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Subscription status indicator */}
        {driverSubscription?.isActive && (
          <div className="bg-gradient-to-r from-safedrop-gold/10 to-amber-50 border border-safedrop-gold/30 p-3 mx-4 mt-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 text-safedrop-gold">
              <div className="w-8 h-8 bg-safedrop-gold rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {t("subscriptionActive") || "الاشتراك نشط"}
                </div>
                <div className="text-xs text-gray-600">
                  {t("plan") || "الخطة"}:{" "}
                  {driverSubscription.subscription_plan === "monthly"
                    ? t("monthly") || "شهري"
                    : t("yearly") || "سنوي"}{" "}
                  • {t("expiresOn") || "ينتهي في"}{" "}
                  {new Date(
                    driverSubscription.subscription_expires_at
                  ).toLocaleDateString(
                    t("locale") === "en" ? "en-US" : "ar-SA"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location Error Alert */}
        {locationError && (
          <div className="bg-red-50 border border-red-200 p-4 mx-4 mt-4 rounded-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">
                  {t("locationError") || "خطأ في الموقع الجغرافي"}
                </h3>
                <div className="text-red-700 text-sm whitespace-pre-line leading-relaxed">
                  {locationError}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={requestLocation}
                    disabled={isRequestingLocation}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    {t("retry") || "إعادة المحاولة"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {t("refreshPage") || "تحديث الصفحة"}
                  </Button>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-xs">
                  <strong>
                    {t("howToEnableLocation") || "كيفية تفعيل الموقع:"}{" "}
                  </strong>
                  <br />•{" "}
                  {t("clickLockIcon") ||
                    "اضغط على أيقونة القفل 🔒 في شريط العنوان"}
                  <br />•{" "}
                  {t("chooseAllowLocation") || "اختر السماح للموقع الجغرافي"}
                  <br />• {t("refreshPage") || "اضغط تحديث الصفحة أدناه"}
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-3 mb-6 h-auto">
                <TabsTrigger
                  value="current"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-2"
                >
                  <span className="hidden sm:inline">
                    {t("currentOrdersTab")}
                  </span>
                  <span className="sm:hidden">
                    {t("currentOrdersTabShort")}
                  </span>
                  <span className="ml-1 rtl:mr-1">
                    ({currentOrders.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="available"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-2"
                >
                  <span className="hidden sm:inline">
                    {t("availableOrdersTab")}
                  </span>
                  <span className="sm:hidden">
                    {t("availableOrdersTabShort")}
                  </span>
                  <span className="ml-1 rtl:mr-1">
                    ({availableOrders.length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-2"
                >
                  <span className="hidden sm:inline">
                    {t("completedOrdersTab")}
                  </span>
                  <span className="sm:hidden">
                    {t("completedOrdersTabShort")}
                  </span>
                  <span className="ml-1 rtl:mr-1">
                    ({completedOrders.length})
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  {t("currentOrdersTab")}
                </h3>
                {currentOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">
                        {t("noCurrentOrders") || "لا توجد طلبات حالية"}
                      </p>
                      <Button
                        variant="default"
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={() => setActiveTab("available")}
                      >
                        {t("browseAvailableOrders")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentOrders.map((order) => (
                    <OrderDetailsCard
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="available" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  {t("availableOrdersTab")}
                </h3>
                {!isAvailable ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                      <p className="text-gray-600 mb-4">
                        {t("notAvailableMessage")}
                      </p>
                      <Button
                        variant="default"
                        className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                        onClick={handleAvailabilityToggle}
                        disabled={updatingAvailability}
                      >
                        {updatingAvailability
                          ? t("updating") || "جاري التحديث..."
                          : t("changeToAvailable")}
                      </Button>
                    </div>
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">{t("noAvailableOrders")}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => refetch()}
                      >
                        {t("refreshOrders") || "تحديث الطلبات"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  availableOrders.map((order) => (
                    <OrderDetailsCard
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                      showAcceptButton={true}
                      onAcceptOrder={handleAcceptOrder}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  {t("completedOrdersTab")}
                </h3>
                {completedOrders.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">
                        {t("noCompletedOrders") || "لا توجد طلبات مكتملة"}
                      </p>
                    </div>
                  </div>
                ) : (
                  completedOrders.map((order) => (
                    <OrderDetailsCard
                      key={order.id}
                      order={order}
                      onOrderUpdate={refetch}
                      driverLocation={driverLocation}
                      showCompleteButton={false}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="bg-gradient-to-r from-safedrop-gold to-amber-500 p-6 rounded-t-2xl text-white">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    🚗
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center">
                  {t("driverSubscriptionRequired") || "اشتراك السائق مطلوب"}
                </h3>
                <p className="text-center text-white/90 text-sm mt-2">
                  {t("subscriptionRequiredMessage") ||
                    "يجب الاشتراك أولاً لتتمكن من قبول الطلبات وتفعيل حالة التوفر"}
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {/* Monthly Plan */}
                  <div className="relative group">
                    <div className="border-2 border-blue-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-700 text-lg">
                            {t("monthlySubscription") || "الاشتراك الشهري"}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {t("onePaymentFor30Days") ||
                              "دفعة واحدة لمدة 30 يوم"}
                          </p>
                        </div>
                        <div className="text-right ltr:text-left">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-blue-700">
                              69
                            </span>
                            <span className="text-sm text-black font-medium">
                              {/* {t("currency") || "ريال"} */}
                              <SaudiRiyal className="w-6 h-6" />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✅</span>
                          <span>
                            {t("unlimitedOrderAcceptance") ||
                              "قبول طلبات غير محدودة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✅</span>
                          <span>{t("support24_7") || "دعم فني 24/7"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✅</span>
                          <span>
                            {t("earningsAnalytics") || "تحليلات الأرباح"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => createSubscription("monthly")}
                        disabled={monthlyLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        {monthlyLoading
                          ? t("loading") || "جاري التحميل..."
                          : t("subscribeMonthly") || "اشترك شهرياً"}
                      </Button>
                    </div>
                  </div>

                  {/* Yearly Plan - Recommended */}
                  <div className="relative group">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-safedrop-gold to-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                      {t("save47Percent") || "وفر 328"}
                      <SaudiRiyal className="w-5 h-5 inline" /> (47%)
                    </div>
                    <div className="border-2 border-safedrop-gold hover:border-amber-500 rounded-xl p-4 pt-6 transition-all duration-200 hover:shadow-xl bg-gradient-to-br from-amber-50 to-safedrop-gold/10 relative">
                      <div className="absolute -top-3 right-2 ltr:left-2 ltr:right-auto">
                        <span className="bg-safedrop-gold text-white text-xs px-2 py-1 rounded-full font-bold">
                          {t("recommended") || "الأفضل"}
                        </span>
                      </div>

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-safedrop-gold text-lg">
                            {t("yearlySubscription") || "الاشتراك السنوي"}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {t("onePaymentFor365Days") ||
                              "دفعة واحدة لمدة 365 يوم"}
                          </p>
                        </div>
                        <div className="text-right ltr:text-left">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-safedrop-gold">
                              500
                            </span>
                            <span className="text-sm text-black font-medium">
                              <SaudiRiyal className="w-6 h-6" />
                            </span>
                          </div>
                          <div className="text-xs text-safedrop-gold font-semibold mt-1">
                            {t("insteadOf828") || "بدلاً من 828 ريال"}{" "}
                            <SaudiRiyal className="w-5 h-5 inline" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✅</span>
                          <span>
                            {t("unlimitedOrderAcceptance") ||
                              "قبول طلبات غير محدودة"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✅</span>
                          <span>
                            {t("premiumSupport24_7") || "دعم فني مميز 24/7"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="text-green-500">✅</span>
                          <span>
                            {t("advancedEarningsAnalytics") ||
                              "تحليلات متقدمة للأرباح"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-safedrop-gold">
                          <span>💰</span>
                          <span>
                            {t("bestValueForMoney") || "أفضل قيمة مقابل المال"}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => createSubscription("yearly")}
                        disabled={yearlyLoading}
                        className="w-full bg-safedrop-gold hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
                      >
                        {yearlyLoading
                          ? t("loading") || "جاري التحميل..."
                          : t("subscribeYearlyAndSave") || "اشترك سنوياً ووفر"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubscriptionModal(false)}
                    className="w-full border-gray-300 py-3 rounded-lg font-medium"
                    disabled={monthlyLoading || yearlyLoading}
                  >
                    {t("cancel") || "إلغاء"}
                  </Button>

                  <div className="text-center mt-4 space-y-1">
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
                      <span>💳</span>
                      <span>
                        {t("securePaymentViaPaylink") || "دفع آمن عبر Paylink"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {t("noAutoRenewal") || "بدون تجديد تلقائي"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// The main component exported from this file
const DriverOrders = () => {
  return (
    <LanguageProvider>
      <DriverOrdersContent />
    </LanguageProvider>
  );
};

export default DriverOrders;
