"use client";

import { Images } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

const MessagesGalleryIcon = () => {
  const { t } = useTranslation();
  return (
    <div title={t("gallery")}>
      <Images className="w24 h24 cursor-pointer hs" />
    </div>
  );
};

export default MessagesGalleryIcon;
