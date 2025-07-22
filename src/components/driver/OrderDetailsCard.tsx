import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CheckIcon,
  Loader2Icon,
  Package,
  Truck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OrderStatusUpdater from "./OrderStatusUpdater";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "../ui/language-context";

interface OrderDetailsCardProps {
  order: any;
  onOrderUpdate: () => void;
  driverLocation?: { lat: number; lng: number } | null;
  showCompleteButton?: boolean;
  showAcceptButton?: boolean;
  onAcceptOrder?: (orderId: string) => Promise<void>;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({
  order,
  onOrderUpdate,
  driverLocation,
  showCompleteButton = true,
  showAcceptButton = false,
  onAcceptOrder,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [distance, setDistance] = useState("-");
  const [duration, setDuration] = useState("-");

  // Fetch customer data if not already present
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (order.customer) {
        setCustomerData(order.customer);
        return;
      }

      if (!order.customer_id) {
        console.log("No customer_id in order:", order.id);
        return;
      }

      setLoadingCustomer(true);
      try {
        const { data: customer, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, phone, email")
          .eq("id", order.customer_id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching customer data:", error);
          return;
        }

        if (customer) {
          setCustomerData(customer);
        } else {
          console.log("No customer found for ID:", order.customer_id);
        }
      } catch (err) {
        console.error("Error in fetchCustomerData:", err);
      } finally {
        setLoadingCustomer(false);
      }
    };

    fetchCustomerData();
  }, [order.customer_id, order.customer]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      language === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  useEffect(() => {
    if (!driverLocation) return;

    const origin = `${driverLocation.lat},${driverLocation.lng}`;
    const destination = order.pickup_location.address;

    const languageParam = language === "ar" ? "ar" : "en";

    fetch(
      `/google-api/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )},SA&mode=driving&language=${languageParam}&key=AIzaSyCydsClVwciuKXIgNiAy6YL2-FL1y4B6_w`
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "OK") {
          setDistance(res.routes[0].legs[0].distance.text);
          setDuration(res.routes[0].legs[0].duration.text);
        }
      })
      .catch((error) => console.log("error", error));
  }, [driverLocation, language, order.pickup_location.address]);

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "picked_up":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "in_transit":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "approaching":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return null;
      case "picked_up":
        return <Package className="h-3 w-3 mr-1" />;
      case "in_transit":
        return <Truck className="h-3 w-3 mr-1" />;
      case "approaching":
        return <MapPinIcon className="h-3 w-3 mr-1" />;
      case "completed":
        return <CheckIcon className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const handleContactCustomer = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error(t("phoneNotAvailable"));
    }
  };

  const handleCompleteOrder = async () => {
    if (!user || (order.driver_id && order.driver_id !== user.id)) {
      toast.error(t("cantModifyOrder"));
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "completed",
          actual_delivery_time: new Date().toISOString(),
        })
        .eq("id", order.id)
        .eq("driver_id", user.id)
        .select();

      if (error) {
        console.error("Error completing order:", error);
        toast.error(t("errorUpdatingOrder"));
        return;
      }

      if (!data || data.length === 0) {
        console.error("No data returned from update operation");
        toast.error(t("orderNotFoundError"));
        return;
      }

      toast.success(t("orderDelivered"));
      onOrderUpdate();
    } catch (err) {
      console.error("Error completing order:", err);
      toast.error(t("errorUpdatingOrder"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptClick = async (orderId: string) => {
    if (!onAcceptOrder) return;

    setIsAccepting(true);
    try {
      await onAcceptOrder(orderId);
    } finally {
      setIsAccepting(false);
    }
  };

  const getLocationAddress = (location: any) => {
    if (!location) return t("notSpecified");

    if (location.address) return location.address;
    if (location.formatted_address) return location.formatted_address;
    if (typeof location === "string") return location;

    if (typeof location === "object") {
      if (location.name) return location.name;
      if (location.description) return location.description;
    }

    return t("notSpecified");
  };

  const getLocationDetails = (location: any) => {
    if (!location || !location.details) return null;
    return location.details;
  };

  // Use customerData from state (fetched if needed) or fallback to order.customer
  const customer = customerData || order.customer;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>{t("orderId")}</span>
            {order.order_number || order.number}
          </CardTitle>
          <Badge
            variant="outline"
            className={`${getStatusColor(
              order.status
            )} flex items-center gap-1`}
          >
            {getStatusIcon(order.status)}
            {getStatusLabel(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{t("customerInfo")}</p>
            {loadingCustomer ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">
                  {t("loadingOrders")}
                </span>
              </div>
            ) : customer ? (
              <>
                <p className="font-medium">
                  {`${customer.first_name || ""} ${
                    customer.last_name || ""
                  }`.trim() || t("unknown")}
                </p>
                {customer.phone && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <PhoneIcon className="h-3 w-3" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="font-medium text-gray-500">{t("unknown")}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t("orderTime")}</p>
            <p className="font-medium">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{t("pickupPoint")}</p>
              <p className="font-medium">
                {getLocationAddress(order.pickup_location)}
              </p>
              {getLocationDetails(order.pickup_location) && (
                <p className="text-sm text-gray-600 mt-1">
                  {getLocationDetails(order.pickup_location)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-3 w-3 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">{t("dropoffPoint")}</p>
              <p className="font-medium">
                {getLocationAddress(order.dropoff_location)}
              </p>
              {getLocationDetails(order.dropoff_location) && (
                <p className="text-sm text-gray-600 mt-1">
                  {getLocationDetails(order.dropoff_location)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-sm text-gray-500">{t("distance")}</p>
            <p className="font-medium">
              {order.estimated_distance
                ? `${order.estimated_distance} km`
                : distance}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-sm text-gray-500">{t("estimatedTime")}</p>
            <p className="font-medium">
              {order.estimated_duration
                ? `${order.estimated_duration} min`
                : duration}
            </p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-sm text-gray-500">{t("amount")}</p>
            <p className="font-medium">
              {order.price
                ? `${order.price} ${t("currency")}`
                : t("notSpecified")}
            </p>
          </div>
        </div>

        {order.package_details && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{t("packageDetails")}</p>
            <p className="bg-gray-50 p-2 rounded">{order.package_details}</p>
          </div>
        )}

        {order.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">{t("notes")}</p>
            <p className="bg-gray-50 p-2 rounded">{order.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">{t("amount")}:</p>
            <p className="font-semibold text-lg">
              {order.price
                ? `${order.price} ${t("currency")}`
                : t("notSpecified")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {customer?.phone && (
              <Button
                variant="outline"
                onClick={() => handleContactCustomer(customer.phone)}
                className="flex items-center gap-1"
                disabled={isUpdating || isAccepting}
              >
                <PhoneIcon className="h-4 w-4" />
                <span>{t("contactCustomer")}</span>
              </Button>
            )}

            {showAcceptButton &&
              onAcceptOrder &&
              order.status === "available" && (
                <Button
                  variant="default"
                  className="bg-safedrop-gold hover:bg-safedrop-gold/90"
                  onClick={() => handleAcceptClick(order.id)}
                  disabled={isUpdating || isAccepting}
                >
                  {isAccepting ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin mr-1" />
                      <span>{t("pickingUp")}</span>
                    </>
                  ) : (
                    <span>{t("pickupOrder")}</span>
                  )}
                </Button>
              )}
          </div>
        </div>

        {order.status !== "completed" && order.driver_id && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">
              {t("updateOrderStatus")}
            </p>
            <OrderStatusUpdater
              orderId={order.id}
              currentStatus={order.status}
              driverLocation={driverLocation}
              onStatusUpdated={onOrderUpdate}
              driverId={order.driver_id}
            />

            {/* Adding a status message when the order is in "approaching" status */}
            {order.status === "approaching" && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-700 text-center">
                <ClockIcon className="h-5 w-5 mx-auto mb-1" />
                <p className="font-medium">{t("waitingForCustomer")}</p>
                <p className="text-sm mt-1">{t("orderCompleteMessage")}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;
