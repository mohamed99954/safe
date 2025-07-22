import React from "react";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

interface DriverActionsProps {
  status?: string;
  onApprove: () => void;
  onReject: () => void;
  processingAction: boolean;
}

const DriverActionsContent = ({
  status,
  onApprove,
  onReject,
  processingAction,
}: DriverActionsProps) => {
  const { t, language } = useLanguage();

  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <CardFooter className="flex justify-center gap-4 pt-4">
      <Button
        variant="outline"
        className="bg-green-50 hover:bg-green-100 border-green-200 disabled:opacity-50"
        onClick={onApprove}
        disabled={processingAction || isApproved}
      >
        {processingAction && !isApproved ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <Check size={16} className="ml-1" />
        )}
        {isApproved ? t("alreadyApproved") : t("approve")}
      </Button>

      <Button
        variant="destructive"
        onClick={onReject}
        disabled={processingAction || isRejected}
        className="disabled:opacity-50"
      >
        {processingAction && !isRejected ? (
          <Loader2 size={16} className="mr-2 animate-spin" />
        ) : (
          <X size={16} className="ml-1" />
        )}
        {isRejected ? t("alreadyRejected") : t("reject")}
      </Button>
    </CardFooter>
  );
};

export const DriverActions = (props: DriverActionsProps) => {
  return (
    <LanguageProvider>
      <DriverActionsContent {...props} />
    </LanguageProvider>
  );
};
