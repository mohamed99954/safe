import React, { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { LoaderIcon } from "lucide-react";
import { useLoadScript, GoogleMap, MarkerF } from "@react-google-maps/api";
import { Badge } from "@/components/ui/badge";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

const MyOrdersContent = () => {
  const { data: orders, isLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { t, language } = useLanguage();

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-full">
            <LoaderIcon className="animate-spin" />
            <span className="ml-2">{t("loading")}</span>
          </div>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    let badgeColor: "default" | "destructive" | "outline" | "secondary" =
      "default";

    switch (status) {
      case "available":
        badgeColor = "default";
        break;
      case "picked_up":
        badgeColor = "secondary";
        break;
      case "in_transit":
        badgeColor = "default";
        break;
      case "approaching":
        badgeColor = "default";
        break;
      case "completed":
        badgeColor = "default";
        break;
      case "cancelled":
        badgeColor = "destructive";
        break;
      default:
        break;
    }

    return (
      <Badge variant={badgeColor}>
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
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      language === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("orders")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4">
            {isLoading ? (
              <Card className="p-4">
                <div className="flex justify-center items-center">
                  <LoaderIcon className="animate-spin" />
                  <span className="ml-2">{t("loading")}</span>
                </div>
              </Card>
            ) : orders && orders.length > 0 ? (
              orders.map((order: any) => (
                <Card
                  key={order.order_id}
                  className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {t("order")} {order.order_number}
                      </h2>
                      <p className="text-gray-500">
                        {t("orderDate")}: {formatDate(order.created_at)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-sm mt-2 text-gray-600">
                    {t("from")}: {order.pickup_location?.address} <br />
                    {t("to")}: {order.dropoff_location?.address}
                  </p>
                </Card>
              ))
            ) : (
              <Card className="p-4">
                <p className="text-center text-gray-500">
                  {t("noCurrentOrders")}
                </p>
              </Card>
            )}
          </div>

          {/* Map Display */}
          <div className="h-[600px] relative">
            <Card className="h-full">
              <GoogleMap
                zoom={13}
                center={
                  selectedOrder?.pickup_location || {
                    lat: 24.7136,
                    lng: 46.6753,
                  }
                }
                mapContainerClassName="w-full h-full rounded-lg"
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {selectedOrder && (
                  <>
                    {selectedOrder.pickup_location && (
                      <MarkerF
                        position={selectedOrder.pickup_location}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                        }}
                      />
                    )}
                    {selectedOrder.dropoff_location && (
                      <MarkerF
                        position={selectedOrder.dropoff_location}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                        }}
                      />
                    )}
                  </>
                )}
              </GoogleMap>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

const MyOrders = () => {
  return (
    <LanguageProvider>
      <MyOrdersContent />
    </LanguageProvider>
  );
};

export default MyOrders;
