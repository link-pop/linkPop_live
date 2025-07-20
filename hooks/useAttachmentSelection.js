"use client";

import { useState, useCallback, useEffect, useContext } from "react";
import { FolderInput } from "lucide-react";
import { useContext as useCustomContext } from "@/components/Context/Context";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";
import { getUserLists } from "@/lib/actions/getUserLists";
import { addAttachmentsToUserList } from "@/lib/actions/addAttachmentsToUserList";
import { useTranslation } from "@/components/Context/TranslationContext";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

import { CheckSquare, Square, X } from "lucide-react";
import Button2 from "@/components/ui/shared/Button/Button2";

export default function useAttachmentSelection({ allAttachments = [] }) {
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const { dialogSet, toastSet } = useCustomContext();
  const { refreshUserLists: contextRefreshUserLists } =
    useContext(ContentDepotContext);
  const { t } = useTranslation();

  const selectAllAttachments = useCallback(() => {
    setSelectedAttachments(allAttachments);
  }, [allAttachments]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedAttachments([]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedAttachments.length === allAttachments.length) {
      clearSelection();
    } else {
      selectAllAttachments();
    }
  }, [
    selectedAttachments.length,
    allAttachments.length,
    clearSelection,
    selectAllAttachments,
  ]);

  // Toggle attachment selection
  const toggleAttachmentSelection = useCallback((attachment) => {
    setSelectedAttachments((prev) => {
      const isSelected = prev.some((a) => a._id === attachment._id);
      if (isSelected) {
        return prev.filter((a) => a._id !== attachment._id);
      } else {
        return [...prev, attachment];
      }
    });
  }, []);

  // Check if attachment is selected
  const isAttachmentSelected = useCallback(
    (attachmentId) => {
      return selectedAttachments.some((a) => a._id === attachmentId);
    },
    [selectedAttachments]
  );

  // Check if selected attachments are in a specific list
  const checkAttachmentsInList = useCallback(
    (list) => {
      const selectedIds = selectedAttachments.map((a) => a._id.toString());
      const listAttachmentIds = (list.attachmentIds || []).map((post) =>
        post._id.toString()
      );

      const attachmentsInList = selectedIds.filter((id) =>
        listAttachmentIds.includes(id)
      );
      const attachmentsNotInList = selectedIds.filter(
        (id) => !listAttachmentIds.includes(id)
      );

      return {
        inList: attachmentsInList.length,
        notInList: attachmentsNotInList.length,
        allInList: attachmentsInList.length === selectedIds.length,
        someInList: attachmentsInList.length > 0,
      };
    },
    [selectedAttachments]
  );

  // Load user lists
  const loadUserLists = useCallback(async () => {
    setIsLoadingLists(true);
    try {
      const lists = await getUserLists();
      setUserLists(lists);
    } catch (error) {
      console.error("❌ Error loading user lists:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: t("failedToLoadLists"),
      });
    }
    setIsLoadingLists(false);
  }, [t, toastSet]);

  // Toggle attachments in a specific list
  const toggleAttachmentsInList = useCallback(
    async (listId) => {
      if (selectedAttachments.length === 0) return;

      setIsAddingToList(true);
      try {
        const attachmentIds = selectedAttachments.map((a) => a._id);
        const result = await addAttachmentsToUserList(listId, attachmentIds);

        if (result.error) {
          toastSet({
            isOpen: true,
            title: t("error"),
            text: result.error,
          });
        } else {
          // Update the specific list in the userLists state with new data
          if (result.list) {
            setUserLists((prevLists) =>
              prevLists.map((list) =>
                list._id === listId ? result.list : list
              )
            );
          }

          // Trigger refresh in parent components (ContentDepotListContent and ContentDepotListNavigation)
          // We delay this to prevent dialog from closing and ensure dialog stays open
          setTimeout(async () => {
            if (
              contextRefreshUserLists &&
              typeof contextRefreshUserLists === "function"
            ) {
              await contextRefreshUserLists();
            }
            // Keep the dialog open after refresh
            if (keepDialogOpen) {
              setIsListDialogOpen(true);
            }
          }, 100);

          // Create appropriate success message based on action
          let successMessage = "";
          if (result.addedCount > 0 && result.removedCount > 0) {
            successMessage = t("attachmentsAddedAndRemovedFromList", {
              addedCount: result.addedCount,
              removedCount: result.removedCount,
            });
          } else if (result.addedCount > 0) {
            successMessage = t("attachmentsAddedToList", {
              count: result.addedCount,
            });
          } else if (result.removedCount > 0) {
            successMessage = t("attachmentsRemovedFromList", {
              count: result.removedCount,
            });
          }

          if (successMessage) {
            toastSet({
              isOpen: true,
              title: t("success"),
              text: successMessage,
            });
          }
        }
      } catch (error) {
        console.error("❌ Error toggling attachments in list:", error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: t("failedToAddToList"),
        });
      }
      setIsAddingToList(false);
    },
    [
      selectedAttachments,
      t,
      toastSet,
      setUserLists,
      contextRefreshUserLists,
      keepDialogOpen,
    ]
  );

  // Show the list selection dialog
  const showListSelectionDialog = useCallback(() => {
    if (selectedAttachments.length === 0) {
      toastSet({
        isOpen: true,
        title: t("selectAttachments"),
        text: t("pleaseSelectAttachmentsFirst"),
      });
      return;
    }
    setIsListDialogOpen(true);
    setKeepDialogOpen(true);
  }, [selectedAttachments.length, t, toastSet]);

  // Close the list selection dialog
  const closeListSelectionDialog = useCallback(() => {
    setIsListDialogOpen(false);
    setKeepDialogOpen(false);
  }, []);

  useEffect(() => {
    if (isListDialogOpen) {
      loadUserLists();
    }
  }, [isListDialogOpen, loadUserLists]);

  // Handle dialog close state
  useEffect(() => {
    if (!isListDialogOpen && !keepDialogOpen) {
      dialogSet({
        isOpen: false,
      });
    }
  }, [isListDialogOpen, keepDialogOpen, dialogSet]);

  useEffect(() => {
    if (isListDialogOpen) {
      dialogSet({
        isOpen: true,
        title: t("manageUserLists"),
        showBtns: false,
        hasCloseIcon: true,
        contentClassName: "max-h-[50dvh] fc",
        onClose: closeListSelectionDialog,
        comp: (
          <div className="AttachmentSelectionDialog fcc gap10 p10">
            <div className="text-sm text-center mb15">
              {t("selectListToAdd", { count: selectedAttachments.length })}
            </div>

            {isLoadingLists ? null : userLists.length === 0 ? (
              <div className="fcc p20 text-center">
                <Button2
                  onClick={() =>
                    document.querySelector(".CreateNewListIcon").click()
                  }
                  className="text-sm text-foreground/70"
                >
                  {t("createListFirst")}
                </Button2>
              </div>
            ) : (
              <div className="fc gap10 w-full">
                {userLists.map((list) => {
                  const listStatus = checkAttachmentsInList(list);
                  const isProcessing = isAddingToList;

                  return (
                    <div
                      key={list._id}
                      onClick={() =>
                        !isProcessing && toggleAttachmentsInList(list._id)
                      }
                      className="cursor-pointer hover:bg-accent p15 rounded border transition-colors fc gap5"
                    >
                      <div className="f aic gap10">
                        {/* Show icon based on attachment status */}
                        <div className="fcc gap5">
                          {listStatus.allInList ? (
                            <div className="pb5 fcc w20 h20 rounded-full flex-shrink-0 white bg-red-500">
                              <span className="mb5">-</span>
                            </div>
                          ) : (
                            <div className="pb5 fcc w20 h20 rounded-full flex-shrink-0 white bg-green-500">
                              <span className="mb5">+</span>
                            </div>
                          )}
                        </div>

                        <div className="!wbba fw600 flex-1">{list.name}</div>
                      </div>

                      <div className="f aic gap10 ml30">
                        {list.description && (
                          <div className="text-sm text-foreground/70 flex-1">
                            {list.description}
                          </div>
                        )}

                        {/* Show attachment count */}
                        <div className="text-xs text-foreground/50">
                          {t("attachmentCount", {
                            count: list.attachmentCount || 0,
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ),
      });
    }
  }, [
    isListDialogOpen,
    isLoadingLists,
    userLists,
    selectedAttachments.length,
    isAddingToList,
    toggleAttachmentsInList,
    checkAttachmentsInList,
    dialogSet,
    closeListSelectionDialog,
    t,
  ]);

  // Selection controls component
  const SelectionControls = useCallback(() => {
    if (selectedAttachments.length === 0) return null;

    const allSelected = selectedAttachments.length === allAttachments.length;

    return (
      <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 w-auto">
        <div className="fcc fwn gap-4 bg-background border-2 border-[var(--color-brand)] shadow-lg rounded-full py-2 px-4">
          <IconButton
            icon={allSelected ? CheckSquare : Square}
            onClick={toggleSelectAll}
            title={allSelected ? t("deselectAll") : t("selectAll")}
            className="fcc w-8 h-8"
          />

          <div className="wsn">
            {selectedAttachments.length} {t("selected").toLowerCase()}
          </div>

          {/* ADD TO LIST BUTTON */}
          <IconButton
            icon={FolderInput}
            onClick={showListSelectionDialog}
            title={t("manageUserLists")}
            className="fcc w-8 h-8"
          />

          <div className="w-px h-6 bg-border" />

          {/* CLEAR SELECTION BUTTON */}
          <IconButton
            icon={X}
            onClick={clearSelection}
            title={t("clearSelection")}
            className="fcc w-8 h-8"
          />
        </div>
      </div>
    );
  }, [
    selectedAttachments,
    allAttachments.length,
    t,
    clearSelection,
    showListSelectionDialog,
    toggleSelectAll,
  ]);

  return {
    selectedAttachments,
    toggleAttachmentSelection,
    clearSelection,
    isAttachmentSelected,
    showListSelectionDialog,
    closeListSelectionDialog,
    SelectionControls,
    toggleAttachmentsInList,
    isListDialogOpen,
    selectAllAttachments,
    toggleSelectAll,
  };
}
