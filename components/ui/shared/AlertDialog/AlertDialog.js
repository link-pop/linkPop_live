"use client";

import { useContext } from "@/components/Context/Context";
import {
  AlertDialog as _AlertDialog,
  AlertDialogCancel,
  AlertDialogContent as AlertContent,
  AlertDialogDescription as AlertDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader as AlertHeader,
  AlertDialogTitle as AlertTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog as _Dialog,
  DialogContent as _DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Button2 from "../../shared/Button/Button2";
import capitalize from "@/lib/utils/capitalize";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import { X } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { cn } from "@/lib/utils";
import React from "react";

// Custom DialogContent without the default close button
const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export default function AlertDialog() {
  const { dialog, dialogSet } = useContext();
  const { t } = useTranslation();

  // Check if we should use alert dialog or regular dialog
  const useAlert = dialog.alert === true || dialog.alert !== undefined;

  // Define components based on the type of dialog
  const DialogRoot = useAlert ? _AlertDialog : _Dialog;
  const Content = useAlert ? AlertContent : DialogContent;
  const Header = useAlert ? AlertHeader : DialogHeader;
  const Title = useAlert ? AlertTitle : DialogTitle;
  const Description = useAlert ? AlertDescription : DialogDescription;
  const Footer = useAlert ? AlertFooter : DialogFooter;

  // Process text content with translation if needed
  const processText = (text) => {
    if (dialog.isTranslationKey && text) {
      return t(text);
    }
    return text;
  };

  return (
    <DialogRoot
      open={dialog.isOpen}
      onOpenChange={(isOpen) => dialogSet({ ...dialog, isOpen })}
      className={`${dialog.className}`}
    >
      <Content
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
          className={`oa max-w-full`}
          // TODO !!! ??? can brake user attachments dialog
          // style={{ overflow: "hidden" }}
        >
          {(dialog.title || dialog.text) && (
            <Header>
              {dialog.title && (
                <Title
                  className={`mb5 line-clamp-2 tac text-foreground ${dialog.titleClassName}`}
                >
                  {capitalize(processText(dialog.title))}
                </Title>
              )}
              {dialog.text && (
                <Description
                  className={`line-clamp-10 t_1 tac text-muted-foreground`}
                >
                  {capitalize(removeHtmlFromText(processText(dialog.text)))}
                </Description>
              )}
            </Header>
          )}

          {dialog?.comp}
        </div>

        {dialog?.showBtns !== false && (
          <Footer
            className={`fcc g5 px-4 w-full max-w-full flex-wrap !justify-center !flex-row ${dialog.footerClassName}`}
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
          </Footer>
        )}
      </Content>
    </DialogRoot>
  );
}
