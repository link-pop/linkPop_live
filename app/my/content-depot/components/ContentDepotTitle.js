"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext as useMainContext } from "@/components/Context/Context";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";
import { useContext } from "react";
import { ArrowLeft, Plus, EllipsisVertical } from "lucide-react";
import {
  MAIN_ROUTE,
  CONTENT_DEPOT_LISTS_HUB,
  CONTENT_DEPOT_ROUTE,
  CONTENT_DEPOT_LIST_ROUTE,
  ICONBUTTON_CLASS,
} from "@/lib/utils/constants";
import ContentDepotSearchIcon from "./ContentDepotSearchIcon";
import ContentDepotSearchInput from "./ContentDepotSearchInput";
import useWindowWidth from "@/hooks/useWindowWidth";
import CreateListModal from "../list/[userlistid]/components/CreateListModal";
import RenameListModal from "./RenameListModal";
import DeleteListConfirmationDialog from "./DeleteListConfirmationDialog";
import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";
import { deleteUserList } from "@/lib/actions/deleteUserList";

const ContentDepotTitle = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();
  const { dialogSet, toastSet } = useMainContext();
  const {
    contentDepotSearchResults,
    mongoUser,
    refreshUserLists,
    currentList,
  } = useContext(ContentDepotContext);

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
      const newUrl = `${CONTENT_DEPOT_LISTS_HUB}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  // Only show on content depot routes
  if (!pathname?.includes(CONTENT_DEPOT_ROUTE)) return null;

  const width = "maw1000";

  const handleSearchIconClick = () => {
    setIsSearchMode(true);
  };

  const handleCancelSearch = () => {
    setIsSearchMode(false);
    // Clear the search query from URL
    const params = new URLSearchParams(searchParams);
    params.delete("q");

    const newUrl = `${CONTENT_DEPOT_LISTS_HUB}${
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
        <CreateListModal
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
      router.push(`${CONTENT_DEPOT_LIST_ROUTE}/${newList.slug}`);
    }
  };

  const handleRenameList = () => {
    dialogSet({
      isOpen: true,
      hasCloseIcon: true,
      showBtns: false,
      comp: (
        <RenameListModal
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
      router.push(`${CONTENT_DEPOT_LIST_ROUTE}/${updatedList.slug}`);
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
        <DeleteListConfirmationDialog
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

      // Refresh the lists and redirect to main content depot
      if (refreshUserLists) {
        refreshUserLists();
      }
      router.push(CONTENT_DEPOT_LISTS_HUB);
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
    // If we're on the main content depot route, go to main route, otherwise go to content depot route
    if (pathname === CONTENT_DEPOT_LISTS_HUB) {
      router.push(MAIN_ROUTE);
    } else {
      router.push(CONTENT_DEPOT_LISTS_HUB);
    }
  };

  const getTitle = () => {
    if (pathname === CONTENT_DEPOT_LISTS_HUB) {
      return t("vault").toUpperCase();
    } else {
      return pathname.split("/").pop().toUpperCase();
    }
  };

  // Check if we're viewing a custom list (to show dropdown)
  const isViewingCustomList =
    currentList?.isCustom && currentList?.fullData?._id;

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
                <div
                  className="CreateNewListIcon"
                  onClick={handleCreateNewList}
                >
                  <Plus size={24} className={ICONBUTTON_CLASS} />
                </div>
              )}
              <div className="bg-background" onClick={handleSearchIconClick}>
                <ContentDepotSearchIcon />
              </div>
            </div>
          </>
        ) : (
          <ContentDepotSearchInput onCancel={handleCancelSearch} />
        )}
      </div>
    </div>
  );
};

export default ContentDepotTitle;
