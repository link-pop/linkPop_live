"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import Link from "next/link";
import DemoAnalyticsPage from "@/components/Analytics/DemoAnalyticsPage";
import { ExternalLink, Eye, BarChart4 } from "lucide-react";

export default function AnalyticsSection({ mongoUser }) {
  const { t } = useTranslation();

  return (
    <section
      id="analytics-section"
      className="bg-background py-12 md:py-16 lg:py-24 overflow-hidden"
    >
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-foreground">
            <span className="inline-block bg-gradient-to-r from-[#38BDF8] to-[#F75C9D] text-transparent bg-clip-text animate-gradient-x">
              {t("analytics")}
            </span>{" "}
          </h2>
        </div>

        <div className="analytics-demo-container mb-8 md:mb-12">
          <div className="h-full overflow-y-auto py-4 !pt0 md:py-6 px-2 md:px-4">
            <DemoAnalyticsPage />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </section>
  );
}
