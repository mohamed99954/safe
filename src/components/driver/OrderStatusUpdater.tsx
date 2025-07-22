import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Truck,
  Clock,
  Loader2,
  AlertCircle,
  Package,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import { useLanguage } from "../ui/language-context";
type OrderStatus =
  | "available"
  | "picked_up"
  | "in_transit"
  | "approaching"
  | "completed"
  | "cancelled";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  driverLocation?: { lat: number; lng: number } | null;
  onStatusUpdated?: () => void;
  driverId?: string | null;
}

const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({
  orderId,
  currentStatus,
  driverLocation,
  onStatusUpdated,
  driverId,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(
    null
  );
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    // Reset error state
    setErrorMessage(null);

    if (!orderId) {
      toast.error(t("status.invalid_order_id") || "معرف الطلب غير صحيح");
      return;
    }

    // Validate that the current user is logged in
    if (!user) {
      toast.error(t("status.login_required") || "يجب تسجيل الدخول أولاً");
      return;
    }

    // Check if user is authorized for this order
    if (driverId && driverId !== user.id) {
      setErrorMessage(
        t("status.unauthorized_order") || "غير مخول لتحديث هذا الطلب"
      );
      toast.error(
        t("status.unauthorized_order") || "غير مخول لتحديث هذا الطلب"
      );
      return;
    }

    // Check for location requirement with better UX
    if (!driverLocation) {
      setErrorMessage(
        t("status.no_location") ||
          "يرجى تفعيل الموقع الجغرافي لتحديث حالة الطلب"
      );
      toast.error(
        t("status.no_location") ||
          "يرجى تفعيل الموقع الجغرافي لتحديث حالة الطلب"
      );
      return;
    }

    setIsUpdating(true);
    setUpdatingStatus(newStatus);

    try {
      const orderUpdate: any = {
        status: newStatus,
        driver_location: driverLocation,
        updated_at: new Date().toISOString(),
      };

      // إذا كانت هذه أول عملية التقاط، قم بتعيين السائق للطلب
      if (currentStatus === "available" && newStatus === "picked_up") {
        orderUpdate.driver_id = user.id;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(orderUpdate)
        .eq("id", orderId)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error(
          t("status.order_update_failed") || "فشل تحديث حالة الطلب"
        );
      }

      let statusMessage = "";
      switch (newStatus) {
        case "picked_up":
          statusMessage = t("status.picked_up") || "تم الاستلام";
          break;
        case "in_transit":
          statusMessage = t("status.in_transit") || "في الطريق";
          break;
        case "approaching":
          statusMessage = t("status.approaching") || "يقترب";
          break;
      }

      toast.success(
        `${t("status.order_updated") || "تم تحديث الطلب"} - ${statusMessage}`
      );

      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      setErrorMessage(
        error.message ||
          t("status.order_update_failed") ||
          "فشل تحديث حالة الطلب"
      );
      toast.error(
        `${t("status.order_update_failed") || "فشل تحديث حالة الطلب"}: ${
          error.message || ""
        }`
      );
    } finally {
      setIsUpdating(false);
      setUpdatingStatus(null);
    }
  };

  const isCompleted = currentStatus === "completed";
  const isDriverAuthorized = !driverId || driverId === user?.id;
  const hasLocation = !!driverLocation;

  // Button is disabled if: updating, completed, not authorized, or no location
  const buttonDisabled =
    isUpdating || isCompleted || !isDriverAuthorized || !hasLocation;

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Location Status Indicator */}
      {!hasLocation && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4" />
          <span>
            {t("status.location_required") ||
              "يتطلب تفعيل الموقع الجغرافي لتحديث حالة الطلب"}
          </span>
        </div>
      )}

      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:space-x-reverse">
        {currentStatus === "available" && (
          <Button
            variant="outline"
            onClick={() => updateOrderStatus("picked_up")}
            disabled={buttonDisabled}
            className="gap-1"
            title={!hasLocation ? "يجب تفعيل الموقع الجغرافي أولاً" : ""}
          >
            {isUpdating && updatingStatus === "picked_up" ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Package className="h-4 w-4 ml-1" />
            )}
            {t("status.picked_up") || "تم الاستلام"}
          </Button>
        )}

        {currentStatus === "picked_up" && (
          <Button
            variant="default"
            onClick={() => updateOrderStatus("in_transit")}
            disabled={buttonDisabled}
            className="gap-1"
            title={!hasLocation ? "يجب تفعيل الموقع الجغرافي أولاً" : ""}
          >
            {isUpdating && updatingStatus === "in_transit" ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Truck className="h-4 w-4 ml-1" />
            )}
            {t("status.in_transit") || "في الطريق"}
          </Button>
        )}

        {currentStatus === "in_transit" && (
          <Button
            variant="default"
            onClick={() => updateOrderStatus("approaching")}
            disabled={buttonDisabled}
            className="gap-1"
            title={!hasLocation ? "يجب تفعيل الموقع الجغرافي أولاً" : ""}
          >
            {isUpdating && updatingStatus === "approaching" ? (
              <Loader2 className="h-4 w-4 ml-1 animate-spin" />
            ) : (
              <Clock className="h-4 w-4 ml-1" />
            )}
            {t("status.approaching") || "يقترب"}
          </Button>
        )}

        {currentStatus === "approaching" && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
            {t("status.approaching") || "يقترب من الوجهة"}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusUpdater;
