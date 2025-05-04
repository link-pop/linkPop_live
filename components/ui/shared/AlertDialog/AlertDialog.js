"use client";

import { useContext } from "@/components/Context/Context";
import {
  AlertDialog as _AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Button2 from "../../shared/Button/Button2";
import capitalize from "@/lib/utils/capitalize";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import { X } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function AlertDialog() {
  const { dialog, dialogSet } = useContext();
  const { t } = useTranslation();

  // Process text content with translation if needed
  const processText = (text) => {
    if (dialog.isTranslationKey && text) {
      return t(text);
    }
    return text;
  };

  return (
    <_AlertDialog
      open={dialog.isOpen}
      onOpenChange={(isOpen) => dialogSet({ ...dialog, isOpen })}
      className={`${dialog.className}`}
    >
      <AlertDialogContent
        className={`p15 ${dialog.fixedCloseIcon ? "!p0" : ""} bg-background ${
          dialog.contentClassName
        }`}
        // TODO !!! ??? can brake user attachments dialog
        // style={{ overflow: "hidden" }}
      >
        {/* Close Icon */}
        {dialog.hasCloseIcon && (
          <div
            className={`poa r9 t5 z10 bg-accent hover:bg-accent/80 cp w32 h32 rf fcc ${
              dialog.fixedCloseIcon ? "!pos !mla !r5 !t5 !-mt120 " : ""
            }`}
            onClick={() => dialogSet({ isOpen: false })}
          >
            <X className="text-foreground" />
          </div>
        )}

        <div
          className={`oa`}
          // TODO !!! ??? can brake user attachments dialog
          // style={{ overflow: "hidden" }}
        >
          {(dialog.title || dialog.text) && (
            <AlertDialogHeader>
              {dialog.title && (
                <AlertDialogTitle
                  className={`line-clamp-2 tac text-foreground ${dialog.titleClassName}`}
                >
                  {capitalize(processText(dialog.title))}
                </AlertDialogTitle>
              )}
              {dialog.text && (
                <AlertDialogDescription
                  className={`line-clamp-10 t_1 tac text-muted-foreground`}
                >
                  {capitalize(removeHtmlFromText(processText(dialog.text)))}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
          )}

          {dialog?.comp}
        </div>

        {dialog?.showBtns !== false && (
          <AlertDialogFooter
            className={`fcc g5 px15 ${dialog.footerClassName}`}
          >
            {dialog.showCancelBtn !== false && (
              <Button2
                onClick={() => dialogSet({ isOpen: false })}
                variant={"outline"}
                text={dialog.cancelBtnText || t("cancel")}
              />
            )}
            <Button2
              onClick={() =>
                dialog?.action
                  ? (dialog.action(), dialogSet({ isOpen: false }))
                  : dialogSet({ isOpen: false })
              }
              variant={dialog.isDanger ? "danger" : "primary"}
              text={
                dialog.confirmBtnText ||
                (dialog.isDanger ? t("delete") : t("continue"))
              }
            />
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </_AlertDialog>
  );
}
