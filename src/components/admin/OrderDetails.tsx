import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { useLanguage } from "@/components/ui/language-context";

interface OrderDetailsProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export function OrderDetails({
  order,
  isOpen,
  onClose,
  onStatusUpdate,
}: OrderDetailsProps) {
  const { t, language } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "available":
        return {
          text: t("available"),
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "completed":
        return {
          text: t("completed"),
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "picked_up":
        return {
          text: t("pickedUp"),
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "approaching":
        return {
          text: t("approaching"),
          className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
      case "in_transit":
        return {
          text: t("inTransit"),
          className: "bg-orange-100 text-orange-800 border-orange-200",
        };
      case "delivered":
        return {
          text: t("delivered"),
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "cancelled":
        return {
          text: t("cancelled"),
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "pending":
        return {
          text: t("pending"),
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      default:
        return {
          text: status || t("notSpecified"),
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    setIsUpdating(true);
    try {
      // Check if order is valid and has an ID
      if (!order?.id) {
        throw new Error(t("invalidOrderId"));
      }

      // First, check if the order exists
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("id", order.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking order existence:", checkError);
        throw checkError;
      }

      if (!existingOrder) {
        throw new Error(t("orderNotFound"));
      }

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }

      toast.success(t("orderUpdatedSuccessfully"));
      onStatusUpdate(); // Update orders list
      onClose(); // Close dialog
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(`${t("errorUpdatingOrder")}: ${error.message || ""}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t("notAvailable");

    const locale = language === "ar" ? "ar-SA" : "en-US";
    return new Date(dateString).toLocaleString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if order data exists
  const isOrderValid = Boolean(order && order.id);

  if (!isOrderValid) return null;

  // Safely extract location data
  const pickupAddress =
    order?.pickup_location?.formatted_address ||
    order?.pickup_location?.address ||
    t("notSpecified");
  const pickupDetails =
    order?.pickup_location?.additional_details || t("noAdditionalDetails");
  const dropoffAddress =
    order?.dropoff_location?.formatted_address ||
    order?.dropoff_location?.address ||
    t("notSpecified");
  const dropoffDetails =
    order?.dropoff_location?.additional_details || t("noAdditionalDetails");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">
            {t("orderDetailsTitle")} #
            {order.order_number?.substring(0, 8) || t("unknown")}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {t("customerInformation")}
            </h3>
            {order.customer ? (
              <div className="space-y-2">
                <p className="text-gray-700">
                  {t("customerName")}: {order.customer.first_name}{" "}
                  {order.customer.last_name}
                </p>
                <p className="text-gray-700">
                  {t("customerPhone")}:{" "}
                  {order.customer.phone || t("notAvailable")}
                </p>
              </div>
            ) : (
              <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-md">
                <Info className="h-4 w-4 mr-2" />
                <span>{t("customerInfoNotAvailable")}</span>
              </div>
            )}
          </div>

          {/* Order Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("orderStatus")}</h3>
            <div className="space-y-2">
              <Badge
                variant="outline"
                className={getStatusDisplay(order.status).className}
              >
                {getStatusDisplay(order.status).text}
              </Badge>

              {order.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleStatusChange("approved")}
                    disabled={isUpdating}
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? t("processing") : t("acceptOrder")}
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("rejected")}
                    disabled={isUpdating}
                    variant="destructive"
                  >
                    {isUpdating ? t("processing") : t("rejectOrder")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pickup Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">{t("pickupInformation")}</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{t("address")}:</p>
              <p className="text-gray-600">{pickupAddress}</p>
              <p className="font-medium mt-2">{t("additionalDetails")}:</p>
              <p className="text-gray-600">{pickupDetails}</p>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-semibold text-lg">
              {t("deliveryInformation")}
            </h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{t("address")}:</p>
              <p className="text-gray-600">{dropoffAddress}</p>
              <p className="font-medium mt-2">{t("additionalDetails")}:</p>
              <p className="text-gray-600">{dropoffDetails}</p>
            </div>
          </div>

          {/* Package Details */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">
              {t("packageDetails")}
            </h3>
            <p className="text-gray-600">
              {order.package_details || t("noPackageDetails")}
            </p>
          </div>

          {/* Driver Notes */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">{t("driverNotes")}</h3>
            <p className="text-gray-600">{order.notes || t("noNotes")}</p>
          </div>

          {/* Payment Information */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">
              {t("paymentInformation")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">{t("amount")}:</p>
                <p className="font-medium">
                  {order.price
                    ? `${order.price} ${t("currency")}`
                    : t("notSpecified")}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">
                  {t("paymentMethod")}:
                </p>
                <p className="font-medium">
                  {order.payment_method || t("notSpecified")}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500 mb-1">
                  {t("paymentStatus")}:
                </p>
                <Badge
                  variant="outline"
                  className={
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : order.payment_status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }
                >
                  {order.payment_status === "paid"
                    ? t("paid")
                    : order.payment_status === "pending"
                    ? t("unpaid")
                    : order.payment_status}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
