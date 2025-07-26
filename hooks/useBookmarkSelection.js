"use client";

import { useState, useCallback, useEffect, useContext, useRef } from "react";
import { FolderInput } from "lucide-react";
import { useContext as useCustomContext } from "@/components/Context/Context";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { getUserBookmarkLists } from "@/lib/actions/getUserBookmarkLists";
import { addBookmarksToBookmarkList } from "@/lib/actions/addBookmarksToBookmarkList";
import { removeBookmarksFromBookmarkList } from "@/lib/actions/removeBookmarksFromBookmarkList";
import { useTranslation } from "@/components/Context/TranslationContext";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

import { CheckSquare, Square, X } from "lucide-react";
import Button2 from "@/components/ui/shared/Button/Button2";
import { useRouter } from "next/navigation";
import { COLLECTIONS_BOOKMARKS_HUB } from "@/lib/utils/constants";

export default function useBookmarkSelection({ selectedBookmarks = [] }) {
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [bookmarkLists, setBookmarkLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [keepDialogOpen, setKeepDialogOpen] = useState(false);
  const { dialogSet, toastSet } = useCustomContext();
  const collectionsContext = useContext(CollectionsContext);
  const contextRefreshBookmarkLists = collectionsContext?.refreshBookmarkLists;
  const { t } = useTranslation();
  const dialogJustOpened = useRef(false);
  const router = useRouter();

  // Check if selected bookmarks are in a specific list
  const checkBookmarksInList = useCallback(
    (list) => {
      const selectedIds = selectedBookmarks.map((b) => b._id.toString());
      const listBookmarkIds = (list.bookmarkIds || []).map((bookmark) =>
        bookmark._id ? bookmark._id.toString() : bookmark.toString()
      );

      const bookmarksInList = selectedIds.filter((id) =>
        listBookmarkIds.includes(id)
      );
      const bookmarksNotInList = selectedIds.filter(
        (id) => !listBookmarkIds.includes(id)
      );

      return {
        inList: bookmarksInList.length,
        notInList: bookmarksNotInList.length,
        allInList: bookmarksInList.length === selectedIds.length,
        someInList: bookmarksInList.length > 0,
      };
    },
    [selectedBookmarks]
  );

  // Load bookmark lists
  const loadBookmarkLists = useCallback(async () => {
    console.log("🔍 loadBookmarkLists called");
    setIsLoadingLists(true);
    try {
      console.log("🔍 Calling getUserBookmarkLists...");
      const lists = await getUserBookmarkLists();
      console.log("🔍 getUserBookmarkLists returned:", lists);
      // Force a new array reference to trigger React re-render
      setBookmarkLists([...lists]);
    } catch (error) {
      console.error("❌ Error loading bookmark lists:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: t("failedToLoadLists"),
      });
    }
    setIsLoadingLists(false);
  }, [t, toastSet]);

  // Toggle bookmarks in a specific list
  const toggleBookmarksInList = useCallback(
    async (listId) => {
      if (selectedBookmarks.length === 0) return;

      setIsAddingToList(true);
      try {
        const bookmarkIds = selectedBookmarks.map((b) => b._id);
        const listStatus = checkBookmarksInList(
          bookmarkLists.find((list) => list._id === listId)
        );

        let result;
        if (listStatus.allInList) {
          // Remove bookmarks from list
          result = await removeBookmarksFromBookmarkList(listId, bookmarkIds);
        } else {
          // Add bookmarks to list
          result = await addBookmarksToBookmarkList(listId, bookmarkIds);
        }

        if (result.error) {
          toastSet({
            isOpen: true,
            title: t("error"),
            text: result.error,
          });
        } else {
          // First refresh the local bookmark lists immediately
          console.log("🔄 Refreshing bookmark lists after toggle...");
          await loadBookmarkLists();

          // Then trigger refresh in parent components
          if (
            contextRefreshBookmarkLists &&
            typeof contextRefreshBookmarkLists === "function"
          ) {
            try {
              await contextRefreshBookmarkLists();
              console.log("✅ Context bookmark lists refreshed");
            } catch (error) {
              console.error(
                "❌ Error refreshing context bookmark lists:",
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
            ? t("bookmarksRemovedFromList", { count: selectedBookmarks.length })
            : t("bookmarksAddedToList", { count: selectedBookmarks.length });

          toastSet({
            isOpen: true,
            title: t("success"),
            text: successMessage,
          });
        }
      } catch (error) {
        console.error("❌ Error toggling bookmarks in list:", error);
        toastSet({
          isOpen: true,
          title: t("error"),
          text: t("failedToAddToList"),
        });
      }
      setIsAddingToList(false);
    },
    [
      selectedBookmarks,
      t,
      toastSet,
      bookmarkLists,
      checkBookmarksInList,
      contextRefreshBookmarkLists,
      keepDialogOpen,
      loadBookmarkLists,
    ]
  );

  // Show the list selection dialog
  const showListSelectionDialog = useCallback(async () => {
    console.log(
      "🔍 showListSelectionDialog called with:",
      selectedBookmarks.length,
      "bookmarks"
    );
    if (selectedBookmarks.length === 0) {
      toastSet({
        isOpen: true,
        title: t("selectBookmarks"),
        text: t("pleaseSelectBookmarksFirst"),
      });
      return;
    }

    console.log("🔍 About to load bookmark lists...");
    // Load bookmark lists before opening dialog
    await loadBookmarkLists();
    console.log("🔍 Bookmark lists loaded, opening dialog...");
    setIsListDialogOpen(true);
    setKeepDialogOpen(true);
  }, [selectedBookmarks.length, t, toastSet, loadBookmarkLists]);

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
          <div className="BookmarkSelectionDialog fcc gap10 p10">
            <div className="text-sm text-center mb15">
              {t("selectListToAddBookmarks", {
                count: selectedBookmarks.length,
              })}
            </div>

            {isLoadingLists ? null : bookmarkLists.length === 0 ? (
              <div className="fcc p20 text-center">
                <Button2
                  onClick={() => {
                    router.push(COLLECTIONS_BOOKMARKS_HUB);
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
                {bookmarkLists.map((list) => {
                  const listStatus = checkBookmarksInList(list);
                  const isProcessing = isAddingToList;

                  return (
                    <div
                      key={list._id}
                      onClick={() =>
                        !isProcessing && toggleBookmarksInList(list._id)
                      }
                      className="cursor-pointer hover:bg-accent p15 rounded border transition-colors fc gap5"
                    >
                      <div className="f aic gap10">
                        {/* Show icon based on bookmark status */}
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

                        {/* Show bookmark count */}
                        <div className="text-xs text-foreground/50">
                          {t("bookmarkCount", {
                            count: list.bookmarkCount || 0,
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
    bookmarkLists,
    selectedBookmarks.length,
    isAddingToList,
    toggleBookmarksInList,
    checkBookmarksInList,
    dialogSet,
    closeListSelectionDialog,
    t,
    router,
  ]);

  return {
    showListSelectionDialog,
    closeListSelectionDialog,
    toggleBookmarksInList,
    isListDialogOpen,
    loadBookmarkLists,
  };
}
