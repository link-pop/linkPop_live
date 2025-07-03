"use client";

import FormSection from "./FormSection";
import FormActiveCheckbox from "./FormActiveCheckbox";
import FormUrlInput from "./FormUrlInput";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Check, HelpCircle } from "lucide-react";

export default function FormShieldProtectionSection({
  shieldProtection = true,
  safePageUrl = "google.com",
  onChange,
  errors = {},
  hideHelperText = false,
}) {
  const { t } = useTranslation();

  // ! SHOW THIS WHILE <FormSection title="shieldProtectionSettings"> is commented out
  return (
    <div>
      <div className="fcc text-green-500 text-md font-medium">
        <Check className="w-4 h-4 mr-2" />
        {t("shieldProtection")} {t("enabled")}
      </div>

      <div className="!fz12 tac px30 mb-4">
        <p className="text-muted-foreground mb-2">
          {t("shieldProtectionDesc") ||
            "Shield Protection redirects bots and moderators to a safe page instead of your destination URL. This helps protect your links from being blocked by social media platforms."}
        </p>
      </div>
    </div>
  );

  return (
    <FormSection title="shieldProtectionSettings">
      <div className="space-y-4">
        <div className="flex items-center mb-2">
          <h3 className="text-md font-medium">
            {t("shieldProtection") || "Shield Protection"}
          </h3>
          <div
            className="ml-2 text-muted-foreground hover:text-foreground cursor-help"
            title={
              t("shieldProtectionHelp") ||
              "Shield Protection safeguards your links by redirecting bots and moderators to a safe page"
            }
          >
            <HelpCircle size={16} />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            {t("shieldProtectionDesc") ||
              "Shield Protection redirects bots and moderators to a safe page instead of your destination URL. This helps protect your links from being blocked by social media platforms."}
          </p>
        </div>

        <FormActiveCheckbox
          isActive={shieldProtection}
          onChange={(e) =>
            onChange({
              target: {
                name: "shieldProtection",
                type: "checkbox",
                checked: e.target.checked,
              },
            })
          }
          customLabel={
            t("enableShieldProtection") || "Enable Shield Protection"
          }
          className="!mb-6"
        />

        <FormUrlInput
          name="safePageUrl"
          value={safePageUrl}
          onChange={onChange}
          error={errors.safePageUrl}
          label="safePageUrl"
          placeholder="https://www.google.com"
          hideHelperText={hideHelperText}
          helperText={
            t("safePageUrlHelp") ||
            "The URL where bots and moderators will be redirected"
          }
        />
      </div>
    </FormSection>
  );
}