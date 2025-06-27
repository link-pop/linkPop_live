"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";
import SearchInput from "@/components/ui/shared/SearchInput/SearchInput";

const MassMessagesSearchInput = ({ onCancel }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  // Update URL with search query for mass messages
  useEffect(() => {
    // Only update URL if we're on the statistics page
    if (pathname !== "/chatrooms/statistics") return;

    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    } else {
      params.delete("q");
    }

    // Update URL without triggering a page reload
    const newUrl = `/chatrooms/statistics${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, router, searchParams, pathname]);

  const handleClear = () => {
    setSearchQuery("");
    onCancel();
  };

  return (
    <div className="f aic wf">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={handleClear}
        placeholder={t("search")}
        autoFocus={true}
      />
    </div>
  );
};

export default MassMessagesSearchInput;
