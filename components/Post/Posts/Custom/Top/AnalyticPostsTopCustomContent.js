import SwitchShowAnalyticIcons from "@/app/api/analytics/SwitchShowAnalyticIcons";
import LinkWithIcon from "@/components/ui/shared/LinkWithIcon/LinkWithIcon";

export default function AnalyticPostsTopCustomContent({ col }) {
  if (col.name !== "analytics") return null;

  return (
    <div className="wf">
      <LinkWithIcon href="/analytics/deep" text="Analytics" />
      <SwitchShowAnalyticIcons />
    </div>
  );
}
