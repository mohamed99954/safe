import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

interface VehicleInfo {
  make?: string;
  model?: string;
  year?: string;
  plateNumber?: string;
}

interface DriverInfoCardProps {
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  birth_date?: string;
  address?: string;
  national_id?: string;
  license_number?: string;
  vehicle_info?: VehicleInfo;
  status?: string;
  rejection_reason?: string;
}

const DriverInfoCardContent = ({
  first_name,
  last_name,
  email,
  phone,
  birth_date,
  address,
  national_id,
  license_number,
  vehicle_info,
  status,
  rejection_reason,
}: DriverInfoCardProps) => {
  const { t, language } = useLanguage();

  const getStatusText = (status?: string) => {
    switch (status) {
      case "approved":
        return t("approved");
      case "rejected":
        return t("rejected");
      case "pending":
        return t("pending");
      default:
        return t("notSpecified");
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="font-bold">{t("firstName")}: </span>
              <span>{first_name || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("lastName")}: </span>
              <span>{last_name || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("email")}: </span>
              <span>{email || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("phone")}: </span>
              <span>{phone || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("birthDate")}: </span>
              <span>{birth_date || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("address")}: </span>
              <span>{address || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("status")}: </span>
              <span className={getStatusColor(status)}>
                {getStatusText(status)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="font-bold">{t("nationalId")}: </span>
              <span>{national_id || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("licenseNumber")}: </span>
              <span>{license_number || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("vehicleType")}: </span>
              <span>{vehicle_info?.make || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("vehicleModel")}: </span>
              <span>{vehicle_info?.model || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("manufacturingYear")}: </span>
              <span>{vehicle_info?.year || t("notAvailable")}</span>
            </div>

            <div>
              <span className="font-bold">{t("plateNumber")}: </span>
              <span>{vehicle_info?.plateNumber || t("notAvailable")}</span>
            </div>
          </div>
        </div>

        {status === "rejected" && rejection_reason && (
          <Alert className="mt-4 bg-red-50 border-red-200 text-left">
            <div className="font-bold mb-1">{t("rejectionReason")}:</div>
            <AlertDescription>{rejection_reason}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export const DriverInfoCard = (props: DriverInfoCardProps) => {
  return (
    <LanguageProvider>
      <DriverInfoCardContent {...props} />
    </LanguageProvider>
  );
};
