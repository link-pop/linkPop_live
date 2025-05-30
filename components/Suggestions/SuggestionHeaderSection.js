"use client";

import { Settings, Undo2, SquareX, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";
import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";
import ClearAllSuggestionsButton from "@/components/ui/shared/ClearAllSuggestionsButton/ClearAllSuggestionsButton";
import PriceFilterToggle from "@/components/ui/shared/PriceFilterToggle/PriceFilterToggle";

export default function SuggestionHeaderSection({
  currentUser,
  handleClearHiddenSuggestions,
  onClearAllSuggestions,
  onRefreshSuggestions,
  showPaidOnly,
  onTogglePriceFilter,
}) {
  const { t } = useTranslation();
  const hiddenSuggestionsCount = currentUser?.hiddenSuggestions?.length || 0;
  const hasHiddenSuggestions = hiddenSuggestionsCount > 0;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground/60">
          {t("suggestions")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Price Filter Toggle */}
        <PriceFilterToggle
          showPaidOnly={showPaidOnly}
          onToggle={onTogglePriceFilter}
        />

        {/* Refresh suggestions with new batch */}
        <div title={t("refreshSuggestions") || "Show different suggestions"}>
          <RefreshCw
            size={18}
            className="text-foreground/40 hover:text-foreground cp transition-colors duration-200"
            onClick={onRefreshSuggestions}
          />
        </div>

        {/* Clear all suggestions data */}
        <ClearAllSuggestionsButton
          currentUser={currentUser}
          onSuccess={onClearAllSuggestions}
          variant="ghost"
          size="sm"
          className="p-0 h-auto w-auto text-foreground/40 hover:text-foreground"
        >
          <SquareX
            size={18}
            className="cp"
            title={t("resetSuggestions") || "Reset all suggestions"}
          />
        </ClearAllSuggestionsButton>

        {/* Hidden suggestions manager */}
        <DropdownIcon
          Icon={(props) => (
            <Undo2
              {...props}
              size={18}
              className="relative t2 text-foreground/40 hover:text-foreground cp"
              title={t("hiddenSuggestions")}
            />
          )}
          menuTitle={
            <p className="fz12 px10 tac text-muted-foreground">
              {hiddenSuggestionsCount} {t("creatorsHidden")}
            </p>
          }
          iconClassName="text-foreground/40 hover:text-foreground"
          collapsibleContentClassName="w-64"
        >
          <div className="text-sm">
            <div
              className={`px10 py-2 flex items-center gap-2 ${
                hasHiddenSuggestions
                  ? "text-foreground hover:text-primary hover:bg-accent/20 transition-colors duration-200 rounded px-1"
                  : "text-foreground/40 cursor-not-allowed"
              } cursor-pointer`}
              onClick={
                hasHiddenSuggestions ? handleClearHiddenSuggestions : undefined
              }
            >
              <Undo2 size={18} className="cp" title={t("hiddenSuggestions")} />
              {t("clearHiddenSuggestions")}
            </div>
          </div>
        </DropdownIcon>

        {/* Preferences link */}
        <Link
          href={`${ONBOARDING_ROUTE}/2`}
          className="text-foreground/40 hover:text-foreground"
          title={t("preferences")}
        >
          <Settings size={18} className="cp" title={t("preferences")} />
        </Link>
      </div>
    </div>
  );
}
