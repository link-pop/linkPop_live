import { ChartSpline } from "lucide-react";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";
import { SITE1, SITE2 } from "@/config/env";

// TODO !!!!!!! one PostAnalyticsLink for user and directlinks
export default function UserFullPostAnalyticsLink({ visitedMongoUser }) {
  // Create analytics URL for this user profile
  const analyticsUrl = `/${visitedMongoUser?.name}/analytics`;

  // Set extraClasses based on SITE1 or SITE2
  let extraClasses = "";
  if (SITE1) {
    extraClasses = "brand bw1 border-[var(--color-brand)] br50 h44 w44 cp fcc";
  } else if (SITE2) {
    extraClasses =
      "poa t15 r15 justify-end mb-4 !maw600 mxa bg-background/80 backdrop-blur-sm shadow-sm";
  }

  return (
    <RoundIconButton href={analyticsUrl} extraClasses={extraClasses}>
      <ChartSpline size={16} className="" />
    </RoundIconButton>
  );
}
