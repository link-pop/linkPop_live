"use client";

import Switch from "@/components/ui/shared/Switch/Switch";
import { useNavPosition } from "@/components/Context/NavPositionContext";
import { useTranslation } from "@/components/Context/TranslationContext";
import { MENU_CLASS } from "@/lib/utils/constants";

// ! code start NavPositionToggle
export default function NavPositionToggle({ className = "" }) {
  const {
    isAttachedToContent,
    toggleNavPosition,
    isExpandable,
    toggleNavExpandable,
  } = useNavPosition();
  const { t } = useTranslation();

  return (
    <div className="fc max-[1900px]:hidden">
      <Switch
        label={t("navAttachedToContent")}
        isChecked={isAttachedToContent}
        onCheckedChange={toggleNavPosition}
        className={className + ` ${MENU_CLASS} miwf`}
      />
      <Switch
        label={t("navExpandable")}
        isChecked={isExpandable}
        onCheckedChange={toggleNavExpandable}
        className={className + ` ${MENU_CLASS} miwf`}
      />
    </div>
  );
}
// ? code end NavPositionToggle
