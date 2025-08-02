"use client";

import { useState, useCallback, useEffect, useContext } from "react";
import { FolderInput, Minus, Plus } from "lucide-react";
import { useContext as useCustomContext } from "@/components/Context/Context";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { getUserUserLists } from "@/lib/actions/getUserUserLists";
import { addUsersToUserList } from "@/lib/actions/addUsersToUserList";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function useSingleUserListManagement({ user }) {
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const [hasOpenedDialog, setHasOpenedDialog] = useState(false);
  const { dialogSet, toastSet } = useCustomContext();
  const collectionsContext = useContext(CollectionsContext);
  const contextRefreshUserLists = collectionsContext?.refreshUserLists;
  const { t } = useTranslation();

  // Check if user is in a specific list
  const checkUserInList = useCallback(
    (list) => {
      if (!user?._id) return false;

      const userId = user._id.toString();
      const listUserIds = (list.userIds || []).map((user) =>
        user._id ? user._id.toString() : user.toString()
      );

      return listUserIds.includes(userId);
    },
    [user]
  );

  // Load user lists
  const loadUserLists = useCallback(async () => {
    setIsLoadingLists(true);
    try {
      const lists = await getUserUserLists();
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

  // Toggle user in a specific list
  const toggleUserInList = useCallback(
    async (listId, event) => {
      if (!user?._id) return;

      // ! don't change this vanilla js!, it's working
      // Immediately update the icon using vanilla JS
      const listItem = event?.currentTarget;
      if (listItem) {
        const iconContainer = listItem.querySelector(
          ".pb5.fcc.w20.h20.rounded-full"
        );
        const iconElement = iconContainer?.querySelector("svg");

        if (iconContainer && iconElement) {
          // Check how many path elements exist to determine current icon
          const pathElements = iconElement.querySelectorAll("path");
          const isCurrentlyPlus = pathElements.length === 2; // Plus has 2 paths
          const isCurrentlyMinus = pathElements.length === 1; // Minus has 1 path

          if (isCurrentlyPlus) {
            // Change Plus to Minus
            iconContainer.className =
              "pb5 fcc w20 h20 rounded-full flex-shrink-0 white bg-red-500";
            iconElement.innerHTML =
              '<path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

            // Update user count - increment by 1
            const userCountElement = listItem.querySelector(
              ".text-xs.text-foreground\\/50"
            );
            if (userCountElement) {
              const currentCount = parseInt(
                userCountElement.textContent.match(/\d+/)?.[0] || "0"
              );
              const newCount = currentCount + 1;
              userCountElement.textContent = `${newCount} user${
                newCount === 1 ? "" : "s"
              }`;
            }
          } else if (isCurrentlyMinus) {
            // Change Minus to Plus
            iconContainer.className =
              "pb5 fcc w20 h20 rounded-full flex-shrink-0 white bg-green-500";
            iconElement.innerHTML =
              '<path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

            // Update user count - decrement by 1
            const userCountElement = listItem.querySelector(
              ".text-xs.text-foreground\\/50"
            );
            if (userCountElement) {
              const currentCount = parseInt(
                userCountElement.textContent.match(/\d+/)?.[0] || "0"
              );
              const newCount = Math.max(0, currentCount - 1);
              userCountElement.textContent = `${newCount} user${
                newCount === 1 ? "" : "s"
              }`;
            }
          }
        }
      }

      setIsAddingToList(true);
      try {
        const result = await addUsersToUserList(listId, [user._id]);

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

          // Trigger refresh in parent components
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
          if (result.addedCount > 0) {
            successMessage = t("userAddedToList", {
              userName: user.name || user.username || "User",
            });
          } else if (result.removedCount > 0) {
            successMessage = t("userRemovedFromList", {
              userName: user.name || user.username || "User",
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
        console.error("❌ Error toggling user in list:", error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: t("failedToAddToList"),
        });
      }
      setIsAddingToList(false);
    },
    [user, t, toastSet, setUserLists, contextRefreshUserLists, keepDialogOpen]
  );

  // Show the list selection dialog
  const showListSelectionDialog = useCallback(() => {
    if (!user?._id) {
      toastSet({
        isOpen: true,
        title: t("error"),
        text: t("invalidUser"),
      });
      return;
    }
    setIsListDialogOpen(true);
    setKeepDialogOpen(true);
    setHasOpenedDialog(true);
  }, [user, t, toastSet]);

  // Close the list selection dialog
  const closeListSelectionDialog = useCallback(() => {
    setIsListDialogOpen(false);
    setKeepDialogOpen(false);
  }, []);

  useEffect(() => {
    // need to load this here, don't change this!
    loadUserLists();
  }, []);

  // Handle dialog close state
  useEffect(() => {
    // Only close dialog if we've actually opened it before
    if (!isListDialogOpen && !keepDialogOpen && hasOpenedDialog) {
      dialogSet({
        isOpen: false,
      });
    }
  }, [isListDialogOpen, keepDialogOpen, hasOpenedDialog, dialogSet]);

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
          <div className="UserListManagementDialog fcc gap10 p10">
            <div className="text-sm text-center mb15">
              {t("selectListToAddUsers", { count: 1 })}
            </div>

            {isLoadingLists ? null : userLists.length === 0 ? (
              <div className="fcc p20 text-center">
                <div className="text-sm text-foreground/70">
                  {t("createListFirst")}
                </div>
              </div>
            ) : (
              <div className="fc gap10 w-full">
                {userLists.map((list) => {
                  const isUserInList = checkUserInList(list);
                  const isProcessing = isAddingToList;

                  return (
                    <div
                      key={list._id}
                      onClick={(e) =>
                        !isProcessing && toggleUserInList(list._id, e)
                      }
                      className="cursor-pointer hover:bg-accent p15 rounded border transition-colors fc gap5"
                    >
                      <div className="f aic gap10">
                        {/* Show icon based on user status */}
                        <div className="fcc gap5">
                          {isUserInList ? (
                            <div className="pb5 fcc w20 h20 rounded-full flex-shrink-0 white bg-red-500">
                              <Minus size={12} />
                            </div>
                          ) : (
                            <div className="pb5 fcc w20 h20 rounded-full flex-shrink-0 white bg-green-500">
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

                        {/* Show user count */}
                        <div className="text-xs text-foreground/50">
                          {t("userCount", {
                            count: list.userCount || 0,
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
    user,
    isAddingToList,
    toggleUserInList,
    checkUserInList,
    dialogSet,
    closeListSelectionDialog,
    t,
  ]);

  return {
    showListSelectionDialog,
    closeListSelectionDialog,
    isListDialogOpen,
  };
}
