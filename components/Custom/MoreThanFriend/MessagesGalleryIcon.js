"use client";

import { Images } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useChatSearch } from "@/contexts/ChatSearchContext";

const MessagesGalleryIcon = () => {
  const { t } = useTranslation();
  const { toggleGallery, showGallery } = useChatSearch();

  return (
    <div title={t("gallery")} onClick={toggleGallery}>
      <Images
        className={`w24 h24 cursor-pointer hs ${showGallery ? "brand" : ""}`}
      />
    </div>
  );
};

export default MessagesGalleryIcon;
