import { useTranslation } from "@/components/Context/TranslationContext";

export default function PreferencesNote() {
  const { t } = useTranslation();

  return (
    <div className="p-3 bg-accent/10 rounded-md text-sm text-foreground/70">
      <p>
        {t("preferencesNote") ||
          "These preferences will be used to personalize your content suggestions."}
      </p>
    </div>
  );
}
