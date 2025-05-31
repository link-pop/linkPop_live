"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import SearchCurrentTags from "@/components/Search/SearchCurrentTags";

export default function SearchResultsHeader({
  totalCount,
  approach,
  isLoading,
  mongoUser,
  searchParams = {},
  onRemoveTag,
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      {/* Current Search Tags */}
      <SearchCurrentTags
        searchParams={searchParams}
        onRemoveTag={onRemoveTag}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          {!isLoading && totalCount > 0 && (
            <p className="text-sm text-foreground/60 mt-1">
              {totalCount === 1
                ? t("oneCreatorFound") || "1 creator found"
                : `${totalCount} ${t("creatorsFound") || "creators found"}`}
            </p>
          )}
        </div>
      </div>

      {/* Developer info - show approach used */}
      {mongoUser?.isDev && approach && approach !== "none" && (
        <div className="mb-4 p-3 bg-accent/10 rounded-md text-xs text-foreground/70 text-center">
          DEV: searchApproach: {approach} | totalCount: {totalCount}
        </div>
      )}
    </div>
  );
}
