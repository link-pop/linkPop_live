"use client";

import { Star } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesListsIcon = () => {
  const { t } = useTranslation();
  return (
    <div title={t("lists")}>
      <Star className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesListsIcon;
