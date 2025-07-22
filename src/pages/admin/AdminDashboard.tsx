import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UsersIcon,
  TruckIcon,
  PackageIcon,
  DollarSign,
  LineChart,
  BarChart2Icon,
  AlertTriangleIcon,
  Check,
  Hash,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

// Define types
type DateRange = "today" | "week" | "month" | "year";

interface FinancialSummary {
  totalRevenue: number;
  commissions: number;
  platformProfit: number;
  driversPayout: number;
}

interface LocationObject {
  address: string;
  details?: string;
}

interface Order {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_location: LocationObject;
  dropoff_location: LocationObject;
  status: string;
  price: number;
  commission_rate: number;
  driver_payout: number | null;
  created_at: string;
  updated_at: string;
  estimated_distance: number | null;
  estimated_duration: number | null;
  actual_pickup_time: string | null;
  actual_delivery_time: string | null;
  payment_method: string | null;
  payment_status: string;
  notes: string;
  driver_location: { lat: number; lng: number } | null;
  package_details: string;
  order_id: number;
  order_number: string;
}

const AdminDashboardContent = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { signOut, loading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [selectedCommissionRate, setSelectedCommissionRate] = useState(20);
  const [systemLanguage, setSystemLanguage] = useState("ar");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [termsOfService, setTermsOfService] = useState("");
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    commissions: 0,
    platformProfit: 0,
    driversPayout: 0,
  });

  const { data: customersCount = 0, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from("profiles")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("user_type", "customer");
        if (error) {
          console.error("Error fetching customers count:", error);
          return 0;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching customers count:", error);
        return 0;
      }
    },
  });

  const { data: driversCount = 0, isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["drivers-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase.from("drivers").select("*", {
          count: "exact",
          head: true,
        });
        if (error) {
          console.error("Error fetching drivers count:", error);
          return 0;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching drivers count:", error);
        return 0;
      }
    },
  });

  const { data: ordersCount = 0, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders-count"],
    queryFn: async () => {
      try {
        const { count, error } = await supabase.from("orders").select("*", {
          count: "exact",
          head: true,
        });
        if (error) {
          console.error("Error fetching orders count:", error);
          return 0;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching orders count:", error);
        return 0;
      }
    },
  });

  const { data: orders = [], isLoading: isLoadingOrdersList } = useQuery({
    queryKey: ["orders-list"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_id, order_number, status, created_at, pickup_location, dropoff_location, price"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(5);
        if (error) {
          console.error("Error fetching orders:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
      }
    },
  });

  const { data: systemSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("*");

        if (error) {
          console.error("Error fetching system settings:", error);
          return null;
        }

        const settings: Record<string, string> = {};
        ((data as any[]) || []).forEach((item) => {
          const key = item.setting_key;
          let value = item.setting_value;

          if (key && value !== null && value !== undefined) {
            // Handle different data types in setting_value
            if (typeof value === "object") {
              // If it's stored as JSON, extract the value
              value = typeof value === "string" ? value : JSON.stringify(value);
            } else if (typeof value === "number") {
              value = value.toString();
            }
            settings[key] = value;
          }
        });

        if (settings.driver_commission_rate) {
          const rate = parseFloat(settings.driver_commission_rate);
          setSelectedCommissionRate(Math.round(rate * 100));
        }

        if (settings.system_language) {
          setSystemLanguage(settings.system_language);
        }
        if (settings.privacy_policy) {
          setPrivacyPolicy(settings.privacy_policy);
        }
        if (settings.terms_of_service) {
          setTermsOfService(settings.terms_of_service);
        }

        return settings;
      } catch (error) {
        console.error("Error fetching system settings:", error);
        return null;
      }
    },
  });

  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["financial-data", dateRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_financial_summary", {
          period_type: dateRange,
        });
        if (error) throw error;
        return (
          data || {
            total_revenue: 0,
            commissions: 0,
            platform_profit: 0,
            driver_profit: 0,
          }
        );
      } catch (error) {
        console.error("Error fetching financial data:", error);
        return {
          total_revenue: 0,
          commissions: 0,
          platform_profit: 0,
          driver_profit: 0,
        };
      }
    },
  });

  useEffect(() => {
    if (financialData) {
      setFinancialSummary({
        totalRevenue: financialData.total_revenue || 0,
        commissions: financialData.commissions || 0,
        platformProfit: financialData.platform_profit || 0,
        driversPayout: financialData.driver_profit || 0,
      });
    }
  }, [financialData]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(t("logoutSuccess"));
      navigate("/login?logout=true", { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("logoutError"));
    }
  };

  const handleUpdateCommissionRate = async () => {
    try {
      // Convert percentage to decimal (20% = 0.20)
      const rateAsDecimal = selectedCommissionRate / 100;

      // Check if driver_commission_rate exists
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "driver_commission_rate")
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: rateAsDecimal,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "driver_commission_rate");

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "driver_commission_rate",
          setting_value: rateAsDecimal,
          description: `Driver commission rate (${selectedCommissionRate}%)`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(`${t("commissionRateUpdated")} ${selectedCommissionRate}%`);
    } catch (error) {
      console.error("Error updating commission rate:", error);
      toast.error(t("errorUpdatingCommissionRate"));
    }
  };

  // Updated system language update function
  const handleUpdateSystemLanguage = async (language: string) => {
    try {
      // Check if system_language exists
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "system_language")
        .single();

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: language,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "system_language");

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "system_language",
          setting_value: language,
          description: "Default system language",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      setSystemLanguage(language);
      toast.success(
        language === "ar"
          ? t("systemLanguageUpdatedToArabic")
          : t("systemLanguageUpdatedToEnglish")
      );
    } catch (error) {
      console.error("Error updating system language:", error);
      toast.error(t("errorUpdatingSystemLanguage"));
    }
  };

  // Updated privacy policy update function
  const handleUpdatePrivacyPolicy = async () => {
    try {
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "privacy_policy")
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: privacyPolicy,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "privacy_policy");

        if (error) throw error;
      } else {
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "privacy_policy",
          setting_value: privacyPolicy,
          description: "Privacy policy content",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(t("privacyPolicyUpdated"));
    } catch (error) {
      console.error("Error updating privacy policy:", error);
      toast.error(t("errorUpdatingPrivacyPolicy"));
    }
  };

  // Updated terms of service update function
  const handleUpdateTermsOfService = async () => {
    try {
      const { data: existingData, error: selectError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "terms_of_service")
        .single();

      if (existingData) {
        const { error } = await supabase
          .from("system_settings")
          .update({
            setting_value: termsOfService,
            updated_at: new Date().toISOString(),
          })
          .eq("setting_key", "terms_of_service");

        if (error) throw error;
      } else {
        const { error } = await supabase.from("system_settings").insert({
          setting_key: "terms_of_service",
          setting_value: termsOfService,
          description: "Terms of service content",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast.success(t("termsOfServiceUpdated"));
    } catch (error) {
      console.error("Error updating terms of service:", error);
      toast.error(t("errorUpdatingTermsOfService"));
    }
  };

  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return `0 ${t("currency")}`;
    return `${value.toLocaleString()} ${t("currency")}`;
  };

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

  const getStatusBadge = (status: string) => {
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
            text: status || t("unknown"),
            className: "bg-gray-100 text-gray-800 border-gray-200",
          };
      }
    };

    const statusDisplay = getStatusDisplay(status);

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.className}`}
      >
        {statusDisplay.text}
      </span>
    );
  };

  // Helper function to safely extract location address
  const getLocationAddress = (location: any) => {
    if (!location) return t("notSpecified");
    if (typeof location === "string") return location;
    if (typeof location === "object" && location.address)
      return location.address;
    return t("notSpecified");
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-safedrop-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              {t("adminDashboardTitle")}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("customers")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("totalCustomersRegistered")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingCustomers ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      customersCount
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TruckIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("drivers")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("totalDriversRegistered")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingDrivers ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      driversCount
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PackageIcon className="h-5 w-5 text-safedrop-gold" />
                    <span>{t("orders")}</span>
                  </CardTitle>
                  <CardDescription>{t("totalOrders")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {isLoadingOrders ? (
                      <span className="text-gray-400">...</span>
                    ) : (
                      ordersCount
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="financial" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="financial">
                  {t("financialSummary")}
                </TabsTrigger>
                <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
                <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
              </TabsList>

              <TabsContent value="financial" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center">
                      <CardTitle className="text-xl">
                        {t("financialSummary")}
                      </CardTitle>
                      <Select
                        value={dateRange}
                        onValueChange={(value) =>
                          setDateRange(value as DateRange)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={t("selectPeriod")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">{t("today")}</SelectItem>
                          <SelectItem value="week">{t("lastWeek")}</SelectItem>
                          <SelectItem value="month">
                            {t("lastMonth")}
                          </SelectItem>
                          <SelectItem value="year">{t("lastYear")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                {t("totalAmountReceived")}
                              </p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial
                                  ? "..."
                                  : formatCurrency(
                                      financialData?.total_revenue || 0
                                    )}
                              </h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                              <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                {t("totalCommissions")}
                              </p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial
                                  ? "..."
                                  : formatCurrency(
                                      financialData?.commissions || 0
                                    )}
                              </h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                              <BarChart2Icon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                {t("platformProfits")}
                              </p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial
                                  ? "..."
                                  : formatCurrency(
                                      financialData?.platform_profit || 0
                                    )}
                              </h3>
                            </div>
                            <div className="p-3 bg-violet-100 rounded-full">
                              <LineChart className="h-6 w-6 text-violet-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500">
                                {t("driverPayouts")}
                              </p>
                              <h3 className="text-2xl font-bold">
                                {isLoadingFinancial
                                  ? "..."
                                  : formatCurrency(
                                      financialData?.driver_profit || 0
                                    )}
                              </h3>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-full">
                              <TruckIcon className="h-6 w-6 text-amber-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {t("orders")} - {t("latest5Orders")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrdersList ? (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          <p className="text-gray-500">{t("loadingData")}</p>
                        </div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                          <PackageIcon className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500 text-lg">{t("noOrders")}</p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table - Large screens */}
                        <div className="hidden xl:block">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                                    {t("orderNumber")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                                    {t("orderId")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                                    {t("status")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                                    {t("pickupLocation")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                                    {t("deliveryLocation")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                                    {t("amount")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                                    {t("dateCreated")}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orders.map((order: Order) => (
                                  <TableRow
                                    key={order.order_id}
                                    className="hover:bg-gray-50"
                                  >
                                    <TableCell className="font-semibold text-center">
                                      {order.order_id}
                                    </TableCell>
                                    <TableCell className="font-semibold text-center">
                                      {order.order_number}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div
                                        className="max-w-[140px] truncate"
                                        title={getLocationAddress(
                                          order.pickup_location
                                        )}
                                      >
                                        {getLocationAddress(
                                          order.pickup_location
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div
                                        className="max-w-[140px] truncate"
                                        title={getLocationAddress(
                                          order.dropoff_location
                                        )}
                                      >
                                        {getLocationAddress(
                                          order.dropoff_location
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {order.price
                                        ? formatCurrency(order.price)
                                        : t("notSpecified")}
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap text-sm">
                                      {formatDate(order.created_at)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Tablet Table - Medium to Large screens */}
                        <div className="hidden lg:block xl:hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("orderId")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("orderNumber")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("status")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("amount")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("dateCreated")}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orders.map((order: Order) => (
                                  <TableRow
                                    key={order.order_id}
                                    className="hover:bg-gray-50"
                                  >
                                    <TableCell className="font-semibold text-center">
                                      {order.order_id}
                                    </TableCell>
                                    <TableCell className="font-semibold text-center">
                                      {order.order_number}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {order.price
                                        ? formatCurrency(order.price)
                                        : t("notSpecified")}
                                    </TableCell>
                                    <TableCell className="text-center whitespace-nowrap text-sm">
                                      {formatDate(order.created_at)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Compact Table - Small to Medium screens */}
                        <div className="hidden md:block lg:hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("orderId")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("orderNumber")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("status")}
                                  </TableHead>
                                  <TableHead className="text-center whitespace-nowrap font-bold">
                                    {t("amount")}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orders.map((order: Order) => (
                                  <TableRow
                                    key={order.order_id}
                                    className="hover:bg-gray-50"
                                  >
                                    <TableCell className="font-semibold text-center">
                                      {order.order_id}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {order.order_number}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {getStatusBadge(order.status)}
                                    </TableCell>
                                    <TableCell className="text-center text-xs">
                                      {order.price
                                        ? formatCurrency(order.price)
                                        : t("notSpecified")}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Mobile Cards - Small screens */}
                        <div className="block md:hidden space-y-4">
                          {orders.map((order: Order) => (
                            <Card key={order.order_id} className="w-full">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  {/* Header */}
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <Hash className="h-4 w-4 text-gray-500" />
                                      <span className="font-bold text-lg">
                                        {order.order_number}
                                      </span>
                                    </div>
                                    {getStatusBadge(order.status)}
                                  </div>

                                  {/* Location Info */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <PackageIcon className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-600">
                                        {t("pickupLocation")}:
                                      </span>
                                      <span className="font-medium">
                                        {getLocationAddress(
                                          order.pickup_location
                                        )}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                      <TruckIcon className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-600">
                                        {t("deliveryLocation")}:
                                      </span>
                                      <span className="font-medium">
                                        {getLocationAddress(
                                          order.dropoff_location
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Order Details */}
                                  <div className="space-y-2 pt-2 border-t">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-600">
                                        {t("dateCreated")}:
                                      </span>
                                      <span className="font-medium">
                                        {formatDate(order.created_at)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                      <DollarSign className="h-4 w-4 text-gray-500" />
                                      <span className="text-gray-600">
                                        {t("amount")}:
                                      </span>
                                      <span className="font-medium">
                                        {order.price
                                          ? formatCurrency(order.price)
                                          : t("notSpecified")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {t("systemSettings")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="commissions" className="w-full">
                      <TabsList className="mb-6">
                        <TabsTrigger value="commissions">
                          {t("commissions")}
                        </TabsTrigger>
                        <TabsTrigger value="language">
                          {t("language")}
                        </TabsTrigger>
                        <TabsTrigger value="privacy">
                          {t("privacyPolicy")}
                        </TabsTrigger>
                        <TabsTrigger value="terms">
                          {t("termsOfService")}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="commissions">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="commission-rate">
                              {t("commissionRatePercentage")}
                            </Label>
                            <div className="flex items-center gap-4 mt-1">
                              <Input
                                id="commission-rate"
                                type="number"
                                min="0"
                                max="100"
                                value={selectedCommissionRate.toString()}
                                onChange={(e) =>
                                  setSelectedCommissionRate(
                                    Number(e.target.value)
                                  )
                                }
                                className="w-[100px]"
                              />
                              <Button onClick={handleUpdateCommissionRate}>
                                <Check className="h-4 w-4 mr-2" />
                                {t("save")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="language">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>{t("systemLanguage")}</Label>
                            <div className="flex gap-4">
                              <Button
                                variant={
                                  systemLanguage === "ar"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => handleUpdateSystemLanguage("ar")}
                              >
                                {t("arabic")}
                              </Button>
                              <Button
                                variant={
                                  systemLanguage === "en"
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => handleUpdateSystemLanguage("en")}
                              >
                                {t("english")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="privacy">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="privacy-policy">
                              {t("privacyPolicy")}
                            </Label>
                            <Input
                              id="privacy-policy"
                              type="text"
                              value={privacyPolicy}
                              onChange={(e) => setPrivacyPolicy(e.target.value)}
                              className="w-full mt-1"
                            />
                            <Button
                              onClick={handleUpdatePrivacyPolicy}
                              className="mt-2"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t("save")}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="terms">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="terms-of-service">
                              {t("termsOfService")}
                            </Label>
                            <Input
                              id="terms-of-service"
                              type="text"
                              value={termsOfService}
                              onChange={(e) =>
                                setTermsOfService(e.target.value)
                              }
                              className="w-full mt-1"
                            />
                            <Button
                              onClick={handleUpdateTermsOfService}
                              className="mt-2"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {t("save")}
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <LanguageProvider>
      <AdminDashboardContent />
    </LanguageProvider>
  );
};

export default AdminDashboard;
