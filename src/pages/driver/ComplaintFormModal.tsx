import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";

const ComplaintFormModal = ({ trigger }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Dynamic schema with translations
  const complaintSchema = z.object({
    issue_type: z.string().min(1, { message: t("issueTypeRequired") }),
    description: z
      .string()
      .min(10, { message: t("problemDescriptionRequired") }),
    order_number: z.string().optional(),
  });

  type ComplaintFormValues = z.infer<typeof complaintSchema>;

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      issue_type: "",
      description: "",
      order_number: "",
    },
  });

  const issueTypes = [
    { value: "login", label: t("issueTypeLogin") },
    { value: "order", label: t("issueTypeOrder") },
    { value: "payment", label: t("issueTypePayment") },
    { value: "driver", label: t("issueTypeDriver") },
    { value: "other", label: t("issueTypeOther") },
  ];

  const getIssueTypeLabel = (type: string) => {
    const types = {
      login: t("issueTypeLogin"),
      order: t("issueTypeOrder"),
      payment: t("issueTypePayment"),
      driver: t("issueTypeDriver"),
      other: t("issueTypeOther"),
    };
    return types[type as keyof typeof types] || type;
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `complaint-attachments/${fileName}`;

      setUploadProgress(10);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("complaint-attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      setUploadProgress(80);

      const { data: urlData } = supabase.storage
        .from("complaint-attachments")
        .getPublicUrl(filePath);

      setUploadProgress(100);

      if (urlData?.publicUrl) {
        return urlData.publicUrl;
      }

      throw new Error("Failed to get public URL");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(t("fileUploadError"));
      return null;
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("fileTooLarge"));
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t("unsupportedFileType"));
        return;
      }

      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
  };

  const createNotifications = async (complaintData: any, userName: string) => {
    try {
      // Create user confirmation notification
      await supabase.from("driver_notifications").insert({
        driver_id: user.id,
        title: t("complaintConfirmationTitle"),
        message: t("complaintConfirmationMessage").replace(
          "{issueType}",
          getIssueTypeLabel(complaintData.issue_type)
        ),
        notification_type: "complaint_confirmation",
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Get admin users and create notifications for them
      let { data: admins, error: adminError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");

      // If no admins found with role, try user_type
      if (!admins || admins.length === 0) {
        const { data: adminsByType } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_type", "admin");

        if (adminsByType && adminsByType.length > 0) {
          admins = adminsByType;
        }
      }

      // If still no admins, try email patterns
      if (!admins || admins.length === 0) {
        const { data: adminsByEmail } = await supabase
          .from("profiles")
          .select("id")
          .or("email.ilike.%admin%,email.ilike.%support%");

        if (adminsByEmail && adminsByEmail.length > 0) {
          admins = adminsByEmail;
        }
      }

      // Create admin notifications
      if (admins && admins.length > 0) {
        const adminNotifications = admins.map((admin) => ({
          driver_id: admin.id,
          title: t("newComplaintTitle"),
          message: t("newComplaintMessage")
            .replace("{userName}", userName)
            .replace(
              "{issueType}",
              getIssueTypeLabel(complaintData.issue_type)
            ),
          notification_type: "complaint",
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        await supabase.from("driver_notifications").insert(adminNotifications);
      } else {
        console.warn("No admin users found for notifications");
      }
    } catch (error) {
      console.error("Error creating notifications:", error);
      // Don't fail the whole process if notifications fail
    }
  };

  const sendEmailNotification = async (complaintData) => {
    try {
      // Get user profile for email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (!profile) {
        console.log("No profile found for user");
        return;
      }

      console.log("Attempting to send email to:", profile.email);

      const currentLanguage = language;

      // Try to send email (this might fail if function doesn't exist)
      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke("send-complaint-confirmation", {
          body: {
            to: profile.email,
            language: currentLanguage,
            complaintData: {
              ...complaintData,
              userName: `${profile.first_name} ${profile.last_name}`,
              userEmail: profile.email,
            },
          },
        });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the complaint submission if email fails
      } else {
        console.log("Email sent successfully:", emailResult);
      }
    } catch (error) {
      console.error("Error in sendEmailNotification:", error);
      // Don't fail the complaint submission if email fails
    }
  };

  const onSubmit = async (data: ComplaintFormValues) => {
    if (!user?.id) {
      toast.error(t("loginRequired"));
      return;
    }

    setIsLoading(true);

    try {
      let attachmentUrl = null;

      // Upload file if exists
      if (uploadedFile) {
        setUploadProgress(0);
        attachmentUrl = await handleFileUpload(uploadedFile);
        if (!attachmentUrl) {
          setIsLoading(false);
          return;
        }
      }

      // Create complaint record
      const complaintData = {
        user_id: user.id,
        issue_type: data.issue_type,
        description: data.description,
        order_number: data.order_number || null,
        attachment_url: attachmentUrl,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert(complaintData)
        .select()
        .single();

      sendEmailNotification(complaint);

      if (complaintError) {
        console.error("Error creating complaint:", complaintError);
        throw complaintError;
      }

      // Get user profile for notifications
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();

      const userName = userProfile
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : t("defaultUserName");

      // Create notifications
      await createNotifications(complaintData, userName);

      toast.success(t("complaintSubmittedSuccess"));

      // Reset form and close modal
      form.reset();
      setUploadedFile(null);
      setUploadProgress(0);
      setIsOpen(false);
    } catch (error) {
      console.error("Error submitting complaint:", error);

      if (error.message?.includes("row-level security")) {
        toast.error(t("permissionError"));
      } else if (error.message?.includes("violates")) {
        toast.error(t("dataValidationError"));
      } else {
        toast.error(t("genericSubmissionError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t("reportProblem")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Issue Type */}
            <FormField
              control={form.control}
              name="issue_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("issueType")}{" "}
                    <span className="text-red-500">{t("requiredField")}</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectIssueType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Number */}
            <FormField
              control={form.control}
              name="order_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("orderNumber")}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder={t("enterOrderNumber")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    {t("problemDescription")}{" "}
                    <span className="text-red-500">{t("requiredField")}</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("describeProblemPlaceholder")}
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("attachFile")}</label>

              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    onChange={onFileChange}
                    accept="image/*,.pdf,.txt"
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {t("clickToSelectFile")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t("supportedFileTypes")}
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {uploadedFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-auto p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {t("uploadingFile")} {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Message */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">{t("reviewInfoMessage")}</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading}
              >
                {isLoading ? t("submitting") : t("submitComplaint")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintFormModal;
