"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import LeftNavNewPostBtn from "@/components/Nav/LeftNav/LeftNavNewPostBtn";
import LeftNavNewLandingPageBtn from "@/components/Nav/LeftNav/LeftNavNewLandingPageBtn";
import { PRICING_ROUTE } from "@/lib/utils/constants";
import Link from "next/link";

export default function CtaSection({ mongoUser }) {
  const { t } = useTranslation();

  return (
    <section className="bg-background text-foreground border border-border py-12 md:py-16 lg:py-24 rounded-bl-[20px] rounded-br-[20px]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
          {t("transformYourSocialPresence")}
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto">
          {t("unlockPowerfulTools")}
        </p>
        <LeftNavNewPostBtn
          isMobile={false}
          showLabels={true}
          isExpanded={true}
          className="por mxa wfc"
        />
        <LeftNavNewLandingPageBtn
          isMobile={false}
          showLabels={true}
          isExpanded={true}
          className="por mt15 mxa wfc"
        />
        <p className="mt-4 text-xs md:text-sm opacity-80">
          <Link href={PRICING_ROUTE} className="underline hover:brand">
            {t("startFourteenDayFreeTrial")}
          </Link>
        </p>
        <p className="mt-2 md:mt-4 text-xs md:text-sm opacity-80">
          {t("noCardRequired")}
        </p>
      </div>
    </section>
  );
}
