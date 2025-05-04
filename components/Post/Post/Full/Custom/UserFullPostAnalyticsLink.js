import { ChartSpline } from "lucide-react";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";

// TODO !!!!!!! one PostAnalyticsLink for user and directlinks
export default function UserFullPostAnalyticsLink({ visitedMongoUser }) {
  // Create analytics URL for this user profile
  const analyticsUrl = `/${visitedMongoUser?.name}/analytics`;

  return (
    <RoundIconButton
      href={analyticsUrl}
      extraClasses="poa t15 r15 justify-end mb-4 !maw600 mxa bg-background/80 backdrop-blur-sm shadow-sm"
    >
      <ChartSpline size={16} className="dark:text-white" />
    </RoundIconButton>
  );
}
