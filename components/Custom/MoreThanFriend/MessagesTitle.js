"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ArrowLeft } from "lucide-react";
import { SITE2 } from "@/config/env";
import { CHATS_ROUTE } from "@/lib/utils/constants";
import MessagesScheduledIcon from "./MessagesScheduledIcon";
import MessagesSearchIcon from "./MessagesSearchIcon";
import MessagesSearchInput from "./MessagesSearchInput";
import MessagesNewIcon from "./MessagesNewIcon";
import MessagesSentStatisticsIcon from "./MessagesSentStatisticsIcon";

const MessagesTitle = () => {
  if (SITE2) return null;

  const pathname = usePathname();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

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
      const newUrl = `/chatrooms${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  // Only show on chatrooms routes
  if (!pathname?.includes("/chatrooms")) return null;

  const width = "maw1000"; // Wider layout for chatrooms

  // Check if we're on the mass message send page
  const isOnSendPage = pathname === "/chatrooms/send";

  const handleSearchIconClick = () => {
    // Check if we're on a specific chat room page
    const isOnSpecificChatRoom =
      pathname && pathname.match(/^\/chatrooms\/[^\/]+$/);

    if (isOnSpecificChatRoom || isOnSendPage) {
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
    const newUrl = `/chatrooms${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  };

  const handleNewMessageClick = () => {
    router.push("/chatrooms/send");
  };

  const getTitle = () => {
    if (isOnSendPage) {
      return t("newMessage").toUpperCase();
    }
    return t("messages").toUpperCase();
  };

  const handleBackClick = () => {
    router.push(CHATS_ROUTE);
  };

  return (
    <div
      className={`mxa z50 sticky t0 h60 ${width} wf bg-background wf f aic jcsb p15 border-[1px]`}
    >
      <div className="f maw370 wf aic">
        {!isSearchMode ? (
          <>
            <ArrowLeft
              className="cursor-pointer mr-2 hs"
              onClick={handleBackClick}
            />
            <div className="title">{getTitle()}</div>
            {!isOnSendPage && (
              <div className="mla f aic g10">
                <MessagesScheduledIcon />
                <div onClick={handleSearchIconClick}>
                  <MessagesSearchIcon />
                </div>
                <MessagesSentStatisticsIcon />
                <div onClick={handleNewMessageClick}>
                  <MessagesNewIcon />
                </div>
              </div>
            )}
          </>
        ) : (
          <MessagesSearchInput onCancel={handleCancelSearch} />
        )}
      </div>
    </div>
  );
};

export default MessagesTitle;
