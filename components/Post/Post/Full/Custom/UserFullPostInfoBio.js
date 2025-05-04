"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function UserFullPostInfoBio({ mongoUser }) {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { t } = useTranslation();

  const toggleMoreInfo = () => {
    setShowMoreInfo((prev) => !prev);
  };

  if (!mongoUser.bio) return null;

  const truncatedBio = mongoUser.bio.slice(0, 100);
  const shouldShowToggle = mongoUser.bio.length > 100;
  const moreInfoClass = `fz12 brand`;

  return (
    <div className={`fc g10`}>
      <div className={`mt10`}>
        {showMoreInfo ? mongoUser.bio : truncatedBio}
        {!showMoreInfo && shouldShowToggle && "..."}
      </div>

      {shouldShowToggle && (
        <div
          className={`f g5 aic cp gray hover:underline`}
          onClick={toggleMoreInfo}
        >
          {showMoreInfo ? (
            <>
              <ChevronUp className={`brand`} size={16} />
              <span className={moreInfoClass}>{t("showLess")}</span>
            </>
          ) : (
            <>
              <ChevronDown className={`brand`} size={16} />
              <span className={moreInfoClass}>{t("moreInfo")}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
