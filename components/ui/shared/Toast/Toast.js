"use client";

import { useContext } from "@/components/Context/Context";
import { Toaster } from "@/components/ui/toast";
import { CircleCheckBig } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function Toast() {
  const { toast, toastSet } = useContext();
  const { t } = useTranslation();
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    // Update key when toast content changes
    if (toast.isOpen) {
      setToastKey((prev) => prev + 1 + new Date().getTime());
    }
  }, [toast.title, toast.text, toast.isOpen]);

  const toastIcon = !toast.icon ? (
    <CircleCheckBig className="mr5" />
  ) : (
    toast.icon
  );

  // Helper function to translate content if it looks like a translation key
  const translateIfKey = (content) => {
    if (
      typeof content === "string" &&
      /^[A-Z0-9_]+$/.test(content) &&
      t(content) !== content
    ) {
      return t(content);
    }
    return content;
  };

  return (
    <Toaster.Provider duration={5000} swipeDirection="right">
      <Toaster.Root
        key={toastKey}
        style={{ "--toast-duration": "5s" }}
        className="ToastRoot wfc maw300 fixed t64 r10 min-[1919px]:r160 cursor-pointer bg-accent/90 hover:bg-accent"
        open={toast.isOpen}
        onOpenChange={(isOpen) => toastSet({ ...toast, isOpen })}
        onClick={toast.onClick}
      >
        <div className="f fwn aic">
          {toast?.comp}

          {toast.showIcon && toastIcon}

          <div className="fc">
            <Toaster.Title className="ToastTitle">
              {translateIfKey(toast.title)}
            </Toaster.Title>
            <div className="fz14">{translateIfKey(toast.text)}</div>
          </div>
        </div>

        {toast.action && (
          <Toaster.Action
            className="ToastAction"
            asChild
            altText="Toast action"
          >
            <button onClick={toast.action}>Undo</button>
          </Toaster.Action>
        )}
      </Toaster.Root>
      <Toaster.Viewport className="👋 ToastViewport" />
    </Toaster.Provider>
  );
}
