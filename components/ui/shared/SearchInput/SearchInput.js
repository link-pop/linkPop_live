"use client";

import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder,
  autoFocus = false,
  className = "",
  ...props
}) => {
  const { t } = useTranslation();

  const handleInputChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <div className={`relative f aic wf ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder || t("search")}
        className="relative -t5 wf h40 pl40 pr40 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        autoFocus={autoFocus}
        {...props}
      />
      <X
        className="w20 h20 poa l10 t15 translate-y-[-50%] cursor-pointer text-muted-foreground hover:text-foreground"
        onClick={handleClear}
      />
    </div>
  );
};

export default SearchInput;
