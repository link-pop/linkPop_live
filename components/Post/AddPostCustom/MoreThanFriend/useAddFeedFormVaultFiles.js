"use client";

import { FolderOpen, Images } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getAll } from "@/lib/actions/crud";
import { useContext } from "@/components/Context/Context";
import Button2 from "@/components/ui/shared/Button/Button2";
import IconButton from "@/components/ui/shared/IconButton/IconButton";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function useAddFeedFormVaultFiles({
  filesSet,
  files,
  mongoUser,
}) {
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { dialogSet } = useContext();
  const { t } = useTranslation();

  async function loadAttachments() {
    if (!mongoUser?._id) return;

    setIsLoading(true);
    try {
      const res = await getAll({
        col: { name: "attachments" },
        data: { createdBy: mongoUser?._id },
      });
      if (!res.error) {
        setAttachments(res);
      }
    } catch (error) {
      console.error("Error loading attachments:", error);
    }
    setIsLoading(false);
  }

  // Load attachments when component mounts
  useEffect(() => {
    loadAttachments();
  }, [mongoUser?._id]);

  function handleAttachmentSelect(attachment) {
    setSelectedAttachments((prev) => {
      const isSelected = prev.some((a) => a._id === attachment._id);
      if (isSelected) {
        return prev.filter((a) => a._id !== attachment._id);
      } else {
        return [...prev, attachment];
      }
    });
  }

  function handleAddSelectedFiles() {
    selectedAttachments.forEach((attachment) => {
      filesSet((prev) => [
        ...prev,
        {
          _id: attachment._id,
          fileUrl: attachment.fileUrl,
          fileType: attachment.fileType,
          fileBytes: attachment.fileBytes,
        },
      ]);
    });
    setSelectedAttachments([]);
    setIsDialogOpen(false);
    dialogSet({ isOpen: false });
  }

  // Update dialog content whenever relevant state changes
  useEffect(() => {
    if (!isDialogOpen) return;

    // Get current files state
    let currentFiles = files;

    // Filter out attachments that are already in files
    const availableAttachments = attachments.filter(
      (attachment) => !currentFiles.some((file) => file._id === attachment._id)
    );

    dialogSet({
      contentClassName: "max-h-[90dvh] fc",
      isOpen: true,
      title: t("selectAttachments"),
      showBtns: false,
      hasCloseIcon: true,
      comp: (
        <div className={`fcc gap10 p10`}>
          {isLoading ? (
            <div>{t("loading")}</div>
          ) : availableAttachments.length === 0 ? (
            <div>{t("noAttachmentsAvailable")}</div>
          ) : (
            <>
              <div className={`grid grid-cols-3 gap-4`}>
                {availableAttachments.map((attachment) => {
                  const isSelected = selectedAttachments.some(
                    (a) => a._id === attachment._id
                  );
                  return (
                    <div
                      key={attachment._id}
                      onClick={() => handleAttachmentSelect(attachment)}
                      className={`cursor-pointer hover:opacity-70 transition-opacity relative`}
                    >
                      {isSelected && (
                        <div
                          className={`absolute inset-0 bg-black/50 z-10 flex items-center justify-center text-white`}
                        >
                          ✓
                        </div>
                      )}
                      {attachment.fileType === "image" ? (
                        <img
                          src={attachment.fileUrl}
                          alt={t("attachment")}
                          className={`w-full h-32 object-cover rounded`}
                        />
                      ) : (
                        <video
                          src={attachment.fileUrl}
                          className={`w-full h-32 object-cover rounded`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedAttachments.length > 0 && (
                <div className={`poa z10 cx b15 wfc g2`}>
                  <div
                    className={`fcc g10 fwn wfc gap2 bg-black/90 text-white py-1.5 px-3 rounded-full text-sm`}
                  >
                    {/* DELETE BUTTON */}
                    <div
                      onClick={() => setSelectedAttachments([])}
                      className={`fcc bg-[var(--color-brand)] br50 w20 h20 cursor-pointer hover:opacity-70`}
                    >
                      <span className={`${BRAND_INVERT_CLASS}`}>✕</span>
                    </div>
                    <div className="wsn">
                      {selectedAttachments.length} /{" "}
                      {availableAttachments.length} {t("selected")}
                    </div>

                    {/* ADD BUTTON */}
                    <Button2
                      onClick={handleAddSelectedFiles}
                      text={t("add")}
                      className="h30"
                    ></Button2>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    });
  }, [attachments, selectedAttachments, isLoading, isDialogOpen]);

  function showAttachmentsDialog() {
    setSelectedAttachments([]);
    setIsDialogOpen(true);
  }

  // Handle dialog close
  useEffect(() => {
    if (!isDialogOpen) {
      dialogSet({ isOpen: false });
    }
  }, [isDialogOpen]);

  function VaultFilesButton() {
    return (
      <IconButton
        icon={Images}
        onClick={showAttachmentsDialog}
        title={t("addVaultFiles")}
      />
    );
  }

  return { VaultFilesButton };
}
