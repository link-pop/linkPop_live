"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ArrowLeft } from "lucide-react";
import { SITE2 } from "@/config/env";
import {
  CHATROOMS_SEND_ROUTE,
  CHATROOMS_STATISTICS_ROUTE,
  CHATS_ROUTE,
  MAIN_ROUTE,
} from "@/lib/utils/constants";
import MessagesScheduledIcon from "./MessagesScheduledIcon";
import MessagesSearchIcon from "./MessagesSearchIcon";
import MessagesSearchInput from "./MessagesSearchInput";
import MassMessagesSearchInput from "./MassMessagesSearchInput";
import MessagesNewIcon from "./MessagesNewIcon";
import MessagesSentStatisticsIcon from "./MessagesSentStatisticsIcon";
import MessagesInChatFindIcon from "./MessagesInChatFindIcon";
import ChatMessageSearchInput from "./ChatMessageSearchInput";
import { useChatSearch } from "@/contexts/ChatSearchContext";
import { useContext } from "@/components/Context/Context";
import MessagesListsIcon from "./MessagesListsIcon";
import MessagesGalleryIcon from "./MessagesGalleryIcon";
import MessagesNotesIcon from "./MessagesNotesIcon";
import MessagesPinIcon from "./MessagesPinIcon";
import useWindowWidth from "@/hooks/useWindowWidth";

const MessagesTitle = () => {
  if (SITE2) return null;

  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleChatMessageSearch, showPinnedOnly, togglePinnedMode } =
    useChatSearch();
  const { mongoUser } = useContext();
  const { isMobileSm } = useWindowWidth();

  // Initialize search mode based on URL search params
  const [isSearchMode, setIsSearchMode] = useState(() => {
    return !!searchParams.get("q") || searchParams.get("search") === "true";
  });

  // State for chat message search (specific to current chat room)
  const [isChatSearchMode, setIsChatSearchMode] = useState(false);

  // Update search mode when URL parameters change
  useEffect(() => {
    const hasSearchQuery = !!searchParams.get("q");
    const shouldTriggerSearch = searchParams.get("search") === "true";
    setIsSearchMode(hasSearchQuery || shouldTriggerSearch);

    // Clean up the search trigger parameter after setting search mode
    if (shouldTriggerSearch) {
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      const newUrl = `${CHATS_ROUTE}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  // Only show on chatrooms routes
  if (!pathname?.includes(CHATS_ROUTE)) return null;

  const width = "maw1000"; // Wider layout for chatrooms

  // Check if we're on the mass message send page or statistics page
  const isOnSendPage = pathname === CHATROOMS_SEND_ROUTE;
  const isOnStatsPage = pathname === CHATROOMS_STATISTICS_ROUTE;

  // Check if we're on a specific chat room page
  const isOnSpecificChatRoom =
    pathname && pathname.match(/^\/chatrooms\/[^\/]+$/);

  const handleSearchIconClick = () => {
    // Check if we're on a specific chat room page
    const isOnSpecificChatRoom =
      pathname && pathname.match(/^\/chatrooms\/[^\/]+$/);

    if (isOnStatsPage) {
      // If on statistics page, enable search mode for mass messages
      setIsSearchMode(true);
    } else if (isOnSpecificChatRoom || isOnSendPage) {
      // If on specific chat room or send page, redirect to main chatrooms page and trigger search mode
      router.push(`${CHATS_ROUTE}?search=true`);
    } else {
      // If already on main chatrooms page, just enable search mode
      setIsSearchMode(true);
    }
  };

  const handleCancelSearch = () => {
    setIsSearchMode(false);
    // Clear the search query from URL
    const params = new URLSearchParams(searchParams);
    params.delete("q");

    // Determine the correct URL based on current page
    const baseUrl = isOnStatsPage ? CHATROOMS_STATISTICS_ROUTE : CHATS_ROUTE;
    const newUrl = `${baseUrl}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  };

  const handleNewMessageClick = () => {
    router.push(CHATROOMS_SEND_ROUTE);
  };

  const handleChatFindClick = () => {
    setIsChatSearchMode(true);
  };

  const handleChatSearchCancel = () => {
    setIsChatSearchMode(false);
    handleChatMessageSearch?.("");
  };

  const handleChatSearch = (searchQuery) => {
    handleChatMessageSearch?.(searchQuery);
  };

  const handlePinIconClick = () => {
    togglePinnedMode();
  };

  // Extract chatId from pathname for pinned messages
  const currentChatId = isOnSpecificChatRoom ? pathname.split("/").pop() : null;

  const getTitle = () => {
    if (isOnSendPage) {
      return t("newMessage").toUpperCase();
    }
    if (isOnStatsPage) {
      return "MASS MESSAGES STATISTICS";
    }
    return t("messages").toUpperCase();
  };

  const handleBackClick = () => {
    // If we're on the main chats route, go to main route, otherwise go to chats route
    if (pathname === CHATS_ROUTE) {
      router.push(MAIN_ROUTE);
    } else {
      router.push(CHATS_ROUTE);
    }
  };

  return (
    <div
      className={`f fwn aic jcsb mxa z50 sticky t0 h60 ${width} bg-background wf p15 border-[1px]`}
    >
      <div className="f maw370 wfc aic">
        {!isSearchMode && !isChatSearchMode ? (
          <>
            <ArrowLeft
              className="cursor-pointer mr-2 hs"
              onClick={handleBackClick}
            />
            <div className={`title pr30 ${isMobileSm ? "hidden" : ""}`}>
              {getTitle()}
            </div>
            {!isOnSendPage && (
              <div className="mla f aic g10">
                {!isOnStatsPage && <MessagesScheduledIcon />}
                <div
                  className={`bg-background ${isOnStatsPage ? "poa r15" : ""}`}
                  onClick={handleSearchIconClick}
                >
                  <MessagesSearchIcon />
                </div>
                {!isOnStatsPage && <MessagesSentStatisticsIcon />}
                {!isOnStatsPage && (
                  <div onClick={handleNewMessageClick}>
                    <MessagesNewIcon />
                  </div>
                )}
              </div>
            )}
          </>
        ) : isChatSearchMode ? (
          // Show chat message search input for current chat room
          <ChatMessageSearchInput
            onCancel={handleChatSearchCancel}
            onSearch={handleChatSearch}
          />
        ) : // Show different search input based on current page
        isOnStatsPage ? (
          <MassMessagesSearchInput onCancel={handleCancelSearch} />
        ) : (
          <MessagesSearchInput onCancel={handleCancelSearch} />
        )}
      </div>
      <div>
        {/* Show find icon only on specific chat room pages */}
        {isOnSpecificChatRoom && (
          <div className="f aic g10">
            <MessagesListsIcon />
            <MessagesGalleryIcon />
            <MessagesNotesIcon />
            <div onClick={handlePinIconClick}>
              <MessagesPinIcon isActive={showPinnedOnly} />
            </div>
            <div onClick={handleChatFindClick}>
              <MessagesInChatFindIcon />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTitle;
