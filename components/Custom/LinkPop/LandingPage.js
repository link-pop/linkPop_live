import HeroSection from "./LandingPageSections/HeroSection";
import AnalyticsSection from "./LandingPageSections/AnalyticsSection";
import PricingSectionWrapper from "./LandingPageSections/PricingSectionWrapper";
import FaqSection from "./LandingPageSections/FaqSection";
import CtaSection from "./LandingPageSections/CtaSection";
import LandingPageDemoSection from "./LandingPageSections/LandingPageDemoSection";
import DirectLinkDemoSection from "./LandingPageSections/DirectLinkDemoSection";
import ShieldProtectionDemoSection from "./LandingPageSections/ShieldProtectionDemoSection";
import GeoFilterDemoSection from "./LandingPageSections/GeoFilterDemoSection";

export default function LandingPage({ mongoUser }) {
  return (
    <div>
      <HeroSection mongoUser={mongoUser} />
      <div className="border-t-[10px] border-dashed rounded-lg !px45 !mx45"></div>{" "}
      <LandingPageDemoSection mongoUser={mongoUser} />
      <DirectLinkDemoSection mongoUser={mongoUser} />
      <div className="border-t-[10px] border-dashed rounded-lg !px45 !mx45"></div>{" "}
      <GeoFilterDemoSection mongoUser={mongoUser} />
      <AnalyticsSection mongoUser={mongoUser} />
      <ShieldProtectionDemoSection mongoUser={mongoUser} />
      <PricingSectionWrapper />
      <FaqSection />
      <CtaSection mongoUser={mongoUser} />
    </div>
  );
}
