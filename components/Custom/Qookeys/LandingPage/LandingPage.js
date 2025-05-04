import HeroBanner from "./Banner/HeroBanner";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import Testimonials from "./Testimonial/Testimonials";
import Stats from "./Stats";
import CTA from "./CTA";
import CategoryBanners from "./Banner/CategoryBanners";

export default function LandingPage() {
  return (
    <div className="w-full bg-white">
      {/* max-w-[1300px] wf */}
      <div className="min-h-screen bg-white text-gray-200">
        {/* Main Content */}
        <div className="w-full">
          <HeroBanner />
          <HowItWorks />
          <Features />
          <Testimonials />
          <CategoryBanners />
          <Stats />
          <CTA />
        </div>
      </div>
    </div>
  );
}
