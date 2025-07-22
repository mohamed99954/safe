import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/components/ui/language-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
}

// Mobile Card Component
const MobileCustomerCard: React.FC<{
  customer: Customer;
  t: (key: string) => string;
  formatDate: (dateString: string) => string;
}> = ({ customer, t, formatDate }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">
                {customer.first_name} {customer.last_name}
              </span>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              {t("customer")}
            </Badge>
          </div>

          {/* Customer Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("emailLabel")}:</span>
              <span className="font-medium truncate reverse-text">
                {customer.email || t("notSpecified")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("phoneLabel")}:</span>
              <span className="font-medium">
                {customer.phone || t("notSpecified")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("joinDate")}:</span>
              <span className="font-medium">
                {formatDate(customer.created_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Responsive Table Component
interface CustomersTableProps {
  customers: Customer[];
  t: (key: string) => string;
  formatDate: (dateString: string) => string;
}

const ResponsiveCustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  t,
  formatDate,
}) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <User className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">{t("noCustomersToDisplay")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table - Large screens */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start whitespace-nowrap min-w-[140px] font-bold">
                  {t("firstName")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap min-w-[140px] font-bold">
                  {t("lastName")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap min-w-[200px] font-bold">
                  {t("email")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap min-w-[120px] font-bold">
                  {t("phone")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap min-w-[140px] font-bold">
                  {t("joinDate")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell className="text-start">
                    <div
                      className="max-w-[140px] truncate"
                      title={customer.first_name}
                    >
                      {customer.first_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-start">
                    <div
                      className="max-w-[140px] truncate"
                      title={customer.last_name}
                    >
                      {customer.last_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-start">
                    <div
                      className="max-w-[200px]"
                      title={customer.email || t("notSpecified")}
                    >
                      {customer.email || t("notSpecified")}
                    </div>
                  </TableCell>
                  <TableCell className="text-start">
                    {customer.phone || t("notSpecified")}
                  </TableCell>
                  <TableCell className="text-start whitespace-nowrap text-sm">
                    {formatDate(customer.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Tablet Table - Medium screens */}
      <div className="hidden md:block lg:hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start whitespace-nowrap font-bold">
                  {t("customerName")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap font-bold">
                  {t("email")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap font-bold">
                  {t("phone")}
                </TableHead>
                <TableHead className="text-start whitespace-nowrap font-bold">
                  {t("joinDate")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell className="text-center">
                    <div
                      className="max-w-[120px] truncate"
                      title={`${customer.first_name} ${customer.last_name}`}
                    >
                      {customer.first_name} {customer.last_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[150px] truncate"
                      title={customer.email || t("notSpecified")}
                    >
                      {customer.email || t("notSpecified")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {customer.phone || t("notSpecified")}
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm">
                    {formatDate(customer.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards - Small screens */}
      <div className="block md:hidden space-y-4">
        {customers.map((customer) => (
          <MobileCustomerCard
            key={customer.id}
            customer={customer}
            t={t}
            formatDate={formatDate}
          />
        ))}
      </div>
    </>
  );
};

const Customers = () => {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, phone, user_type, created_at"
        )
        .eq("user_type", "customer");

      if (error) {
        throw error;
      }

      if (data) {
        const customersFormatted = data.map((cust: any) => ({
          id: cust.id,
          first_name: cust.first_name,
          last_name: cust.last_name,
          email: cust.email,
          phone: cust.phone,
          created_at: cust.created_at,
        })) as Customer[];
        setCustomers(customersFormatted);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(t("fetchCustomersError"));
      toast.error(t("fetchCustomersError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery) return true;

    const fullName =
      `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const phone = customer.phone?.toLowerCase() || "";
    const email = customer.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) || phone.includes(query) || email.includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return t("notAvailable");

    const locale = language === "ar" ? "ar-SA" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExportCustomers = () => {
    const headers = [
      t("firstName"),
      t("lastName"),
      t("email"),
      t("phone"),
      t("joinDate"),
    ];

    const csvData = customers.map((customer) => [
      customer.first_name,
      customer.last_name,
      customer.email || t("notSpecified"),
      customer.phone || t("notSpecified"),
      formatDate(customer.created_at),
    ]);

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
      `customers-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("customersExportedSuccessfully"));
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
                    {t("errorLoadingCustomersMessage")}
                  </p>
                  <Button
                    onClick={() => fetchCustomers()}
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
                {t("customersManagement")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t("customersManagementDescription")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchCustomerPlaceholder")}
                  className="pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                className="gap-2 whitespace-nowrap"
                onClick={handleExportCustomers}
                disabled={customers.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t("exportCustomers")}</span>
                <span className="sm:hidden">{t("export")}</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {customers.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("totalCustomers")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {filteredCustomers.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("searchResults")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {
                      customers.filter((c) => {
                        const joinDate = new Date(c.created_at);
                        const thisMonth = new Date();
                        return (
                          joinDate.getMonth() === thisMonth.getMonth() &&
                          joinDate.getFullYear() === thisMonth.getFullYear()
                        );
                      }).length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("newThisMonth")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-500">{t("loadingCustomersText")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                {t("searchResults")} ({filteredCustomers.length} {t("of")}{" "}
                {customers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <ResponsiveCustomersTable
                customers={filteredCustomers}
                t={t}
                formatDate={formatDate}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Customers;
