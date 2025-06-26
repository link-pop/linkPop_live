import { ChartSpline } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

// TODOing: https://onlyfans.com/my/mass_chats
export default function MessagesSentStatisticsIcon() {
  const { t } = useTranslation();
  return (
    <div title={t("sentMassMessagesStatistics")}>
      <ChartSpline className="w24 h24 cp hs" />
    </div>
  );
}
