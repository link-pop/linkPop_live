"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { X, Search } from "lucide-react";
import { CONTENT_DEPOT_LISTS_HUB } from "@/lib/utils/constants";
import { searchUserLists } from "@/lib/actions/searchUserLists";
import { useContext } from "react";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";

const ContentDepotSearchInput = ({ onCancel }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setContentDepotSearchResults } = useContext(ContentDepotContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Initialize search query from URL params
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setSearchQuery(urlQuery);
      handleSearch(urlQuery);
    }
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setContentDepotSearchResults?.(null);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchUserLists(query.trim());
      if (result.error) {
        console.error("❌ Search error:", result.error);
        setContentDepotSearchResults?.([]);
      } else {
        setContentDepotSearchResults?.(result.data || []);
      }
    } catch (error) {
      console.error("❌ Search failed:", error);
      setContentDepotSearchResults?.([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Update URL with search query
    const params = new URLSearchParams(searchParams);
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    const newUrl = `${CONTENT_DEPOT_LISTS_HUB}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });

    // Perform search
    handleSearch(value);
  };

  const handleCancel = () => {
    setSearchQuery("");
    setContentDepotSearchResults?.(null);
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="f aic wf">
      <div className="relative f aic wf">
        <Search size={18} className="poa l10 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t("search")}
          className="h40 pl35 pr40 wf bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {(searchQuery || isSearching) && (
          <div className="poa r10 f aic">
            {isSearching ? (
              <div className="w4 h4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <X
                size={18}
                className="text-muted-foreground cp hover:text-foreground"
                onClick={handleCancel}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDepotSearchInput;
