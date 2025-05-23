"use client";

import { Settings, Undo2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";
import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";

export default function SuggestionHeaderSection({
  currentUser,
  handleClearHiddenSuggestions,
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
        >
          <Settings size={18} className="cp" title={t("preferences")} />
        </Link>
      </div>
    </div>
  );
}
