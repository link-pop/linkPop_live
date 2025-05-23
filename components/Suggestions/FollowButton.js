"use client";

import { useTranslation } from "@/components/Context/TranslationContext";

export default function FollowButton({
  className = "absolute right-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
  onClick,
}) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div
        className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick();
        }}
      >
        <span>{t("follow")}</span>
      </div>
    </div>
  );
}
