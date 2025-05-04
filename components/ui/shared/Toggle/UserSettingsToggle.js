"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { MENU_CLASS } from "@/lib/utils/constants";
import Switch2 from "@/components/ui/shared/Switch/Switch2";

export default function UserSettingsToggle({
  mongoUser,
  children,
  propertyName,
  translationKey,
  toggleAction,
  defaultValue = true,
}) {
  const { t } = useTranslation();
  const [isEnabled, setIsEnabled] = useState(
    mongoUser?.[propertyName] ?? defaultValue
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async (checked) => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    setIsEnabled(checked);

    const formData = new FormData();
    formData.append("isEnabled", checked.toString());

    await toggleAction(formData);
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className={`${isSubmitting ? "pen" : ""}`}>
        {/* Clicking this div will toggle the state */}
        <div
          className={`${MENU_CLASS} bw1 wf f aic jcsb cursor-pointer`}
          onClick={() => handleToggle(!isEnabled)}
        >
          <span>{t(translationKey)}</span>
          <Switch2
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isSubmitting}
          />
        </div>

        {children && (
          <div className={`fz14 ${isEnabled ? "" : "pen !opacity-50"}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
