"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Search, X } from "lucide-react";

const MessagesSearchInput = ({ onCancel }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Update URL with search query - but only when on chatrooms list page, not on specific chat room
  useEffect(() => {
    // Don't update URL if we're on a specific chat room page (e.g., /chatrooms/[chatId])
    const isOnSpecificChatRoom =
      pathname && pathname.match(/^\/chatrooms\/[^\/]+$/);
    if (isOnSpecificChatRoom) return;

    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }

    // Update URL without triggering a page reload
    const newUrl = `/chatrooms${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, router, searchParams, pathname]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onCancel();
  };

  return (
    <div className="f aic wf">
      <div className="relative f aic wf">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={t("search")}
          className="relative -t5 wf h40 pl40 pr40 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
        <X
          className="w20 h20 poa l10 t15 translate-y-[-50%] cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={clearSearch}
        />
      </div>
    </div>
  );
};

export default MessagesSearchInput;
