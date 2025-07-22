import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useQueryClient } from "@tanstack/react-query";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

const CustomerFeedbackContent = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRatings, setExistingRatings] = useState<string[]>([]);

  // Fetch existing ratings to filter out already rated orders
  useEffect(() => {
    const fetchExistingRatings = async () => {
      if (!user) return;

      try {
        const { data: ratings, error } = await supabase
          .from("driver_ratings")
          .select("order_id")
          .eq("customer_id", user.id);

        if (error) {
          console.error("Error fetching existing ratings:", error);
          return;
        }

        const ratedOrderIds = ratings?.map((rating) => rating.order_id) || [];
        setExistingRatings(ratedOrderIds);
      } catch (err) {
        console.error("Error in fetchExistingRatings:", err);
      }
    };

    fetchExistingRatings();
  }, [user]);

  // Filter only completed orders that haven't been rated yet
  const unratedCompletedOrders =
    orders?.filter((order) => {
      const isCompleted = order.status === "completed";
      const hasDriver = order.driver_id;
      const notRated = !existingRatings.includes(order.id);

      return isCompleted && hasDriver && notRated;
    }) || [];

  const handleSubmit = async () => {
    if (!user || !selectedOrder || !rating) {
      toast.error(
        t("pleaseSelectOrderRating") || "Please select an order and rating"
      );
      return;
    }

    setSubmitting(true);
    try {
      const order = orders?.find((o) => o.id === selectedOrder);
      if (!order?.driver_id) {
        throw new Error("Driver ID not found");
      }

      // Check if rating already exists for this order
      const { data: existingRating, error: checkError } = await supabase
        .from("driver_ratings")
        .select("id")
        .eq("order_id", selectedOrder)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing rating:", checkError);
      }

      if (existingRating) {
        toast.error(
          t("alreadyRatedOrder") || "You have already rated this order"
        );
        setSubmitting(false);
        return;
      }

      // Insert new rating
      const { error } = await supabase.from("driver_ratings").insert({
        driver_id: order.driver_id,
        order_id: selectedOrder,
        rating,
        comment: comment.trim() || null,
        customer_id: user.id,
      });

      if (error) {
        console.error("Error submitting rating:", error);
        throw error;
      }

      toast.success(
        t("ratingSubmittedSuccess") || "Rating submitted successfully"
      );
      setSelectedOrder(null);
      setRating(null);
      setComment("");

      // Update existing ratings list
      setExistingRatings((prev) => [...prev, selectedOrder]);

      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["driver_ratings"] });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error(t("errorSubmittingRating") || "Error submitting rating");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatOrderLabel = (order: any) => {
    const date = formatDate(order.created_at);
    const driverName = order.driver
      ? `${order.driver.first_name || ""} ${
          order.driver.last_name || ""
        }`.trim()
      : "Unknown Driver";

    return `${date} - ${driverName}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CustomerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error loading orders: {error.message}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("Feedback & Rating") || "التقييم والملاحظات"}
        </h1>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("Service Rating") || "تقييم الخدمة"}
          </h2>

          {unratedCompletedOrders.length > 0 ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="order"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  {t("Select order to rate") || "اختر طلب للتقييم"}
                </label>
                <select
                  id="order"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  value={selectedOrder || ""}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  required
                >
                  <option value="">{t("Select an order") || "اختر طلب"}</option>
                  {unratedCompletedOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {formatOrderLabel(order)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-semibold text-gray-700">
                  {t("Rating") || "التقييم"}
                </label>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          rating && value <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating && (
                  <p className="text-sm text-gray-600">
                    {rating} out of 5 stars
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  {t("Comments (optional)") || "تعليقات (اختياري)"}
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    t("Add your comments about the service here") ||
                    "أضف تعليقاتك حول الخدمة هنا"
                  }
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full md:w-auto"
                disabled={submitting || !rating || !selectedOrder}
              >
                {submitting
                  ? t("Submitting...") || "جاري الإرسال..."
                  : t("Submit Rating") || "إرسال التقييم"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>
                {t("No completed orders available for rating") ||
                  "لا توجد طلبات مكتملة متاحة للتقييم"}
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

const CustomerFeedback = () => {
  return (
    <LanguageProvider>
      <CustomerFeedbackContent />
    </LanguageProvider>
  );
};

export default CustomerFeedback;
