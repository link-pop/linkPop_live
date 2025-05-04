"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function ReplyButton({ onClick, className = "" }) {
  const { t } = useTranslation();
  if (!onClick) return null;

  return (
    <div
      onClick={onClick}
      className={`fz12 wfc cp ${BRAND_INVERT_CLASS} ${className}`}
    >
      {t("reply")}
    </div>
  );
}
