import React from "react";
import { FEEDS_ROUTE } from "@/lib/utils/constants";
import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PostCopyLink({ post, iconClassName }) {
  const { toastSet } = useContext();
  const { t } = useTranslation();

  const handleCopyLink = () => {
    const url = `${window.location.origin}${FEEDS_ROUTE}/${post._id}`;
    navigator.clipboard.writeText(url);
    toastSet({ isOpen: true, title: t("linkCopied") });
  };

  return (
    <div onClick={handleCopyLink} className={`f g5 fwn ${iconClassName}`}>
      {t("copyPostLink")}
    </div>
  );
}
