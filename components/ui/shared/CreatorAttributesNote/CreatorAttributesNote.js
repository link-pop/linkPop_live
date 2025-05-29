import { useTranslation } from "@/components/Context/TranslationContext";

export default function CreatorAttributesNote() {
  const { t } = useTranslation();

  return (
    <div className="p-3 bg-accent/10 rounded-md text-sm text-foreground/70">
      <p>
        {t("creatorAttributesNote") ||
          "These attributes help fans discover your profile based on their preferences."}
      </p>
    </div>
  );
}
