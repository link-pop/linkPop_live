import { useTranslation } from "@/components/Context/TranslationContext";
import { Check } from "lucide-react";
import Alert from "@/components/ui/shared/Alert/Alert";

export default function ShieldProtectionEnabledInfo({ className = "" }) {
  const { t } = useTranslation();
  return (
    <Alert
      icon={<Check className="w-5 h-5 text-green-600" />}
      title={
        <span className="text-green-700 font-semibold">
          {t("shieldProtection")} {t("enabled")}
        </span>
      }
      description={
        <span className="text-muted-foreground">
          {t("shieldProtectionDesc") ||
            "Shield Protection redirects bots and moderators to a safe page instead of your destination URL. This helps protect your links from being blocked by social media platforms."}
        </span>
      }
      className={`mb-6 border-green-200 bg-green-50 dark:bg-green-950/40 ${className}`}
    />
  );
}
