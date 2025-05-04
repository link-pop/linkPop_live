"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import Accordion from "@/components/ui/shared/Accordion/Accordion";

export default function FaqSection() {
  const { t } = useTranslation();

  // FAQ items with specific questions and answers
  const faqItems = [
    {
      trigger: t("howDoesLinkPopWork"),
      content: t("howDoesLinkPopWorkAnswer"),
    },
    {
      trigger: t("canIAddCustomDomain"),
      content: t("canIAddCustomDomainAnswer"),
    },
    {
      trigger: t("canIManageSeveralLinks"),
      content: t("canIManageSeveralLinksAnswer"),
    },
    {
      trigger: t("doLinksWorkOnOtherPlatforms"),
      content: t("doLinksWorkOnOtherPlatformsAnswer"),
    },
    {
      trigger: t("whatIsDifferenceBetweenLandingAndDirectLink"),
      content: t("whatIsDifferenceBetweenLandingAndDirectLinkAnswer"),
    },
    {
      trigger: t("whatKindOfBoostInConversionRate"),
      content: t("whatKindOfBoostInConversionRateAnswer"),
    },
  ];

  return (
    <section
      id="faq-section"
      className={`bg-background text-foreground border border-border py-12 md:py-16 lg:py-24 rounded-tl-[20px] rounded-tr-[20px]`}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-8 md:mb-12 lg:mb-16 text-foreground">
          {t("gotQuestions")}
        </h2>

        <div className="max-w-4xl mx-auto">
          <Accordion
            items={faqItems}
            className="bg-background text-foreground rounded-xl overflow-hidden shadow-lg border border-border"
          />
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          .accordion-trigger {
            text-align: center;
            justify-content: center;
          }
          .accordion-trigger svg {
            position: absolute;
            right: 16px;
          }
        }
      `}</style>
    </section>
  );
}
