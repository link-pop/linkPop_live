"use client";

import VisitorTimelineChart from "./AllVisitorTimelineChart";

// ! code start LandingPagesVisitorChart
export default function LandingPagesVisitorChart({
  visitors,
  landingpages,
  visitorsByLandingPage,
}) {
  return (
    <VisitorTimelineChart
      visitors={visitors}
      items={landingpages}
      visitorsByItem={visitorsByLandingPage}
      title="Landing Pages"
      itemLabel="Landing Page"
    />
  );
}
// ? code end LandingPagesVisitorChart
