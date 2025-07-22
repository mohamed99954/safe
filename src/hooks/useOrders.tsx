import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useOrders(isAdmin = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id, isAdmin],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      let orders = [];

      if (isAdmin) {
        const { data: allOrders, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        orders = allOrders || [];
      } else {
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }

        const isDriver = userRoles?.some((role) => role.role === "driver");
        const isCustomer = userRoles?.some((role) => role.role === "customer");

        if (isDriver) {
          const { data: driverData, error: driverError } = await supabase
            .from("drivers")
            .select("status")
            .eq("id", user.id)
            .maybeSingle();

          if (driverError) {
            console.error("Error checking driver status:", driverError);
            throw driverError;
          }

          if (!driverData || driverData.status !== "approved") {
            return [];
          }

          const [availableOrdersResult, assignedOrdersResult] =
            await Promise.all([
              supabase
                .from("orders")
                .select("*")
                .is("driver_id", null)
                .eq("status", "available")
                .order("created_at", { ascending: false }),

              supabase
                .from("orders")
                .select("*")
                .eq("driver_id", user.id)
                .order("created_at", { ascending: false }),
            ]);

          if (availableOrdersResult.error) {
            console.error(
              "Error fetching available orders:",
              availableOrdersResult.error
            );
          }

          if (assignedOrdersResult.error) {
            console.error(
              "Error fetching assigned orders:",
              assignedOrdersResult.error
            );
          }

          // Combine results
          orders = [
            ...(availableOrdersResult.data || []),
            ...(assignedOrdersResult.data || []),
          ];
        } else if (isCustomer || userRoles?.length === 0) {
          const { data: customerOrders, error } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;
          orders = customerOrders || [];
        } else {
          return [];
        }
      }

      if (!orders?.length) {
        return [];
      }

      const customerIds = orders
        .map((order) => order.customer_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      const driverIds = orders
        .map((order) => order.driver_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index);

      const fetchProfiles = async () => {
        const results = await Promise.allSettled([
          customerIds.length > 0
            ? supabase
                .from("profiles")
                .select("id, first_name, last_name, phone, email")
                .in("id", customerIds)
            : Promise.resolve({ data: [] }),

          driverIds.length > 0
            ? supabase
                .from("profiles")
                .select("id, first_name, last_name, phone, email")
                .in("id", driverIds)
            : Promise.resolve({ data: [] }),
        ]);

        return {
          customerResult:
            results[0].status === "fulfilled"
              ? results[0].value
              : { data: [], error: results[0].reason },
          driverResult:
            results[1].status === "fulfilled"
              ? results[1].value
              : { data: [], error: results[1].reason },
        };
      };

      const { customerResult, driverResult } = await fetchProfiles();

      if (customerResult.error) {
        console.error("Error fetching customers:", customerResult.error);
      }

      if (driverResult.error) {
        console.error("Error fetching drivers:", driverResult.error);
      }

      const customerMap = (customerResult.data || []).reduce(
        (acc, customer) => {
          acc[customer.id] = customer;
          return acc;
        },
        {}
      );

      const driverMap = (driverResult.data || []).reduce((acc, driver) => {
        acc[driver.id] = driver;
        return acc;
      }, {});

      const enrichedOrders = orders.map((order) => {
        const customer = customerMap[order.customer_id] || null;
        const driver = driverMap[order.driver_id] || null;

        return {
          ...order,
          customer,
          driver,
          canModify: true,
        };
      });

      return enrichedOrders;
    },
    enabled: !!user,
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: false,
    retry: (failureCount, error) => {
      console.error(`Query failed (attempt ${failureCount}):`, error);
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
}

/**
 * Hook to fetch a single order by ID
 * @param orderId - The ID of the order to fetch
 */
export function useOrderById(orderId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!user || !orderId) throw new Error("Missing required parameters");

      // Fetch order data
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      if (!order) throw new Error("Order not found");

      // Fetch customer and driver profiles separately
      const customerPromise = order.customer_id
        ? supabase
            .from("profiles")
            .select("id, first_name, last_name, phone, email")
            .eq("id", order.customer_id)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const driverPromise = order.driver_id
        ? supabase
            .from("profiles")
            .select("id, first_name, last_name, phone, email")
            .eq("id", order.driver_id)
            .maybeSingle()
        : Promise.resolve({ data: null });

      const [customerResult, driverResult] = await Promise.all([
        customerPromise,
        driverPromise,
      ]);

      return {
        ...order,
        customer: customerResult.error ? null : customerResult.data,
        driver: driverResult.error ? null : driverResult.data,
      };
    },
    enabled: Boolean(user && orderId),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
