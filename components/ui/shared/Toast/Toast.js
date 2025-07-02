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
  const [lastToastContent, setLastToastContent] = useState("");

  useEffect(() => {
    // Create unique identifier for current toast content
    const currentContent = `${toast.title}-${toast.text}-${toast.variant}-${toast.isOpen}`;

    // If content changed and toast is open, force re-render
    if (toast.isOpen && currentContent !== lastToastContent) {
      setToastKey((prev) => prev + 1 + new Date().getTime());
      setLastToastContent(currentContent);
    }

    // If toast is closed, reset last content
    if (!toast.isOpen) {
      setLastToastContent("");
    }
  }, [toast.title, toast.text, toast.isOpen, toast.variant, lastToastContent]);

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
    <Toaster.Provider duration={toast.duration || 10000} swipeDirection="right">
      <Toaster.Root
        key={toastKey}
        style={{ "--toast-duration": `${(toast.duration || 10000) / 1000}s` }}
        className="ToastRoot wfc maw300 fixed t64 r10 min-[1919px]:r160 cursor-pointer bg-accent/90 hover:bg-accent"
        open={toast.isOpen}
        onOpenChange={(isOpen) => toastSet({ ...toast, isOpen })}
        onClick={toast.onClick}
      >
        <div className="f fwn aic">
          {toast?.comp}

          {/* Show custom content if provided, otherwise show default title/text */}
          {toast.customContent ? (
            <div className="fc wf">
              <Toaster.Title className="ToastTitle">
                {translateIfKey(toast.title)}
              </Toaster.Title>
              <div className="mt5">{toast.customContent}</div>
            </div>
          ) : (
            <div className="fc">
              <Toaster.Title className="ToastTitle">
                {translateIfKey(toast.title)}
              </Toaster.Title>
              <div className="fz14">{translateIfKey(toast.text)}</div>
            </div>
          )}
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
