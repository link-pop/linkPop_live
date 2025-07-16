"use client";

import React, { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import SearchInput from "@/components/ui/shared/SearchInput/SearchInput";

const ChatMessageSearchInput = ({ onCancel, onSearch }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    // Call onSearch immediately as user types for real-time search
    onSearch?.(value);
  };

  const handleClear = () => {
    setSearchQuery("");
    onSearch?.("");
    onCancel?.();
  };

  return (
    <div className="absolute r10 t15 z2 f aic">
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleClear}
        placeholder={t("searchMessages")}
        autoFocus={true}
      />
    </div>
  );
};

export default ChatMessageSearchInput;
