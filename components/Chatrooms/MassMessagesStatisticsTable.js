"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { format } from "date-fns";
import { FileText, DollarSign, Eye, ShoppingCart, Send, X } from "lucide-react";
import Button from "@/components/ui/shared/Button/Button2";
import { useState } from "react";
import { unsendMassMessage } from "@/lib/actions/unsendMassMessage";
import { useContext } from "@/components/Context/Context";
import removeHtmlFromText from "@/lib/utils/removeHtmlFromText";
import Carousel from "@/components/ui/shared/Carousel/Carousel";

// * Table component showing mass messages statistics similar to the attached image
export default function MassMessagesStatisticsTable({
  massMessages,
  onUpdate,
}) {
  const { t } = useTranslation();
  const { toastSet, dialogSet } = useContext();
  const [unsendingIds, setUnsendingIds] = useState(new Set());

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "";
    try {
      return format(new Date(dateTime), "MMM dd, yyyy h:mm a");
    } catch (error) {
      return "";
    }
  };

  const showUnsendConfirmDialog = (massMessage) => {
    dialogSet({
      showCancelBtn: true,
      cancelBtnText: t("cancel"),
      confirmBtnText: t("massMessageUnsend"),
      isOpen: true,
      hasCloseIcon: false,
      isDanger: true,
      title: t("massMessageConfirmUnsend"),
      text: t("massMessageUnsendConfirmation", {
        count: massMessage.sent,
        messages:
          massMessage.sent !== 1 ? t("messagesPlural") : t("messageSingular"),
      }),
      action: () => handleUnsend(massMessage),
      onCancel: () => {},
    });
  };

  const handleUnsend = async (massMessage) => {
    if (unsendingIds.has(massMessage.id)) return; // Prevent double clicks

    try {
      setUnsendingIds((prev) => new Set(prev).add(massMessage.id));

      // Get all message IDs from this mass message group
      const messageIds = massMessage.messages.map((msg) => msg._id);

      const result = await unsendMassMessage({ messageIds });

      if (result.success) {
        // Create detailed feedback message
        let message = t("massMessageDeletedSuccess", {
          count: result.deletedCount,
          messages:
            result.deletedCount !== 1
              ? t("messagesPlural")
              : t("messageSingular"),
        });

        if (result.skippedPurchasedCount > 0) {
          message += `. ${t("massMessageSkippedPurchased", {
            count: result.skippedPurchasedCount,
            messages:
              result.skippedPurchasedCount !== 1
                ? t("messagesPlural")
                : t("messageSingular"),
          })}`;
        }

        toastSet({
          isOpen: true,
          title:
            result.skippedPurchasedCount > 0
              ? t("massMessagePartiallyDeleted")
              : t("massMessageDeleted"),
          text: message,
        });

        // Refresh the data
        if (onUpdate) {
          onUpdate();
        }
      } else {
        throw new Error(result.error || t("massMessageDeleteFailed"));
      }
    } catch (error) {
      console.error("❌ Error unsending mass message:", error);

      // If the result had partial success but errors, show a more detailed message
      if (result && result.success && result.errors) {
        const errorMessages = Array.isArray(result.errors)
          ? result.errors
          : [result.errors];
        toastSet({
          isOpen: true,
          title: t("massMessagePartiallyCompleted"),
          text: t("massMessagePartialError", {
            count: result.deletedCount,
            errors: errorMessages.join("; "),
          }),
        });
      } else {
        toastSet({
          isOpen: true,
          title: t("error"),
          text: error.message || t("massMessageDeleteFailed"),
        });
      }
    } finally {
      setUnsendingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(massMessage.id);
        return newSet;
      });
    }
  };

  return (
    <div className="bg-background border border-border shadow-md overflow-hidden">
      {/* Table Header */}
      <div className="hidden min-[1000px]:block scrollbar-hide bg-muted/30 border-b border-border overflow-x-auto">
        <div className="grid grid-cols-9 gap-3 py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider min-w-[1000px]">
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableNumber")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableDateTime")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableText")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableFiles")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTablePrice")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableSent")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableViewed")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTablePurchased")}
          </div>
          <div className="text-center flex items-center justify-center">
            {t("massMessageTableUnsend")}
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="scrollbar-hide divide-y divide-border overflow-x-auto">
        {massMessages.map((massMessage, index) => (
          <div
            key={massMessage.id}
            className="grid grid-cols-9 gap-3 p-4 hover:bg-accent/50 transition-colors min-w-[1000px]"
          >
            {/* Row Number */}
            <div className="flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">
                #{index + 1}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center justify-center text-sm">
              <div className="text-center">
                {formatDateTime(massMessage.dateTime)}
              </div>
            </div>

            {/* Text */}
            <div className="flex items-center justify-center text-sm">
              <div
                className="line-clamp-2 text-center max-w-[120px]"
                title={removeHtmlFromText(massMessage.text)}
              >
                {removeHtmlFromText(massMessage.text) || "..."}
              </div>
            </div>

            {/* Attachment */}
            <div className="flex items-center justify-center">
              {massMessage.files && massMessage.files.length > 0 ? (
                <div className="flex items-center justify-center">
                  <Carousel
                    files={massMessage.files}
                    className="w-[60px] h-[60px]"
                    imageClassName="object-cover rounded-md"
                    aspectRatio="aspect-square"
                    imageSize={{ width: 60, height: 60 }}
                    showThumbnails={false}
                    showIndicators={false}
                    showArrows={false}
                    infinite={true}
                  />
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-center">
              {massMessage.price ? (
                <div className="flex items-center justify-center gap-1">
                  <DollarSign size={16} />
                  <span className="text-sm">
                    {massMessage.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Sent */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center gap-1">
                <Send size={16} />
                <span className="text-sm font-medium">{massMessage.sent}</span>
              </div>
            </div>

            {/* Viewed */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center gap-1">
                <Eye size={16} />
                <span className="text-sm">{massMessage.viewed}</span>
              </div>
            </div>

            {/* Purchased */}
            <div className="flex items-center justify-center">
              {massMessage.price ? (
                <div className="flex items-center justify-center gap-1">
                  <ShoppingCart size={16} />
                  <span className="text-sm">{massMessage.purchased}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>

            {/* Unsend */}
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => showUnsendConfirmDialog(massMessage)}
                disabled={unsendingIds.has(massMessage.id)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                {unsendingIds.has(massMessage.id)
                  ? "..."
                  : t("massMessageUnsend")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty Footer */}
      {massMessages.length > 0 && (
        <div className="bg-muted/20 border-t border-border p-4"></div>
      )}
    </div>
  );
}
