"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { LetterText } from "lucide-react";
import { useState } from "react";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

export default function useAddFeedFormTipTapSettings() {
  const [isTipTapSettingsVisible, setIsTipTapSettingsVisible] = useState(false);
  const { t } = useTranslation();

  function TipTapSettings() {
    return (
      <div className={`f gap10`}>
        <IconButton
          icon={LetterText}
          onClick={() => setIsTipTapSettingsVisible(!isTipTapSettingsVisible)}
          title={t("addMarkup")}
        />
      </div>
    );
  }

  return { TipTapSettings, isTipTapSettingsVisible };
}
