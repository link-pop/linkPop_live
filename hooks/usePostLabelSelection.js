"use client";

import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { Tag, Plus, Minus } from "lucide-react";
import { useContext as useCustomContext } from "@/components/Context/Context";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { getUserPostLabelLists } from "@/lib/actions/getUserPostLabelLists";
import { addPostLabelsToPostLabelList } from "@/lib/actions/addPostLabelsToPostLabelList";
import { removePostLabelsFromPostLabelList } from "@/lib/actions/removePostLabelsFromPostLabelList";
import { useTranslation } from "@/components/Context/TranslationContext";

import Button2 from "@/components/ui/shared/Button/Button2";
import { useRouter } from "next/navigation";
import { COLLECTIONS_POST_LABELS_HUB } from "@/lib/utils/constants";

export default function usePostLabelSelection({ selectedPostLabels = [] }) {
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [postLabelLists, setPostLabelLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const { dialogSet, toastSet } = useCustomContext();
  const collectionsContext = useContext(CollectionsContext);
  const contextRefreshPostLabelLists =
    collectionsContext?.refreshPostLabelLists;
  const { t } = useTranslation();
  const dialogJustOpened = useRef(false);
  const router = useRouter();

  // Check if selected post labels are in a specific list
  const checkPostLabelsInList = useCallback(
    (list) => {
      const selectedIds = selectedPostLabels.map((pl) => pl._id.toString());
      const listPostLabelIds = (list.postLabelIds || []).map((postLabel) => {
        // Handle both populated objects and raw ObjectIds
        if (postLabel && typeof postLabel === "object" && postLabel._id) {
          return postLabel._id.toString();
        }
        return postLabel.toString();
      });

      const postLabelsInList = selectedIds.filter((id) =>
        listPostLabelIds.includes(id)
      );
      const postLabelsNotInList = selectedIds.filter(
        (id) => !listPostLabelIds.includes(id)
      );

      return {
        inList: postLabelsInList.length,
        notInList: postLabelsNotInList.length,
        allInList: postLabelsInList.length === selectedIds.length,
        someInList: postLabelsInList.length > 0,
      };
    },
    [selectedPostLabels]
  );

  // Load post label lists
  const loadPostLabelLists = useCallback(async () => {
    console.log("🔍 loadPostLabelLists called");
    setIsLoadingLists(true);
    try {
      console.log("🔍 Calling getUserPostLabelLists...");
      const lists = await getUserPostLabelLists();
      console.log("🔍 getUserPostLabelLists returned:", lists);
      // Force a new array reference to trigger React re-render
      setPostLabelLists([...lists]);
    } catch (error) {
      console.error("❌ Error loading post label lists:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: t("failedToLoadLists"),
      });
    }
    setIsLoadingLists(false);
  }, [t, toastSet]);

  // Toggle post labels in a specific list
  const togglePostLabelsInList = useCallback(
    async (listId) => {
      if (selectedPostLabels.length === 0) return;

      setIsAddingToList(true);
      try {
        const postLabelIds = selectedPostLabels.map((pl) => pl._id);
        const listStatus = checkPostLabelsInList(
          postLabelLists.find((list) => list._id === listId)
        );

        let result;
        if (listStatus.allInList) {
          // Remove post labels from list
          result = await removePostLabelsFromPostLabelList(
            listId,
            postLabelIds
          );
        } else {
          // Add post labels to list
          result = await addPostLabelsToPostLabelList(listId, postLabelIds);
        }

        if (result.error) {
          toastSet({
            isOpen: true,
            title: t("error"),
            text: result.error,
          });
        } else {
          // First refresh the local post label lists immediately
          console.log("🔄 Refreshing post label lists after toggle...");
          await loadPostLabelLists();

          // Then trigger refresh in parent components
          if (
            contextRefreshPostLabelLists &&
            typeof contextRefreshPostLabelLists === "function"
          ) {
            try {
              await contextRefreshPostLabelLists();
              console.log("✅ Context post label lists refreshed");
            } catch (error) {
              console.error(
                "❌ Error refreshing context post label lists:",
                error
              );
            }
          }

          // Force dialog to re-render by updating a key state
          if (keepDialogOpen) {
            // Close and immediately reopen to force refresh
            setIsListDialogOpen(false);
            setTimeout(() => {
              setIsListDialogOpen(true);
            }, 10);
          }

          // Show success message
          const action = listStatus.allInList ? "removed" : "added";
          const successMessage = listStatus.allInList
            ? t("postLabelsRemovedFromList", {
                count: selectedPostLabels.length,
              })
            : t("postLabelsAddedToList", { count: selectedPostLabels.length });

          toastSet({
            isOpen: true,
            title: t("success"),
            text: successMessage,
          });
        }
      } catch (error) {
        console.error("❌ Error toggling post labels in list:", error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: t("failedToAddToList"),
        });
      }
      setIsAddingToList(false);
    },
    [
      selectedPostLabels,
      t,
      toastSet,
      postLabelLists,
      checkPostLabelsInList,
      contextRefreshPostLabelLists,
      keepDialogOpen,
      loadPostLabelLists,
    ]
  );

  // Show the list selection dialog
  const showListSelectionDialog = useCallback(async () => {
    console.log(
      "🔍 showListSelectionDialog called with:",
      selectedPostLabels.length,
      "post labels"
    );
    if (selectedPostLabels.length === 0) {
      toastSet({
        isOpen: true,
        title: t("selectPostLabels"),
        text: t("pleaseSelectPostLabelsFirst"),
      });
      return;
    }

    console.log("🔍 About to load post label lists...");
    // Load post label lists before opening dialog
    await loadPostLabelLists();
    console.log("🔍 Post label lists loaded, opening dialog...");
    setIsListDialogOpen(true);
    setKeepDialogOpen(true);
  }, [selectedPostLabels.length, t, toastSet, loadPostLabelLists]);

  // Close the list selection dialog
  const closeListSelectionDialog = useCallback(() => {
    setIsListDialogOpen(false);
    setKeepDialogOpen(false);
  }, []);

  useEffect(() => {
    if (isListDialogOpen && !dialogJustOpened.current) {
      dialogJustOpened.current = true;
      dialogSet({
        isOpen: true,
        title: t("manageUserLists"),
        showBtns: false,
        hasCloseIcon: true,
        contentClassName: "max-h-[50dvh] fc",
        onClose: closeListSelectionDialog,
        comp: (
          <div className="PostLabelSelectionDialog fcc gap10 p10">
            <div className="text-sm text-center mb15">
              {t("selectListToAddPostLabels", {
                count: selectedPostLabels.length,
              })}
            </div>

            {isLoadingLists ? null : postLabelLists.length === 0 ? (
              <div className="fcc p20 text-center">
                <Button2
                  onClick={() => {
                    router.push(COLLECTIONS_POST_LABELS_HUB);
                    setTimeout(() => {
                      document.querySelector(".CreateNewListIcon").click();
                    }, 1000);
                  }}
                  className="text-sm text-foreground/70"
                >
                  {t("createListFirst")}
                </Button2>
              </div>
            ) : (
              <div className="fc gap10 w-full">
                {postLabelLists.map((list) => {
                  const listStatus = checkPostLabelsInList(list);
                  const isProcessing = isAddingToList;

                  return (
                    <div
                      key={list._id}
                      onClick={() =>
                        !isProcessing && togglePostLabelsInList(list._id)
                      }
                      className="cursor-pointer hover:bg-accent p15 rounded border transition-colors fc gap5"
                    >
                      <div className="f aic gap10">
                        {/* Show icon based on post label status */}
                        <div className="fcc gap5">
                          {listStatus.allInList ? (
                            <div className="fcc w20 h20 rounded-full flex-shrink-0 bg-red-500 text-white">
                              <Minus size={12} />
                            </div>
                          ) : (
                            <div className="fcc w20 h20 rounded-full flex-shrink-0 bg-green-500 text-white">
                              <Plus size={12} />
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

                        {/* Show post label count */}
                        <div className="text-xs text-foreground/50">
                          {t("postLabelCount", {
                            count: list.postLabelCount || 0,
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
    if (!isListDialogOpen) {
      dialogJustOpened.current = false;
    }
  }, [
    isListDialogOpen,
    isLoadingLists,
    postLabelLists,
    selectedPostLabels.length,
    isAddingToList,
    togglePostLabelsInList,
    checkPostLabelsInList,
    dialogSet,
    closeListSelectionDialog,
    t,
    router,
  ]);

  return {
    showListSelectionDialog,
    closeListSelectionDialog,
    togglePostLabelsInList,
    isListDialogOpen,
    loadPostLabelLists,
  };
}
