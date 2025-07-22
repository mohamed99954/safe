import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
  processing: boolean;
}

const RejectionDialogContent = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  rejectionReason,
  onReasonChange,
  processing,
}: RejectionDialogProps) => {
  const { t, language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-left">
        <DialogHeader>
          <DialogTitle className="text-center">
            {t("rejectDriverRequest")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t("pleaseEnterRejectionReason")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder={t("rejectionReason")}
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={4}
            className="text-left"
          />
        </div>

        <DialogFooter className="flex sm:justify-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={processing || !rejectionReason.trim()}
          >
            {processing ? t("processing") : t("confirmRejection")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const RejectionDialog = (props: RejectionDialogProps) => {
  return (
    <LanguageProvider>
      <RejectionDialogContent {...props} />
    </LanguageProvider>
  );
};
