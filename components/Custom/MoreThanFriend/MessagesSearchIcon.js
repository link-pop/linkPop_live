"use client";

import { Search } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesSearchIcon = () => {
  const { t } = useTranslation();
  return (
    <div title={t("search")}>
      <Search className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesSearchIcon;
