"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import { X, Search } from "lucide-react";
import { CONTENT_DEPOT_LISTS_HUB } from "@/lib/utils/constants";
import { searchUserLists } from "@/lib/actions/searchUserLists";
import { useContext } from "react";
import { ContentDepotContext } from "@/components/Context/ContentDepotContext";
import SearchInput from "@/components/ui/shared/SearchInput/SearchInput";

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

  const handleInputChange = (value) => {
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
      <div className="absolute r10 t15 z2 f aic">
        <SearchInput
          value={searchQuery}
          onChange={handleInputChange}
          onClear={handleCancel}
          placeholder={t("search")}
          autoFocus={true}
        />
      </div>
    </div>
  );
};

export default ContentDepotSearchInput;
