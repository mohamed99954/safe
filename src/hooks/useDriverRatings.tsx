import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useDriverRatings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["driver_ratings", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      try {
        // First fetch the ratings data
        const { data: ratings, error } = await supabase
          .from("driver_ratings")
          .select(
            `
            id,
            rating,
            comment,
            created_at,
            order_id,
            order_number,
            customer_id
          `
          )
          .eq("driver_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching ratings:", error);
          throw error;
        }

        // If no ratings, return empty array
        if (!ratings || ratings.length === 0) {
          return [];
        }

        // Fetch customer details for each rating
        const customerIds = ratings.map((rating) => rating.customer_id);
        const { data: customers, error: customersError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", customerIds);

        if (customersError) {
          console.error("Error fetching customers:", customersError);
        }

        // Fetch order details for each rating
        const orderIds = ratings.map((rating) => rating.order_id);
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, pickup_location, dropoff_location, created_at")
          .in("id", orderIds);

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
        }

        // Combine all the data
        const ratingsWithDetails = ratings.map((rating) => {
          const customer = customers?.find((c) => c.id === rating.customer_id);
          const order = orders?.find((o) => o.id === rating.order_id);

          return {
            ...rating,
            customer: customer || null,
            order: order || null,
          };
        });

        return ratingsWithDetails;
      } catch (error) {
        console.error("Error in useDriverRatings hook:", error);
        throw error;
      }
    },
    enabled: !!user,
  });
}
