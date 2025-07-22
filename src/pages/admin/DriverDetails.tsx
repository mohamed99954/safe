import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DriverInfoCard } from "@/components/admin/driver/DriverInfoCard";
import { DriverActions } from "@/components/admin/driver/DriverActions";
import { RejectionDialog } from "@/components/admin/driver/RejectionDialog";
import { Eye, Download, X, Trash2 } from "lucide-react";
import Cookies from "js-cookie";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

interface DriverDetails {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  birth_date?: string;
  address?: string;
  email?: string;
  national_id?: string;
  license_number?: string;
  id_image?: string;
  license_image?: string;
  vehicle_info?: {
    make?: string;
    model?: string;
    year?: string;
    plateNumber?: string;
  };
  status?: string;
  rejection_reason?: string;
}

const ImageViewer = ({
  src,
  alt,
  title,
  onClose,
}: {
  src: string;
  alt: string;
  title: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="relative max-h-screen p-4 w-auto m-auto">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-safedrop-gold hover:bg-safedrop-gold/90 text-white"
        onClick={onClose}
      >
        <X size={16} />
      </Button>
      <div className=" rounded-lg p-6 max-h-full overflow-auto">
        <h3 className="text-lg font-bold mb-4 text-center">{title}</h3>
        <div className="flex justify-center">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  </div>
);

const ImageCard = ({
  src,
  alt,
  title,
  onView,
  onDownload,
  onDelete,
  t,
}: {
  src: string;
  alt: string;
  title: string;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}) => (
  <div className="space-y-3">
    <h4 className="text-base font-medium text-center text-gray-700">{title}</h4>
    <div className="relative group">
      <div className="w-full h-48 rounded-lg border border-gray-200 overflow-hidden">
        <img src={src} alt={alt} className="w-full h-full object-contain" />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-x-2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onView}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-700 shadow-md"
          >
            <Eye size={16} className="mr-1" />
            {t("view")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onDownload}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-700 shadow-md"
          >
            <Download size={16} className="mr-1" />
            {t("download")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            className="bg-white bg-opacity-95 hover:bg-opacity-100 text-red-700 shadow-md"
          >
            <Trash2 size={16} className="mr-1" />
            {t("delete")}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const DriverDetailsContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [driver, setDriver] = useState<DriverDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<{
    url: string;
    type: "id_image" | "license_image";
  } | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    src: string;
    alt: string;
    title: string;
  } | null>(null);

  const checkAdminAccess = useCallback(async () => {
    try {
      const adminAuthLS = localStorage.getItem("adminAuth") === "true";
      const adminAuthCookie = Cookies.get("adminAuth") === "true";

      if (!adminAuthLS && !adminAuthCookie) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (roleData) {
            localStorage.setItem("adminAuth", "true");
            Cookies.set("adminAuth", "true");
            return true;
          }
        }

        toast.error(t("noAdminPermission"));
        navigate("/admin/login");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast.error(t("adminAccessError"));
      navigate("/admin/login");
      return false;
    }
  }, [navigate, t]);

  const fetchDriverDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const hasAccess = await checkAdminAccess();
      if (!hasAccess) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (driverError && driverError.code !== "PGRST116") {
        console.error("Driver error:", driverError);
        throw driverError;
      }

      let userEmail = profileData?.email || null;

      if (!userEmail) {
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", id)
            .single();
          userEmail = userData?.email;
        } catch (e) {
          console.error("Could not fetch user email:", e);
        }
      }

      const combinedData = {
        ...profileData,
        ...(driverData || {}),
        email: userEmail || profileData?.email,
      };

      setDriver(combinedData);
    } catch (error) {
      console.error("Error fetching driver details:", error);
      toast.error(t("dataFetchError"));
    } finally {
      setLoading(false);
    }
  }, [id, checkAdminAccess, t]);

  const saveDriverStatus = async (
    status: string,
    rejectionReason: string | null = null
  ) => {
    if (!driver?.id) {
      toast.error(t("invalidDriverId"));
      return null;
    }

    try {
      // Verify admin access before proceeding
      const hasAccess = await checkAdminAccess();
      if (!hasAccess) {
        throw new Error(t("noAdminPermission"));
      }

      const updateData = {
        status: status,
        rejection_reason: rejectionReason || null,
      };

      // Check if driver record exists first
      const { data: existingDriver, error: checkError } = await supabase
        .from("drivers")
        .select("id")
        .eq("id", driver.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking if driver exists:", checkError);
        throw checkError;
      }

      let result;

      // If driver record exists, update it, otherwise create it
      if (existingDriver) {
        const { data, error } = await supabase
          .from("drivers")
          .update(updateData)
          .eq("id", driver.id)
          .select();

        if (error) {
          console.error("Error updating driver status:", error);
          throw error;
        }
        result = data;
      } else {
        const fullData = {
          id: driver.id,
          status: status,
          rejection_reason: rejectionReason || null,
          national_id: driver.national_id || "",
          license_number: driver.license_number || "",
          vehicle_info: driver.vehicle_info || {},
        };

        const { data: upsertData, error: upsertError } = await supabase
          .from("drivers")
          .upsert(fullData)
          .select();

        if (upsertError) {
          console.error("Error creating driver record:", upsertError);
          throw upsertError;
        }
        result = upsertData;
      }
      return result;
    } catch (error: unknown) {
      console.error("Driver status update failed:", error);
      throw error;
    }
  };

  const sendDriverStatusEmail = async (
    driverData,
    status,
    rejectionReason = null
  ) => {
    try {
      if (!driverData.email) {
        console.log("No email found for driver");
        return;
      }

      console.log(`Attempting to send ${status} email to:`, driverData.email);

      const currentLanguage = language;

      const emailDriverData = {
        driverName: `${driverData.first_name || ""} ${
          driverData.last_name || ""
        }`.trim(),
        first_name: driverData.first_name,
        last_name: driverData.last_name,
        national_id: driverData.national_id,
        license_number: driverData.license_number,
        id: driverData.id,
      };

      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke("send-driver-status-email", {
          body: {
            to: driverData.email,
            driverData: emailDriverData,
            status: status,
            rejectionReason: rejectionReason,
            language: currentLanguage,
          },
        });

      if (emailError) {
        console.error("Error sending driver status email:", emailError);
      } else {
        console.log("Driver status email sent successfully:", emailResult);
      }
    } catch (error) {
      console.error("Error in sendDriverStatusEmail:", error);
    }
  };

  const approveDriver = async () => {
    if (!driver?.id) {
      toast.error(t("invalidDriverId"));
      return;
    }

    setProcessingAction(true);
    try {
      const result = await saveDriverStatus("approved");

      if (result) {
        await sendDriverStatusEmail(driver, "approved");

        toast.success(t("driverApprovedSuccess"));

        setDriver((prev) =>
          prev ? { ...prev, status: "approved", rejection_reason: null } : null
        );

        setTimeout(() => navigate("/admin/driver-verification"), 1500);
      } else {
        throw new Error(t("statusUpdateError"));
      }
    } catch (error: unknown) {
      console.error("Error approving driver:", error);
      toast.error((error as Error).message || t("statusUpdateError"));
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectDriver = async () => {
    if (!driver?.id) {
      toast.error(t("invalidDriverId"));
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error(t("rejectionReasonRequired"));
      return;
    }

    setProcessingAction(true);
    try {
      const result = await saveDriverStatus("rejected", rejectionReason);

      if (result) {
        await sendDriverStatusEmail(driver, "rejected", rejectionReason.trim());

        toast.success(t("driverRejectedSuccess"));

        setShowRejectDialog(false);
        setDriver((prev) =>
          prev
            ? { ...prev, status: "rejected", rejection_reason: rejectionReason }
            : null
        );

        setTimeout(() => navigate("/admin/driver-verification"), 1500);
      } else {
        throw new Error(t("statusUpdateError"));
      }
    } catch (error: unknown) {
      console.error("Error rejecting driver:", error);
      toast.error((error as Error).message || t("statusUpdateError"));
    } finally {
      setProcessingAction(false);
    }
  };

  const handleImageView = (src: string, alt: string, title: string) => {
    setViewingImage({ src, alt, title });
  };

  const handleImageDownload = async (src: string, filename: string) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("imageDownloadSuccess"));
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error(t("imageDownloadError"));
    }
  };

  const handleImageDelete = async (
    documentType: "id_image" | "license_image"
  ) => {
    if (!driver) return;

    const documentUrl =
      documentType === "id_image" ? driver.id_image : driver.license_image;
    if (!documentUrl) return;

    setDocumentToDelete({ url: documentUrl, type: documentType });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    setShowDeleteDialog(false);
    await deleteDocument(documentToDelete.url, documentToDelete.type);
    setDocumentToDelete(null);
  };

  const deleteDocument = async (
    documentUrl: string,
    documentType: "id_image" | "license_image"
  ) => {
    try {
      const hasAccess = await checkAdminAccess();
      if (!hasAccess) return;

      const folder = documentType === "id_image" ? "id-cards" : "licenses";
      let fileDeleted = false;

      // Try direct deletion first
      try {
        const url = new URL(documentUrl);
        const pathParts = url.pathname.split("/");
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from("driver-documents")
          .remove([filePath]);

        if (!error) {
          fileDeleted = true;
        }
      } catch (urlError) {
        console.log("Direct deletion failed, trying file listing approach");
      }

      // If direct deletion failed, try listing files and finding a match
      if (!fileDeleted) {
        const { data: fileList, error: listError } = await supabase.storage
          .from("driver-documents")
          .list(folder);

        if (!listError && fileList) {
          const urlParts = documentUrl.split("/");
          const lastPart = urlParts[urlParts.length - 1];

          const foundFile = fileList.find(
            (file) =>
              file.name === lastPart ||
              file.name.includes(lastPart) ||
              (driver?.id && file.name.includes(driver.id))
          );

          if (foundFile) {
            const correctPath = `${folder}/${foundFile.name}`;
            const { error } = await supabase.storage
              .from("driver-documents")
              .remove([correctPath]);

            if (!error) {
              fileDeleted = true;
            }
          }
        }
      }

      if (!fileDeleted) {
        toast.error(t("documentDeleteError"));
        return;
      }

      // Update the database to remove the document URL
      const updateData = {
        [documentType]: null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("drivers")
        .update(updateData)
        .eq("id", driver?.id);

      if (updateError) {
        console.error("Error updating driver record:", updateError);
        toast.error(t("databaseUpdateError"));
        return;
      }

      // Update local state
      setDriver((prev) => (prev ? { ...prev, [documentType]: null } : null));

      toast.success(t("documentDeletedSuccess"));
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(t("documentDeleteError"));
    }
  };

  useEffect(() => {
    fetchDriverDetails();
  }, [fetchDriverDetails]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-xl">{t("loadingData")}</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-6">
        <div className="text-xl text-red-600">{t("driverNotFound")}</div>
        <Button
          className="mt-4"
          onClick={() => navigate("/admin/driver-verification")}
        >
          {t("back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/admin/driver-verification")}
      >
        {t("back")}
      </Button>

      <div className="space-y-6">
        {/* Driver Info Card with Documents */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t("driverDetails")}
            </CardTitle>
          </CardHeader>
          <DriverInfoCard {...driver} />

          {/* Driver Documents Section inside the same card */}
          {(driver.id_image || driver.license_image) && (
            <CardContent className="px-6 pb-6">
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-center mb-6">
                  {t("driverDocuments")}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {driver.id_image && (
                    <ImageCard
                      src={driver.id_image}
                      alt={t("idImage")}
                      title={t("idImage")}
                      onView={() =>
                        handleImageView(
                          driver.id_image!,
                          t("idImage"),
                          t("idImage")
                        )
                      }
                      onDownload={() =>
                        handleImageDownload(
                          driver.id_image!,
                          `${driver.first_name}_${driver.last_name}_ID.jpg`
                        )
                      }
                      onDelete={() => handleImageDelete("id_image")}
                      t={t}
                    />
                  )}
                  {driver.license_image && (
                    <ImageCard
                      src={driver.license_image}
                      alt={t("licenseImage")}
                      title={t("licenseImage")}
                      onView={() =>
                        handleImageView(
                          driver.license_image!,
                          t("licenseImage"),
                          t("licenseImage")
                        )
                      }
                      onDownload={() =>
                        handleImageDownload(
                          driver.license_image!,
                          `${driver.first_name}_${driver.last_name}_License.jpg`
                        )
                      }
                      onDelete={() => handleImageDelete("license_image")}
                      t={t}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          )}

          {/* No Documents Message inside the same card */}
          {!driver.id_image && !driver.license_image && (
            <CardContent className="px-6 pb-6">
              <div className="border-t pt-6 text-center text-gray-500">
                <p>{t("noDocuments")}</p>
              </div>
            </CardContent>
          )}

          <DriverActions
            status={driver.status}
            onApprove={approveDriver}
            onReject={() => setShowRejectDialog(true)}
            processingAction={processingAction}
          />
        </Card>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewer
          src={viewingImage.src}
          alt={viewingImage.alt}
          title={viewingImage.title}
          onClose={() => setViewingImage(null)}
        />
      )}

      {/* Rejection Dialog */}
      <RejectionDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        onConfirm={rejectDriver}
        onCancel={() => {
          setShowRejectDialog(false);
          setRejectionReason("");
        }}
        rejectionReason={rejectionReason}
        onReasonChange={setRejectionReason}
        processing={processingAction}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDeleteDocument")}</DialogTitle>
            <DialogDescription>
              {t("deleteDocumentWarning") ||
                "Are you sure you want to delete this document? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDocumentToDelete(null);
              }}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DriverDetails = () => {
  return (
    <LanguageProvider>
      <DriverDetailsContent />
    </LanguageProvider>
  );
};

export default DriverDetails;
