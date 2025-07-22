// Enhanced Admin Complaints Component with Driver/Customer Notification Handling

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
  ExternalLink,
  User,
  Mail,
  Calendar,
  FileText,
  Hash,
  AlertTriangle,
  Car,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";

interface ComplaintType {
  id: string;
  complaint_number: number;
  user_id: string;
  issue_type: string;
  description: string;
  order_number?: string;
  status: "pending" | "resolved";
  created_at: string;
  attachment_url?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email?: string;
    user_type?: string;
  };
}

interface ComplaintDetailsModalProps {
  complaint: ComplaintType | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const { t, language } = useLanguage();
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const getIssueTypeLabel = (type: string) => {
    const types = {
      login: t("issueTypeLogin"),
      order: t("issueTypeOrder"),
      payment: t("issueTypePayment"),
      driver: t("issueTypeDriver"),
      customer: t("issueTypeCustomer"),
      other: t("issueTypeOther"),
    };
    return types[type as keyof typeof types] || type;
  };

  const getIssueTypeBadgeStyle = (type: string) => {
    const styles = {
      login: "bg-blue-100 text-blue-800 border-blue-200",
      order: "bg-purple-100 text-purple-800 border-purple-200",
      payment: "bg-green-100 text-green-800 border-green-200",
      driver: "bg-orange-100 text-orange-800 border-orange-200",
      customer: "bg-teal-100 text-teal-800 border-teal-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      styles[type as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getUserTypeBadge = (userType: string) => {
    if (userType === "driver") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
          <Car className="h-3 w-3" />
          {t("driver")}
        </Badge>
      );
    } else if (userType === "customer") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
          <ShoppingCart className="h-3 w-3" />
          {t("customer")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        {userType || t("notSpecified")}
      </Badge>
    );
  };

  const sendNotificationBasedOnUserType = async (
    userId: string,
    userType: string,
    title: string,
    message: string,
    notificationType: string
  ) => {
    try {
      const notificationData = {
        title,
        message,
        notification_type: notificationType,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (userType === "driver") {
        // Send to driver_notifications table
        await supabase.from("driver_notifications").insert({
          ...notificationData,
          driver_id: userId,
        });
      } else if (userType === "customer") {
        // Send to customer_notifications table
        await supabase.from("customer_notifications").insert({
          ...notificationData,
          customer_id: userId,
        });
      } else {
        // Fallback: try both tables
        console.warn(
          `Unknown user type: ${userType}, trying both notification tables`
        );

        // Try driver table first
        try {
          await supabase.from("driver_notifications").insert({
            ...notificationData,
            driver_id: userId,
          });
        } catch (driverError) {
          console.log(
            "Failed to insert into driver_notifications, trying customer_notifications"
          );

          // If driver fails, try customer
          await supabase.from("customer_notifications").insert({
            ...notificationData,
            customer_id: userId,
          });
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  };

  const sendAdminEmailNotification = async (
    complaintData,
    adminResponse,
    userId
  ) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, first_name, last_name, user_type")
        .eq("id", userId)
        .single();

      if (!profile) {
        console.log("No profile found for user");
        return;
      }

      if (!profile.email) {
        console.log("No email found for user profile");
        return;
      }

      console.log("Attempting to send admin response email to:", profile.email);

      const currentLanguage = language;
      const userType = profile.user_type || "customer";

      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke("send-admin-response", {
          body: {
            to: profile.email,
            language: currentLanguage,
            userType: userType,
            complaintData: {
              ...complaintData,
              userName: `${profile.first_name} ${profile.last_name}`.trim(),
              userEmail: profile.email,
            },
            adminResponse: adminResponse,
          },
        });

      if (emailError) {
        console.error("Error sending admin response email:", emailError);
      } else {
        console.log("Admin response email sent successfully:", emailResult);
      }
    } catch (error) {
      console.error("Error in sendAdminEmailNotification:", error);
    }
  };

  const markAsResolved = async () => {
    if (!complaint) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status: "resolved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaint.id);

      if (error) throw error;

      if (response.trim()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("complaint_responses").insert({
          complaint_id: complaint.id,
          admin_id: user?.id,
          response: response.trim(),
          created_at: new Date().toISOString(),
        });
      }

      await sendAdminEmailNotification(
        {
          id: complaint.id,
          complaint_number: complaint.complaint_number,
          issue_type: complaint.issue_type,
          description: complaint.description,
          order_number: complaint.order_number,
          created_at: complaint.created_at,
        },
        response.trim() || null,
        complaint.user_id
      );

      const notificationMessage = response.trim()
        ? t("complaintResolvedWithResponse")
            .replace("{complaintNumber}", complaint.complaint_number.toString())
            .replace("{issueType}", getIssueTypeLabel(complaint.issue_type))
            .replace("{response}", response.trim())
        : t("complaintResolvedWithoutResponse")
            .replace("{complaintNumber}", complaint.complaint_number.toString())
            .replace("{issueType}", getIssueTypeLabel(complaint.issue_type));

      const userType = complaint.profiles?.user_type || "customer";

      await sendNotificationBasedOnUserType(
        complaint.user_id,
        userType,
        t("complaintResolvedTitle"),
        notificationMessage,
        "complaint_resolved"
      );
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      onStatusUpdate?.();
      onClose();
    } catch (error) {
      console.error("Error updating complaint:", error);
      toast.error(t("errorUpdatingComplaint"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold text-left">
            {t("complaintDetails")} {complaint.complaint_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* User Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {t("userName")}
              </p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm sm:text-base">
                  {complaint.profiles
                    ? `${complaint.profiles.first_name || ""} ${
                        complaint.profiles.last_name || ""
                      }`.trim()
                    : t("notAvailable")}
                </p>
                {getUserTypeBadge(complaint.profiles?.user_type || "")}
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                {t("emailAddress")}
              </p>
              <p className="font-medium text-sm sm:text-base break-all">
                {complaint.profiles?.email || t("notAvailable")}
              </p>
            </div>
          </div>

          {/* Complaint Information */}
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("issueType")}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs sm:text-sm whitespace-nowrap ${getIssueTypeBadgeStyle(
                    complaint.issue_type
                  )}`}
                >
                  {getIssueTypeLabel(complaint.issue_type)}
                </Badge>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("orderNumber")}
                </p>
                <p className="font-medium text-sm sm:text-base">
                  {complaint.order_number || t("notSpecified")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                {t("problemDescription")}
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm leading-relaxed">
                  {complaint.description}
                </p>
              </div>
            </div>

            {complaint.attachment_url && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                  {t("attachment")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(complaint.attachment_url, "_blank")
                  }
                  className="gap-2 text-xs sm:text-sm"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  {t("viewAttachment")}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("submissionDate")}
                </p>
                <p className="font-medium text-xs sm:text-sm">
                  {new Date(complaint.created_at).toLocaleDateString(
                    language === "ar" ? "ar-SA" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                  {t("status")}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs sm:text-sm ${
                    complaint.status === "resolved"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                >
                  {complaint.status === "resolved"
                    ? t("statusResolved")
                    : t("statusPending")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Admin Response */}
          {complaint.status !== "resolved" && (
            <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                  {t("adminResponse")}
                </label>
                <Textarea
                  placeholder={t("writeResponsePlaceholder")}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[80px] sm:min-h-[100px] text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("responseNotificationNote")}
                  {complaint.profiles?.user_type && (
                    <span className="font-medium">
                      {" "}
                      (
                      {complaint.profiles.user_type === "driver"
                        ? t("driverNotification")
                        : t("customerNotification")}
                      )
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={markAsResolved}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-sm"
                >
                  {isLoading ? t("updatingComplaint") : t("markAsResolved")}
                </Button>
                <Button variant="outline" onClick={onClose} className="text-sm">
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Mobile Card Component with enhanced user type display
const MobileComplaintCard: React.FC<{
  complaint: ComplaintType;
  onViewComplaint: (complaint: ComplaintType) => void;
}> = ({ complaint, onViewComplaint }) => {
  const { t, language } = useLanguage();

  const getIssueTypeLabel = (type: string) => {
    const types = {
      login: t("issueTypeLogin"),
      order: t("issueTypeOrder"),
      payment: t("issueTypePayment"),
      driver: t("issueTypeDriver"),
      customer: t("issueTypeCustomer"),
      other: t("issueTypeOther"),
    };
    return types[type as keyof typeof types] || type;
  };

  const getIssueTypeBadgeStyle = (type: string) => {
    const styles = {
      login: "bg-blue-100 text-blue-800 border-blue-200",
      order: "bg-purple-100 text-purple-800 border-purple-200",
      payment: "bg-green-100 text-green-800 border-green-200",
      driver: "bg-orange-100 text-orange-800 border-orange-200",
      customer: "bg-teal-100 text-teal-800 border-teal-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      styles[type as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getUserTypeBadge = (userType: string) => {
    if (userType === "driver") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs">
          <Car className="h-3 w-3" />
          {t("driver")}
        </Badge>
      );
    } else if (userType === "customer") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1 text-xs">
          <ShoppingCart className="h-3 w-3" />
          {t("customer")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
        {userType || t("notSpecified")}
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
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getUserName = (profiles: any) => {
    if (!profiles) return t("notAvailable");
    const firstName = profiles.first_name || "";
    const lastName = profiles.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || t("notAvailable");
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="font-bold text-lg">
                {complaint.complaint_number}
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                complaint.status === "resolved"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
              }`}
            >
              {complaint.status === "resolved"
                ? t("statusResolved")
                : t("statusPending")}
            </Badge>
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{t("user")}:</span>
                <span className="font-medium">
                  {getUserName(complaint.profiles)}
                </span>
              </div>
              {getUserTypeBadge(complaint.profiles?.user_type || "")}
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-600">{t("email")}:</span>
              <span className="font-medium break-all text-left">
                {complaint.profiles?.email || t("notAvailable")}
              </span>
            </div>
          </div>

          {/* Complaint Details */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t("issueType")}:</span>
              <Badge
                variant="outline"
                className={`text-xs sm:text-sm whitespace-nowrap ${getIssueTypeBadgeStyle(
                  complaint.issue_type
                )}`}
              >
                {getIssueTypeLabel(complaint.issue_type)}
              </Badge>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("orderNumber")}:</span>
              <span className="font-medium">
                {complaint.order_number || t("notSpecified")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{t("date")}:</span>
              <span className="font-medium">
                {formatDate(complaint.created_at)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-gray-600 text-sm">
                {t("problemDescription")}:
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-800 bg-gray-50 p-3 rounded-lg">
              {complaint.description}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewComplaint(complaint)}
              className="w-full gap-2"
            >
              <Eye className="h-4 w-4" />
              {t("viewFullDetails")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ComplaintsTableProps {
  complaints: ComplaintType[];
  status?: "all" | "pending" | "resolved";
  onViewComplaint: (complaint: ComplaintType) => void;
}

const ResponsiveComplaintsTable: React.FC<ComplaintsTableProps> = ({
  complaints,
  status = "all",
  onViewComplaint,
}) => {
  const { t, language } = useLanguage();

  const filteredComplaints =
    status === "all"
      ? complaints
      : complaints.filter((complaint) => complaint.status === status);

  const getIssueTypeLabel = (type: string) => {
    const types = {
      login: t("issueTypeLogin"),
      order: t("issueTypeOrder"),
      payment: t("issueTypePayment"),
      driver: t("issueTypeDriver"),
      customer: t("issueTypeCustomer"),
      other: t("issueTypeOther"),
    };
    return types[type as keyof typeof types] || type;
  };

  const getIssueTypeBadgeStyle = (type: string) => {
    const styles = {
      login: "bg-blue-100 text-blue-800 border-blue-200",
      order: "bg-purple-100 text-purple-800 border-purple-200",
      payment: "bg-green-100 text-green-800 border-green-200",
      driver: "bg-orange-100 text-orange-800 border-orange-200",
      customer: "bg-teal-100 text-teal-800 border-teal-200",
      other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      styles[type as keyof typeof styles] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getUserTypeBadge = (userType: string) => {
    if (userType === "driver") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1 text-xs">
          <Car className="h-3 w-3" />
          {t("driver")}
        </Badge>
      );
    } else if (userType === "customer") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 gap-1 text-xs">
          <ShoppingCart className="h-3 w-3" />
          {t("customer")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">
        {userType || t("notSpecified")}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return t("invalidDate");
      return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return t("invalidDate");
    }
  };

  const getUserName = (profiles: any) => {
    if (!profiles) return t("notAvailable");
    const firstName = profiles.first_name || "";
    const lastName = profiles.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || t("notAvailable");
  };

  if (filteredComplaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <FileText className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">{t("noComplaintsInCategory")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("complaintNumber")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("user")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("userType")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("email")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("issueTypeHeader")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("date")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("status")}
                </TableHead>
                <TableHead className="text-center whitespace-nowrap font-bold">
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id} className="hover:bg-gray-50">
                  <TableCell className="font-semibold text-center">
                    {complaint.complaint_number}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[140px] truncate"
                      title={getUserName(complaint.profiles)}
                    >
                      {getUserName(complaint.profiles)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getUserTypeBadge(complaint.profiles?.user_type || "")}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="max-w-[180px] truncate"
                      title={complaint.profiles?.email || t("notAvailable")}
                    >
                      {complaint.profiles?.email || t("notAvailable")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`text-xs whitespace-nowrap ${getIssueTypeBadgeStyle(
                        complaint.issue_type
                      )}`}
                    >
                      {getIssueTypeLabel(complaint.issue_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center whitespace-nowrap text-sm">
                    {formatDate(complaint.created_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`whitespace-nowrap text-xs ${
                        complaint.status === "resolved"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }`}
                    >
                      {complaint.status === "resolved"
                        ? t("statusResolved")
                        : t("statusPending")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewComplaint(complaint)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block lg:hidden space-y-4">
        {filteredComplaints.map((complaint) => (
          <MobileComplaintCard
            key={complaint.id}
            complaint={complaint}
            onViewComplaint={onViewComplaint}
          />
        ))}
      </div>
    </>
  );
};

// Main Complaints Component - Enhanced with customer support
const Complaints: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIssueType, setFilterIssueType] = useState("all");
  const [selectedComplaint, setSelectedComplaint] =
    useState<ComplaintType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    data: complaintsData = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            first_name,
            last_name,
            email,
            user_type
          )
        `
        )
        .order("complaint_number", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
        throw error;
      }

      return (data || []) as ComplaintType[];
    },
    staleTime: 0, // Always refetch when component mounts
    cacheTime: 0, // Don't cache the data
  });

  // Add useEffect to refetch on mount
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // Add error handling
  React.useEffect(() => {
    if (error) {
      console.error("Error fetching complaints:", error);
      toast.error(t("errorLoadingComplaints"));
    }
  }, [error, t]);

  const handleViewComplaint = (complaint: ComplaintType) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = () => {
    refetch();
    toast.success(t("complaintStatusUpdated"));
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedComplaint(null);
  };

  const handleExportComplaints = () => {
    const headers = [
      t("complaintNumber"),
      t("userName"),
      t("userType"),
      t("email"),
      t("issueType"),
      t("problemDescription"),
      t("orderNumber"),
      t("date"),
      t("status"),
    ];

    const csvData = complaintsData.map((complaint) => [
      complaint.complaint_number?.toString() || "",
      complaint.profiles
        ? `${complaint.profiles.first_name || ""} ${
            complaint.profiles.last_name || ""
          }`.trim()
        : t("notAvailable"),
      complaint.profiles?.user_type || t("notSpecified"),
      complaint.profiles?.email || t("notAvailable"),
      complaint.issue_type || "",
      complaint.description || "",
      complaint.order_number || t("notSpecified"),
      new Date(complaint.created_at).toLocaleDateString(
        language === "ar" ? "ar-SA" : "en-US"
      ),
      complaint.status === "resolved"
        ? t("statusResolved")
        : t("statusPending"),
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
      `complaints-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("exportSuccess"));
  };

  const filteredComplaints = complaintsData.filter((complaint) => {
    const userName = complaint.profiles
      ? `${complaint.profiles.first_name || ""} ${
          complaint.profiles.last_name || ""
        }`.trim()
      : "";

    const matchesSearch =
      complaint.complaint_number?.toString().includes(searchTerm) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.profiles?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.order_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesIssueType =
      filterIssueType === "all" || complaint.issue_type === filterIssueType;

    return matchesSearch && matchesIssueType;
  });

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
                  {t("errorLoadingComplaints")}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  {t("retryLoading")}
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
          <div className="flex flex-col lg:items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {t("complaintsManagementTitle")}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t("complaintsManagementDescription")}
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("searchComplaints")}
                  className="pr-10 text-left"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter */}
              <Select
                defaultValue={filterIssueType}
                onValueChange={setFilterIssueType}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder={t("issueType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTypes")}</SelectItem>
                  <SelectItem value="login">{t("issueTypeLogin")}</SelectItem>
                  <SelectItem value="order">{t("issueTypeOrder")}</SelectItem>
                  <SelectItem value="payment">
                    {t("issueTypePayment")}
                  </SelectItem>
                  <SelectItem value="driver">{t("issueTypeDriver")}</SelectItem>
                  <SelectItem value="customer">
                    {t("issueTypeCustomer")}
                  </SelectItem>
                  <SelectItem value="other">{t("issueTypeOther")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button
                variant="outline"
                className="gap-2 whitespace-nowrap"
                onClick={handleExportComplaints}
                disabled={complaintsData.length === 0}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("exportComplaints")}
                </span>
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
                    {complaintsData.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("totalComplaints")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                    {
                      complaintsData.filter((c) => c.status === "pending")
                        .length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("pendingReview")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {
                      complaintsData.filter((c) => c.status === "resolved")
                        .length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("resolved")}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">
                    {complaintsData.length > 0
                      ? Math.round(
                          (complaintsData.filter((c) => c.status === "resolved")
                            .length /
                            complaintsData.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {t("resolutionRate")}
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
                <p className="text-gray-500">{t("loadingComplaints")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Content */
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg sm:text-xl">
                {t("searchResultsCount")
                  .replace("{count}", filteredComplaints.length.toString())
                  .replace("{total}", complaintsData.length.toString())}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-4 lg:p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 w-full max-w-none lg:max-w-2xl">
                  <TabsTrigger
                    value="all"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">
                      {t("allComplaints")}
                    </span>
                    <span className="sm:hidden">{t("all")}</span>
                    <span className="ml-1 rtl:mr-1">
                      ({filteredComplaints.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">
                      {t("pendingReview")}
                    </span>
                    <span className="sm:hidden">{t("pending")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredComplaints.filter((c) => c.status === "pending")
                          .length
                      }
                      )
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="resolved"
                    className="text-xs sm:text-sm px-2 sm:px-4"
                  >
                    <span className="hidden sm:inline">{t("resolved")}</span>
                    <span className="sm:hidden">{t("resolvedTab")}</span>
                    <span className="ml-1 rtl:mr-1">
                      (
                      {
                        filteredComplaints.filter(
                          (c) => c.status === "resolved"
                        ).length
                      }
                      )
                    </span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <ResponsiveComplaintsTable
                    complaints={filteredComplaints}
                    onViewComplaint={handleViewComplaint}
                  />
                </TabsContent>

                <TabsContent value="pending" className="mt-0">
                  <ResponsiveComplaintsTable
                    complaints={filteredComplaints}
                    status="pending"
                    onViewComplaint={handleViewComplaint}
                  />
                </TabsContent>

                <TabsContent value="resolved" className="mt-0">
                  <ResponsiveComplaintsTable
                    complaints={filteredComplaints}
                    status="resolved"
                    onViewComplaint={handleViewComplaint}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Complaint Details Modal */}
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default Complaints;
