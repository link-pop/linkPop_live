"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext as useMainContext } from "@/components/Context/Context";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";
import { useContext } from "react";
import { ArrowLeft, Plus } from "lucide-react";
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

const ContentDepotTitle = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobileSm } = useWindowWidth();
  const { dialogSet } = useMainContext();
  const { contentDepotSearchResults, mongoUser, refreshUserLists } =
    useContext(ContentDepotContext);

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

  return (
    <div
      className={`f fwn aic jcsb mxa z50 sticky t0 h60 ${width} bg-background wf p15 border-[1px]`}
    >
      <div className="f maw370 wfc aic">
        {!isSearchMode ? (
          <>
            <ArrowLeft
              className="cursor-pointer mr-2 hs"
              onClick={handleBackClick}
            />
            <div
              className={`title pr30 ${
                isMobileSm ? "maw220" : "maw250"
              } oh truncate`}
            >
              {getTitle()}
            </div>
            <div className="mla f aic g10">
              {/* Create New List Button */}
              {mongoUser && (
                <div onClick={handleCreateNewList}>
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
