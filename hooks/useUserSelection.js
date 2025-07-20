"use client";

import { useState, useCallback, useEffect, useContext } from "react";
import { FolderInput } from "lucide-react";
import { useContext as useCustomContext } from "@/components/Context/Context";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { getUserUserLists } from "@/lib/actions/getUserUserLists";
import { addUsersToUserList } from "@/lib/actions/addUsersToUserList";
import { useTranslation } from "@/components/Context/TranslationContext";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

import { CheckSquare, Square, X } from "lucide-react";

export default function useUserSelection({ allUsers = [] }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const { dialogSet, toastSet } = useCustomContext();
  const collectionsContext = useContext(CollectionsContext);
  const contextRefreshUserLists = collectionsContext?.refreshUserLists;
  const { t } = useTranslation();

  const selectAllUsers = useCallback(() => {
    setSelectedUsers(allUsers);
  }, [allUsers]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedUsers([]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedUsers.length === allUsers.length) {
      clearSelection();
    } else {
      selectAllUsers();
    }
  }, [selectedUsers.length, allUsers.length, clearSelection, selectAllUsers]);

  // Toggle user selection
  const toggleUserSelection = useCallback((user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u._id === user._id);
      if (isSelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  }, []);

  // Check if user is selected
  const isUserSelected = useCallback(
    (userId) => {
      return selectedUsers.some((u) => u._id === userId);
    },
    [selectedUsers]
  );

  // Check if selected users are in a specific list
  const checkUsersInList = useCallback(
    (list) => {
      const selectedIds = selectedUsers.map((u) => u._id.toString());
      const listUserIds = (list.userIds || []).map((user) =>
        user._id ? user._id.toString() : user.toString()
      );

      const usersInList = selectedIds.filter((id) => listUserIds.includes(id));
      const usersNotInList = selectedIds.filter(
        (id) => !listUserIds.includes(id)
      );

      return {
        inList: usersInList.length,
        notInList: usersNotInList.length,
        allInList: usersInList.length === selectedIds.length,
        someInList: usersInList.length > 0,
      };
    },
    [selectedUsers]
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

  // Toggle users in a specific list
  const toggleUsersInList = useCallback(
    async (listId) => {
      if (selectedUsers.length === 0) return;

      setIsAddingToList(true);
      try {
        const userIds = selectedUsers.map((u) => u._id);
        const result = await addUsersToUserList(listId, userIds);

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
          if (result.addedCount > 0 && result.removedCount > 0) {
            successMessage = t("usersAddedAndRemovedFromList", {
              addedCount: result.addedCount,
              removedCount: result.removedCount,
            });
          } else if (result.addedCount > 0) {
            successMessage = t("usersAddedToList", {
              count: result.addedCount,
            });
          } else if (result.removedCount > 0) {
            successMessage = t("usersRemovedFromList", {
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
        console.error("❌ Error toggling users in list:", error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: t("failedToAddToList"),
        });
      }
      setIsAddingToList(false);
    },
    [
      selectedUsers,
      t,
      toastSet,
      setUserLists,
      contextRefreshUserLists,
      keepDialogOpen,
    ]
  );

  // Show the list selection dialog
  const showListSelectionDialog = useCallback(() => {
    if (selectedUsers.length === 0) {
      toastSet({
        isOpen: true,
        title: t("selectUsers"),
        text: t("pleaseSelectUsersFirst"),
      });
      return;
    }
    setIsListDialogOpen(true);
    setKeepDialogOpen(true);
  }, [selectedUsers.length, t, toastSet]);

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
          <div className="UserSelectionDialog fcc gap10 p10">
            <div className="text-sm text-center mb15">
              {t("selectListToAddUsers", { count: selectedUsers.length })}
            </div>

            {isLoadingLists ? null : userLists.length === 0 ? (
              <div className="fcc p20 text-center">
                <div className="mb10">{t("noListsAvailable")}</div>
                <div className="text-sm text-foreground/70">
                  {t("createListFirst")}
                </div>
              </div>
            ) : (
              <div className="fc gap10 w-full">
                {userLists.map((list) => {
                  const listStatus = checkUsersInList(list);
                  const isProcessing = isAddingToList;

                  return (
                    <div
                      key={list._id}
                      onClick={() =>
                        !isProcessing && toggleUsersInList(list._id)
                      }
                      className="cursor-pointer hover:bg-accent p15 rounded border transition-colors fc gap5"
                    >
                      <div className="f aic gap10">
                        {/* Show icon based on user status */}
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
    selectedUsers.length,
    isAddingToList,
    toggleUsersInList,
    checkUsersInList,
    dialogSet,
    closeListSelectionDialog,
    t,
  ]);

  // Selection controls component
  const SelectionControls = useCallback(() => {
    if (selectedUsers.length === 0) return null;

    const allSelected = selectedUsers.length === allUsers.length;

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
            {selectedUsers.length} {t("selected").toLowerCase()}
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
    selectedUsers,
    allUsers.length,
    t,
    clearSelection,
    showListSelectionDialog,
    toggleSelectAll,
  ]);

  return {
    selectedUsers,
    toggleUserSelection,
    clearSelection,
    isUserSelected,
    showListSelectionDialog,
    closeListSelectionDialog,
    SelectionControls,
    toggleUsersInList,
    isListDialogOpen,
    selectAllUsers,
    toggleSelectAll,
  };
}
