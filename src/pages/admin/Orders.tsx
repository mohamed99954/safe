import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  Eye,
  Package,
  User,
  Truck,
  Calendar,
  DollarSign,
  CreditCard,
  Hash,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useOrders } from "@/hooks/useOrders";
import { OrderDetails } from "@/components/admin/OrderDetails";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";

// Mobile Card Component
const MobileOrderCard: React.FC<{
  order: any;
  onViewOrder: (order: any) => void;
  t: (key: string) => string;
}> = ({ order, onViewOrder, t }) => {
  const { language } = useLanguage();
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

  const statusDisplay = getStatusDisplay(order.status);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">{order.order_id}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${statusDisplay.className}`}
            >
              {statusDisplay.text}
            </Badge>
          </div>

          {/* Order Code */}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{t("orderCode")}</span>
            <span className="font-medium">
              {order.order_number
                ? order.order_number.substring(0, 8)
                : t("notSpecified")}
            </span>
          </div>

          {/* Customer & Driver Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("customer")}</span>
              <span className="font-medium">
                {order.customer
                  ? `${order.customer.first_name} ${order.customer.last_name}`
                  : t("unknown")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("driver")}</span>
              <span className="font-medium">
                {order.driver
                  ? `${order.driver.first_name} ${order.driver.last_name}`
                  : t("notAssigned")}
              </span>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("date")}</span>
              <span className="font-medium">
                {formatDate(order.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("priceLabel")}</span>
              <span className="font-medium">
                {order.price
                  ? `${order.price} ${t("currency")}`
                  : t("notSpecified")}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600 text-sm">
                {t("paymentStatus")}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                order.payment_status === "paid"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : order.payment_status === "pending"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : "bg-purple-100 text-purple-800 border-purple-200"
              }`}
            >
              {order.payment_status === "paid"
                ? t("paid")
                : order.payment_status === "pending"
                ? t("unpaid")
                : t("refunded")}
            </Badge>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewOrder(order)}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("viewFullOrderDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Responsive Table Component
interface OrdersTableProps {
  orders: any[];
  status?: "all" | "available" | "picked_up" | "approaching" | "completed";
  onViewOrder: (order: any) => void;
  t: (key: string) => string;
}

const ResponsiveOrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  status = "all",
  onViewOrder,
  t,
}) => {
  const { language } = useLanguage();
  const filteredOrders =
    status === "all"
      ? orders
      : orders.filter((order) => order.status === status);

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

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Package className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">{t("noOrdersInCategory")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table - Large screens */}
      <div className="hidden xl:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("Order ID")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("Order Code")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                  {t("Driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[140px] font-bold">
                  {t("Driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("orderDate")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("price")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("Status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[120px] font-bold">
                  {t("paymentStatus")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap min-w-[100px] font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-center">
                      {order.order_id}
                    </TableCell>
                    <TableCell className="font-medium text-center">
                      <div
                        className="max-w-[120px] truncate"
                        title={order.order_number || t("notSpecified")}
                      >
                        #
                        {order.order_number
                          ? order.order_number
                          : t("notSpecified")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[140px] truncate"
                        title={
                          order.customer
                            ? `${order.customer.first_name} ${order.customer.last_name}`
                            : t("unknown")
                        }
                      >
                        {order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : t("unknown")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[140px] truncate"
                        title={
                          order.driver
                            ? `${order.driver.first_name} ${order.driver.last_name}`
                            : t("notAssigned")
                        }
                      >
                        {order.driver
                          ? `${order.driver.first_name} ${order.driver.last_name}`
                          : t("notAssigned")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap text-sm">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      {order.price
                        ? `${order.price} ${t("currency")}`
                        : t("notSpecified")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`whitespace-nowrap text-xs ${statusDisplay.className}`}
                      >
                        {statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`whitespace-nowrap text-xs ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-purple-100 text-purple-800 border-purple-200"
                        }`}
                      >
                        {order.payment_status === "paid"
                          ? t("paid")
                          : order.payment_status === "pending"
                          ? t("unpaid")
                          : t("refunded")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                  {t("Order ID")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("price")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-center">
                      {order.order_id}
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[120px] truncate"
                        title={
                          order.customer
                            ? `${order.customer.first_name} ${order.customer.last_name}`
                            : t("unknown")
                        }
                      >
                        {order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : t("unknown")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[120px] truncate"
                        title={
                          order.driver
                            ? `${order.driver.first_name} ${order.driver.last_name}`
                            : t("notAssigned")
                        }
                      >
                        {order.driver
                          ? `${order.driver.first_name} ${order.driver.last_name}`
                          : t("notAssigned")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {order.price
                        ? `${order.price} ${t("currency")}`
                        : t("notSpecified")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`whitespace-nowrap text-xs ${statusDisplay.className}`}
                      >
                        {statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
                  {t("order")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Driver")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("price")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-semibold text-center">
                      {order.order_id}
                    </TableCell>
                    <TableCell className="text-center">
                      <div
                        className="max-w-[100px] truncate text-xs"
                        title={
                          order.customer
                            ? `${order.customer.first_name} ${order.customer.last_name}`
                            : t("unknown")
                        }
                      >
                        {order.customer
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : t("unknown")}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusDisplay.className}`}
                      >
                        {statusDisplay.text.length > 8
                          ? statusDisplay.text.substring(0, 8) + "..."
                          : statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {order.price
                        ? `${order.price} ${t("currency")}`
                        : t("notSpecified")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOrder(order)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards - Small screens */}
      <div className="block md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            onViewOrder={onViewOrder}
            t={t}
          />
        ))}
      </div>
    </>
  );
};

// Main Orders Component
const Orders: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { data: orders = [], isLoading, error, refetch } = useOrders(true);

  React.useEffect(() => {
    if (error) {
      console.error("Error fetching orders:", error);
      toast.error(t("errorLoadingOrders"));
    }
  }, [error, t]);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleOrderStatusUpdate = () => {
    refetch();
    toast.success(t("orderUpdatedSuccessfully"));
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleExportOrders = () => {
    const headers = [
      t("Order ID"),
      t("Order Code"),
      t("Driver"),
      t("Driver"),
      t("orderDate"),
      t("price"),
      t("Status"),
      t("paymentStatus"),
    ];

    const csvData = orders.map((order) => [
      order.order_id || order.id,
      order.order_number || t("notSpecified"),
      order.customer
        ? `${order.customer.first_name} ${order.customer.last_name}`
        : t("unknown"),
      order.driver
        ? `${order.driver.first_name} ${order.driver.last_name}`
        : t("notAssigned"),
      new Date(order.created_at).toLocaleDateString("ar-SA"),
      order.price ? `${order.price} ${t("currency")}` : t("notSpecified"),
      order.status,
      order.payment_status,
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
      `orders-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("ordersExportedSuccessfully"));
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.order_number &&
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customer &&
        `${order.customer.first_name} ${order.customer.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (order.driver &&
        `${order.driver.first_name} ${order.driver.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
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
                  {t("errorLoadingOrdersMessage")}
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
                {t("ordersManagement")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t("ordersManagementDescription")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchOrder")}
                  className="pr-10 text-left"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Export Button */}
              <Button
                variant="outline"
                className="gap-2 whitespace-nowrap"
                onClick={handleExportOrders}
                disabled={orders.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">{t("exportOrders")}</span>
                <span className="sm:hidden">{t("export")}</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900">
                    {orders.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("totalOrders")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {orders.filter((o) => o.status === "available").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("availableForDelivery")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-orange-600">
                    {
                      orders.filter((o) =>
                        ["picked_up", "approaching", "in_transit"].includes(
                          o.status
                        )
                      ).length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("inDelivery")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {orders.filter((o) => o.status === "completed").length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("completed")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-500">{t("loadingOrdersText")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                {t("searchResults")} ({filteredOrders.length} {t("of")}{" "}
                {orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 sm:grid-cols-5 w-full max-w-none lg:max-w-4xl">
                  <TabsTrigger
                    value="all"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("allOrders")}</span>
                    <span className="sm:hidden">{t("all")}</span>
                    <span className="ml-1 rtl:mr-1">
                      ({filteredOrders.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="available"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("available")}</span>
                    <span className="sm:hidden">{t("available")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "available")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="picked_up"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("inProgress")}</span>
                    <span className="sm:hidden">{t("inProgress")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "picked_up")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="approaching"
                    className="text-xs sm:text-sm px-2 sm:px-4 hidden sm:flex"
                  >
                    <span className="hidden lg:inline">{t("approaching")}</span>
                    <span className="lg:hidden">{t("enRoute")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "approaching")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("completed")}</span>
                    <span className="sm:hidden">{t("done")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredOrders.filter((o) => o.status === "completed")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <ResponsiveOrdersTable
                    orders={filteredOrders}
                    status="all"
                    onViewOrder={handleViewOrder}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="available" className="mt-0">
                  <ResponsiveOrdersTable
                    orders={filteredOrders}
                    status="available"
                    onViewOrder={handleViewOrder}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="picked_up" className="mt-0">
                  <ResponsiveOrdersTable
                    orders={filteredOrders}
                    status="picked_up"
                    onViewOrder={handleViewOrder}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="approaching" className="mt-0">
                  <ResponsiveOrdersTable
                    orders={filteredOrders}
                    status="approaching"
                    onViewOrder={handleViewOrder}
                    t={t}
                  />
                </TabsContent>

                <TabsContent value="completed" className="mt-0">
                  <ResponsiveOrdersTable
                    orders={filteredOrders}
                    status="completed"
                    onViewOrder={handleViewOrder}
                    t={t}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            isOpen={isDetailsOpen}
            onClose={handleCloseDetails}
            onStatusUpdate={handleOrderStatusUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
