"use client";

import { Pin } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesPinIcon = () => {
  const { t } = useTranslation();
  return (
    <div title={t("pinned")}>
      <Pin className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesPinIcon;
