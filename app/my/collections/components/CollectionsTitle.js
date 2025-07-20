"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext as useMainContext } from "@/components/Context/Context";
import { CollectionsContext } from "@/components/Context/CollectionsContext";
import { useContext } from "react";
import { ArrowLeft, Plus, EllipsisVertical } from "lucide-react";
import {
  MAIN_ROUTE,
  COLLECTIONS_BASE_ROUTE,
  COLLECTIONS_USER_LISTS_HUB,
  ICONBUTTON_CLASS,
  COLLECTIONS_USER_LISTS_ROUTE,
} from "@/lib/utils/constants";
import CollectionsSearchIcon from "./CollectionsSearchIcon";
import CollectionsSearchInput from "./CollectionsSearchInput";
import useWindowWidth from "@/hooks/useWindowWidth";
import CreateUserListModal from "./CreateUserListModal";
import RenameUserListModal from "./RenameUserListModal";
import DeleteUserListConfirmationDialog from "./DeleteUserListConfirmationDialog";
import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";
import { deleteUserList } from "@/lib/actions/deleteUserList";

const CollectionsTitle = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();
  const { dialogSet, toastSet } = useMainContext();
  const { collectionsSearchResults, mongoUser, refreshUserLists, currentList } =
    useContext(CollectionsContext);

  // Initialize search mode based on URL search params
  const [isSearchMode, setIsSearchMode] = useState(() => {
    return !!searchParams.get("q") || searchParams.get("search") === "true";
  });

  // Update search mode when URL parameters change
  useEffect(() => {
    const hasSearchQuery = !!searchParams.get("q");
    const shouldTriggerSearch = searchParams.get("search") === "true";
    setIsSearchMode(hasSearchQuery || shouldTriggerSearch);

    // Clean up the search trigger parameter after setting search mode
    if (shouldTriggerSearch) {
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      const newUrl = `${COLLECTIONS_USER_LISTS_HUB}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  // Only show on collections routes
  if (!pathname?.includes(COLLECTIONS_BASE_ROUTE)) return null;

  const width = "maw1000";

  const handleSearchIconClick = () => {
    setIsSearchMode(true);
  };

  const handleCancelSearch = () => {
    setIsSearchMode(false);
    // Clear the search query from URL
    const params = new URLSearchParams(searchParams);
    params.delete("q");

    const newUrl = `${COLLECTIONS_USER_LISTS_HUB}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  };

  const handleCreateNewList = () => {
    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      showBtns: false,
      comp: (
        <CreateUserListModal
          mongoUser={mongoUser}
          onListCreated={handleListCreated}
          onClose={() => dialogSet({ isOpen: false })}
        />
      ),
    });
  };

  const handleListCreated = (newList) => {
    // Refresh the lists and redirect to the new list
    if (refreshUserLists) {
      refreshUserLists();
    }
    if (newList?.slug) {
      router.push(`${COLLECTIONS_USER_LISTS_ROUTE}/${newList.slug}`);
    }
  };

  const handleRenameList = () => {
    if (!currentList?.fullData?._id) {
      toastSet({
        isOpen: true,
        title: t("error"),
        text: "List not found",
        variant: "destructive",
      });
      return;
    }

    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      showBtns: false,
      comp: (
        <RenameUserListModal
          list={currentList?.fullData}
          onListRenamed={handleListRenamed}
          onClose={() => dialogSet({ isOpen: false })}
        />
      ),
    });
  };

  const handleListRenamed = (updatedList) => {
    // Refresh the lists and stay on the current page
    if (refreshUserLists) {
      refreshUserLists();
    }
    // Redirect to the updated slug in case the slug changed
    if (updatedList?.slug && updatedList.slug !== currentList?.id) {
      router.push(`${COLLECTIONS_USER_LISTS_ROUTE}/${updatedList.slug}`);
    }
  };

  const handleDeleteList = () => {
    if (!currentList?.fullData?._id) {
      toastSet({
        isOpen: true,
        title: t("error"),
        text: "List not found",
        variant: "destructive",
      });
      return;
    }

    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      showBtns: false,
      comp: (
        <DeleteUserListConfirmationDialog
          listName={currentList?.fullData?.name || "this list"}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {}}
        />
      ),
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteUserList(currentList.fullData._id);

      if (result.error) {
        throw new Error(result.error);
      }

      toastSet({
        isOpen: true,
        title: t("success"),
        text: "List deleted successfully",
      });

      // Refresh the lists and redirect to main collections
      if (refreshUserLists) {
        refreshUserLists();
      }
      router.push(COLLECTIONS_USER_LISTS_HUB);
    } catch (error) {
      console.error("❌ Error deleting list:", error);
      toastSet({
        isOpen: true,
        title: t("error"),
        text: error.message || "Failed to delete list",
        variant: "destructive",
      });
    }
  };

  const handleBackClick = () => {
    // If we're on the main collections route, go to main route, otherwise go to collections route
    if (pathname === COLLECTIONS_USER_LISTS_HUB) {
      router.push(MAIN_ROUTE);
    } else {
      router.push(COLLECTIONS_USER_LISTS_HUB);
    }
  };

  const getTitle = () => {
    if (pathname === COLLECTIONS_USER_LISTS_HUB) {
      return t("collections").toUpperCase();
    } else if (currentList?.name) {
      return currentList.name.toUpperCase();
    } else {
      return pathname.split("/").pop().toUpperCase();
    }
  };

  // Check if we're viewing a custom list (to show dropdown)
  const isViewingCustomList =
    currentList?.isCustom &&
    currentList?.fullData?._id &&
    pathname !== COLLECTIONS_USER_LISTS_HUB;

  return (
    <div
      className={`f fwn aic jcsb mxa z50 sticky t0 h60 ${width} bg-background wf p15 border-[1px]`}
    >
      <div className="f fwn maw1000 wf aic">
        {!isSearchMode ? (
          <>
            <ArrowLeft
              className="cursor-pointer mr-2 hs"
              onClick={handleBackClick}
            />
            <div
              className={`title pr30 ${
                isMobileSm ? "maw220" : "maw750"
              } oh truncate`}
            >
              {getTitle()}
            </div>
            <div className="mla f fwn aic g10">
              {/* List Options Dropdown - only show for custom lists */}
              {isViewingCustomList && (
                <DropdownIcon
                  Icon={() => (
                    <EllipsisVertical size={24} className={ICONBUTTON_CLASS} />
                  )}
                  className="cp"
                  ignoreClick={false}
                >
                  <div
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent cp"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRenameList();
                    }}
                  >
                    Rename list
                  </div>
                  <div
                    className="block px-4 py-2 text-sm text-red-600 hover:bg-accent cp"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteList();
                    }}
                  >
                    Delete list
                  </div>
                </DropdownIcon>
              )}

              {/* Create New List Button */}
              {mongoUser && (
                <div onClick={handleCreateNewList}>
                  <Plus size={24} className={ICONBUTTON_CLASS} />
                </div>
              )}
              <div className="bg-background" onClick={handleSearchIconClick}>
                <CollectionsSearchIcon />
              </div>
            </div>
          </>
        ) : (
          <CollectionsSearchInput onCancel={handleCancelSearch} />
        )}
      </div>
    </div>
  );
};

export default CollectionsTitle;
