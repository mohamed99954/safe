import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Package, Truck, DollarSign, Calculator } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { currencyFormat } from "@/lib/language-key";
import { calculateCost } from "@/lib/utils";

interface LocationType {
  address: string;
  details?: string;
}

interface CalculateOrderCostProps {
  pickupLocation: string;
  dropoffLocation: string;
  onCostCalculated?: (cost: number) => void;
}

const CreateOrderContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const languageParam = language === "ar" ? "ar" : "en";
  const [formData, setFormData] = useState({
    pickupLocation: {
      address: "",
      details: "",
    } as LocationType,
    dropoffLocation: {
      address: "",
      details: "",
    } as LocationType,
    packageDetails: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      toast.error(
        language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first"
      );
      navigate("/login");
    }
  }, [user, navigate, language]);

  const handleLocationChange = (
    type: "pickupLocation" | "dropoffLocation",
    field: "address" | "details",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(
        language === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please login first"
      );
      return;
    }
    if (
      !formData.pickupLocation.address ||
      !formData.dropoffLocation.address ||
      !formData.packageDetails
    ) {
      toast.error(
        language === "ar"
          ? "يرجى ملء جميع الحقول الإلزامية"
          : "Please fill in all required fields"
      );
      return;
    }



    try {
      const res = await fetch(
        `/google-api/maps/api/directions/json?origin=${encodeURIComponent(
          formData.pickupLocation.address
        )},SA&destination=${encodeURIComponent(
          formData.dropoffLocation.address
        )},SA&mode=driving&language=${languageParam}&key=AIzaSyCydsClVwciuKXIgNiAy6YL2-FL1y4B6_w`
      );
      const data = await res.json();

      if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء حساب المسافة. تأكد من صحة العناوين."
            : "Error calculating distance. Please verify the addresses."
        );
        return;
      }

      setSubmitting(true);

      const { data: orderData, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: user.id,
            pickup_location: {
              address: formData.pickupLocation.address,
              details: formData.pickupLocation.details || "",
            },
            dropoff_location: {
              address: formData.dropoffLocation.address,
              details: formData.dropoffLocation.details || "",
            },
            package_details: formData.packageDetails,
            notes: formData.notes,
            status: "available",
            payment_status: "pending",
            commission_rate: 0.2,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating order:", error);
        throw error;
      }

      toast.success(
        language === "ar"
          ? "تم إنشاء الطلب بنجاح"
          : "Order created successfully"
      );
      navigate("/customer/orders");
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      toast.error(
        (language === "ar"
          ? "حدث خطأ أثناء إنشاء الطلب: "
          : "Error creating order: ") + (error instanceof Error ? error.message : "")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currencyDisplay = currencyFormat[language];

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("createOrder")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("pickupInfo")}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pickupAddress">{t("pickupAddress")}</Label>
                    <Input
                      id="pickupAddress"
                      placeholder={t("enterPickupAddress")}
                      value={formData.pickupLocation.address}
                      onChange={(e) =>
                        handleLocationChange(
                          "pickupLocation",
                          "address",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickupDetails">
                      {t("additionalDetails")}
                    </Label>
                    <Input
                      id="pickupDetails"
                      placeholder={t("buildingNumFloor")}
                      value={formData.pickupLocation.details}
                      onChange={(e) =>
                        handleLocationChange(
                          "pickupLocation",
                          "details",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">{t("deliveryInfo")}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dropoffAddress">
                      {t("deliveryAddress")}
                    </Label>
                    <Input
                      id="dropoffAddress"
                      placeholder={t("enterDeliveryAddress")}
                      value={formData.dropoffLocation.address}
                      onChange={(e) =>
                        handleLocationChange(
                          "dropoffLocation",
                          "address",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropoffDetails">
                      {t("additionalDetails")}
                    </Label>
                    <Input
                      id="dropoffDetails"
                      placeholder={t("buildingNumFloor")}
                      value={formData.dropoffLocation.details}
                      onChange={(e) =>
                        handleLocationChange(
                          "dropoffLocation",
                          "details",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <CalculateOrderCost
            pickupLocation={formData.pickupLocation.address}
            dropoffLocation={formData.dropoffLocation.address}
            onCostCalculated={setEstimatedCost}
          />

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
              <Package className="h-5 w-5 ml-2 text-safedrop-gold" />
              {t("shipmentDetails")}
            </h2>
            <div className="space-y-4">
              {estimatedCost && (
                <div className="mb-4">
                  <p className="text-sm text-blue-600 font-medium">
                    {language === "ar"
                      ? `التكلفة المقدرة: ${estimatedCost} ر.س`
                      : `Estimated cost: ${estimatedCost} SAR`}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="packageDetails">
                  {t("packageDescription")}
                </Label>
                <Textarea
                  id="packageDetails"
                  name="packageDetails"
                  placeholder={t("contentsSizeWeight")}
                  rows={3}
                  value={formData.packageDetails}
                  onChange={handleTextChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">{t("driverNotes")}</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder={t("specialInstructions")}
                  rows={3}
                  value={formData.notes}
                  onChange={handleTextChange}
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/customer/dashboard")}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2"
              disabled={submitting}
            >
              {submitting ? (
                t("sending")
              ) : (
                <>
                  <Truck className="h-4 w-4" />
                  {t("submitOrder")}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

const CalculateOrderCost = ({
  pickupLocation,
  dropoffLocation,
  onCostCalculated,
}: CalculateOrderCostProps) => {
  const { t, language } = useLanguage();
  const [price, setPrice] = useState("-");
  const [distance, setDistance] = useState("-");
  const [duration, setDuration] = useState("-");
  const [isCalculating, setIsCalculating] = useState(false);
  const languageParam = language === "ar" ? "ar" : "en";

  const currencyDisplay = currencyFormat[language];

  const locationsValid = pickupLocation && dropoffLocation;

  const handleOnclick = async () => {
    if (!locationsValid) {
      toast.error(
        language === "ar"
          ? "يرجى إدخال عنوان الاستلام والتوصيل أولاً"
          : "Please enter pickup and delivery addresses first"
      );
      return;
    }

    try {
      setIsCalculating(true);
      setPrice("-");
      setDistance("-");
      setDuration("-");

      const res = await fetch(
        `/google-api/maps/api/directions/json?origin=${encodeURIComponent(
          pickupLocation
        )},SA&destination=${encodeURIComponent(
          dropoffLocation
        )},SA&mode=driving&language=${languageParam}&key=AIzaSyCydsClVwciuKXIgNiAy6YL2-FL1y4B6_w`
      );

      const data = await res.json();

      if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء حساب المسافة. تأكد من صحة العناوين."
            : "Error calculating distance. Please verify the addresses."
        );
        return;
      }

      setDistance(data.routes[0].legs[0].distance.text);
      setDuration(data.routes[0].legs[0].duration.text);

      const distanceInMeters = data.routes[0].legs[0].distance.value;
      const fare = calculateCost(distanceInMeters);

      if (onCostCalculated) {
        onCostCalculated(fare);
      }

      const fareValue = Math.floor(fare * 100) / 100;
      const currencySymbol = currencyDisplay.symbol;

      const formattedPrice =
        currencyDisplay.position === "suffix"
          ? `${fareValue}${
              currencyDisplay.spaceBetween ? " " : ""
            }${currencySymbol}`
          : `${currencySymbol}${
              currencyDisplay.spaceBetween ? " " : ""
            }${fareValue}`;

      setPrice(formattedPrice);
    } catch (error) {
      console.error("Error calculating cost:", error);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء حساب التكلفة"
          : "Error calculating cost"
      );
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 mt-1 items-center justify-items-center text-center">
      <Button
        onClick={handleOnclick}
        type="button"
        disabled={!locationsValid || isCalculating}
        className={!locationsValid ? "opacity-70" : ""}
      >
        <Calculator className="mr-1" />
        {isCalculating
          ? language === "ar"
            ? "جاري الحساب..."
            : "Calculating..."
          : language === "ar"
          ? "احسب التكلفة"
          : "Calculate Cost"}
      </Button>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "المسافة" : "Distance"}
        </p>
        <p className="font-medium">{distance}</p>
      </div>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "الوقت المتوقع" : "Estimated Time"}
        </p>
        <p className="font-medium">{duration}</p>
      </div>
      <div className="bg-gray-50 rounded p-2">
        <p className="text-sm text-gray-500">
          {language === "ar" ? "المبلغ المتوقع" : "Estimated Cost"}
        </p>
        <p className="font-medium" dir={language === "ar" ? "rtl" : "ltr"}>
          {price}
        </p>
      </div>
    </div>
  );
};

const CreateOrder = () => {
  return (
    <LanguageProvider>
      <CreateOrderContent />
    </LanguageProvider>
  );
};

export default CreateOrder;
