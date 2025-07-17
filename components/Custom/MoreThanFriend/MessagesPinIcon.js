"use client";

import { Pin } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesPinIcon = ({ isActive = false }) => {
  const { t } = useTranslation();
  return (
    <div title={isActive ? t("showAllMessages") : t("pinned")}>
      <Pin className={`w24 h24 cursor-pointer hs ${isActive ? "brand" : ""}`} />
    </div>
  );
};

export default MessagesPinIcon;
