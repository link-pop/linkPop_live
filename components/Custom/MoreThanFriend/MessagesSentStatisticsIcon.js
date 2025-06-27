import { ChartSpline } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useRouter } from "next/navigation";
import { CHATROOMS_STATISTICS_ROUTE } from "@/lib/utils/constants";

export default function MessagesSentStatisticsIcon() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleClick = () => {
    router.push(CHATROOMS_STATISTICS_ROUTE);
  };

  return (
    <div title={t("sentMassMessagesStatistics")} onClick={handleClick}>
      <ChartSpline className="w24 h24 cp hs" />
    </div>
  );
}
