"use client";

import VisitorTimelineChart from "./AllVisitorTimelineChart";

// ! code start DirectLinksVisitorChart
export default function DirectLinksVisitorChart({
  visitors,
  directlinks,
  visitorsByDirectlink,
}) {
  return (
    <VisitorTimelineChart
      visitors={visitors}
      items={directlinks}
      visitorsByItem={visitorsByDirectlink}
      title="Direct Links"
      itemLabel="Direct Link"
      hideClicks={true}
    />
  );
}
// ? code end DirectLinksVisitorChart
