import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Truck,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/components/ui/language-context";
import { toast } from "sonner";
import { set } from "date-fns";

// Financial Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  description,
  textColor = "text-gray-600",
  isLoading = false,
}) => (
  <Card className="relative overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`${textColor} rounded-full p-2 bg-gray-100`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </>
        )}
      </div>
    </CardContent>
  </Card>
);

// Mobile Stat Card Component
const MobileStatCard = ({
  title,
  value,
  icon,
  description,
  textColor = "text-gray-600",
  isLoading = false,
  t,
}) => (
  <Card className="w-full">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`${textColor} rounded-full p-2 bg-gray-100`}>
          {icon}
        </div>
        <Badge variant="outline" className="text-xs">
          {description}
        </Badge>
      </div>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      ) : (
        <div className="space-y-1">
          <h3 className="text-xl font-bold">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      )}
    </CardContent>
  </Card>
);

const Finance = () => {
  const { t, language } = useLanguage();
  const [timeRange, setTimeRange] = useState("monthly");
  const [error, setError] = useState<string | null>(null);

  // Use React Query to fetch financial data from database
  const {
    data: financialData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["financial-summary", timeRange],
    queryFn: async () => {
      try {
        setError(null);
        const today = new Date();
        const d = today.getDate();
        const m = today.getMonth();
        const y = today.getFullYear();
        let start: string;
        let end: string;

        if (timeRange === "daily") {
          start = new Date(Date.UTC(y, m, d, 0, 0, 0)).toISOString();
          end = new Date(Date.UTC(y, m, d + 1, 0, 0, 0)).toISOString();
        }

        if (timeRange === "weekly") {
          // Get day of the week (0 = Sunday, 6 = Saturday)
          const dayOfWeek = today.getDay();

          // Calculate difference to previous Saturday
          const diffToSaturday = (dayOfWeek + 1) % 7;

          // Get Saturday (start of week)
          const weekStart = new Date(
            Date.UTC(y, m, d - diffToSaturday, 0, 0, 0)
          );

          // Get Friday (end of week)
          const weekEnd = new Date(
            Date.UTC(y, m, weekStart.getDate() + 7, 0, 0, 0)
          );

          start = weekStart.toISOString();
          end = weekEnd.toISOString();
        }

        if (timeRange === "monthly") {
          start = new Date(Date.UTC(y, m, 1, 0, 0, 0)).toISOString();
          end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0)).toISOString();
        }

        if (timeRange === "yearly") {
          start = new Date(Date.UTC(y, 0, 1, 0, 0, 0)).toISOString();
          end = new Date(Date.UTC(y, 11, 31, 0, 0, 0)).toISOString();
        }

        const { data } = await supabase
          .from("driver_payments")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", start)
          .lte("created_at", end);

        const totalAmount = data.reduce(
          (acc, payment) => acc + payment.amount,
          0
        );

        console.log("Financial Data:", totalAmount);

        if (error) throw error;

        return data;
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setError(t("errorFetchingFinancialData"));
        toast.error(t("errorFetchingFinancialData"));
        return [];
      }
    },
  });

  // Format numbers as currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return `0 ${t("currency")}`;
    const locale = language === "ar" ? "ar-SA" : "en-US";
    return `${value.toLocaleString(locale)} ${t("currency")}`;
  };

  // Get period text
  const getPeriodText = () => {
    switch (timeRange) {
      case "daily":
        return t("today");
      case "weekly":
        return t("thisWeek");
      case "monthly":
        return t("thisMonth");
      case "yearly":
        return t("thisYear");
      default:
        return t("thisMonth");
    }
  };

  // Handle export functionality
  const handleExportFinancialReport = () => {
    if (!financialData) {
      toast.error(t("noDataToExport"));
      return;
    }

    const headers = [
      t("period"),
      t("totalRevenue"),
      t("totalCommissions"),
      t("platformProfits"),
      t("driverEarnings"),
    ];

    const csvData = [
      [
        getPeriodText(),
        financialData || 0,
        financialData || 0,
        financialData || 0,
        financialData || 0,
      ],
    ];

    let csvContent = headers.join(",") + "\n";
    csvData.forEach((row) => {
      csvContent += row.map((field) => `"${field}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `financial-report-${timeRange}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("financialReportExported"));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 sm:p-6">
          <Card className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-red-500">
                  <AlertTriangle className="h-12 w-12 mx-auto" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    {t("errorLoadingData")}
                  </h3>
                  <p className="text-red-600 mb-4">
                    {t("errorLoadingFinancialMessage")}
                  </p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    {t("retryAction")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {t("financialSummary")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t("financialSummaryDescription")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {/* Period Selection */}
              <Select
                dir={language === "ar" ? "rtl" : "ltr"}
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("selectPeriod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("daily")}</SelectItem>
                  <SelectItem value="weekly">{t("weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("monthly")}</SelectItem>
                  <SelectItem value="yearly">{t("yearly")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button
                variant="outline"
                className="gap-2 whitespace-nowrap"
                onClick={handleExportFinancialReport}
                disabled={isLoading || !financialData}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t("exportReport")}</span>
                <span className="sm:hidden">{t("export")}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          {/* Desktop Cards */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title={t("totalAmountReceived")}
              value={formatCurrency(
                financialData?.reduce((acc, payment) => acc + payment.amount, 0)
              )}
              icon={<DollarSign size={20} />}
              description={getPeriodText()}
              textColor="text-green-600"
              isLoading={isLoading}
            />
            {/*
            <StatCard
              title={t("totalCommissions20")}
              value={formatCurrency(financialData?.commissions)}
              icon={<TrendingUp size={20} />}
              description={getPeriodText()}
              textColor="text-blue-600"
              isLoading={isLoading}
            />
            <StatCard
              title={t("platformProfits")}
              value={formatCurrency(financialData?.platform_profit)}
              icon={<BarChart3 size={20} />}
              description={getPeriodText()}
              textColor="text-purple-600"
              isLoading={isLoading}
            />
            <StatCard
              title={t("driverEarnings")}
              value={formatCurrency(financialData?.driver_profit)}
              icon={<Truck size={20} />}
              description={getPeriodText()}
              textColor="text-orange-600"
              isLoading={isLoading}
            />
            */}
          </div>

          {/* Tablet/Mobile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4 mb-6">
            <MobileStatCard
              title={t("totalAmountReceived")}
              value={formatCurrency(
                financialData?.reduce((acc, payment) => acc + payment.amount, 0)
              )}
              icon={<DollarSign size={20} />}
              description={getPeriodText()}
              textColor="text-green-600"
              isLoading={isLoading}
              t={t}
            />
            {/*
            <MobileStatCard
              title={t("totalCommissions20")}
              value={formatCurrency(financialData?.commissions)}
              icon={<TrendingUp size={20} />}
              description={getPeriodText()}
              textColor="text-blue-600"
              isLoading={isLoading}
              t={t}
            />
            <MobileStatCard
              title={t("platformProfits")}
              value={formatCurrency(financialData?.platform_profit)}
              icon={<BarChart3 size={20} />}
              description={getPeriodText()}
              textColor="text-purple-600"
              isLoading={isLoading}
              t={t}
            />
            <MobileStatCard
              title={t("driverEarnings")}
              value={formatCurrency(financialData?.driver_profit)}
              icon={<Truck size={20} />}
              description={getPeriodText()}
              textColor="text-orange-600"
              isLoading={isLoading}
              t={t}
              />
              */}
          </div>
        </div>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t("financialReports")}
            </CardTitle>
            <CardDescription>
              {t("financialReportsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="mb-4 grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="daily" className="text-xs sm:text-sm">
                  {t("dailyReport")}
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs sm:text-sm">
                  {t("monthlyReport")}
                </TabsTrigger>
                <TabsTrigger value="annual" className="text-xs sm:text-sm">
                  {t("annualReport")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("dailyReport")}
                    </CardTitle>
                    <CardDescription>{t("dailyRevenueChart")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-gray-500 font-medium">
                          {t("dailyChartPlaceholder")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t("chartComingSoon")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("monthlyReport")}
                    </CardTitle>
                    <CardDescription>
                      {t("monthlyRevenueChart")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-gray-500 font-medium">
                          {t("monthlyChartPlaceholder")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t("chartComingSoon")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="annual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t("annualReport")}
                    </CardTitle>
                    <CardDescription>{t("annualRevenueChart")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                      <div className="text-center space-y-2">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-gray-500 font-medium">
                          {t("annualChartPlaceholder")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {t("chartComingSoon")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Finance;
