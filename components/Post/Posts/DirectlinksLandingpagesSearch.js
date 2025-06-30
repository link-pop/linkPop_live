"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import SearchInput from "@/components/ui/shared/SearchInput/SearchInput";

const DirectlinksLandingpagesSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useTranslation();

  // Get the search query from URL params (using 'q' as the parameter name)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Update URL with search query when searchQuery changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }

    // Update URL for real-time search (client component reads params directly)
    const newUrl = `${pathname}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, router, searchParams, pathname]);

  const handleClear = () => {
    setSearchQuery("");
  };

  return (
    <div className="mt40 maw450 wf px15 mxa">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={handleClear}
        placeholder={t("search", "Search by name or username...")}
        autoFocus={false}
        className="wf"
      />
    </div>
  );
};

export default DirectlinksLandingpagesSearch;
