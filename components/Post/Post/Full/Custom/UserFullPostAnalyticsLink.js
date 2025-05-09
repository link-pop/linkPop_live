import { ChartSpline } from "lucide-react";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";

// TODO !!!!!!! one PostAnalyticsLink for user and directlinks
export default function UserFullPostAnalyticsLink({ visitedMongoUser }) {
  // Create analytics URL for this user profile
  const analyticsUrl = `/${visitedMongoUser?.name}/analytics`;

  return (
    <RoundIconButton
      href={analyticsUrl}
      extraClasses="bw1 border-[var(--color-brand)] br50 h44 w44 cp fcc"
    >
      <ChartSpline size={16} className="brand" />
    </RoundIconButton>
  );
}
