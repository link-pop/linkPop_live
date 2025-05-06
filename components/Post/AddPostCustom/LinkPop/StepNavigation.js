"use client";

import { Check } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function StepNavigation({
  currentStep,
  setStep,
  formData = {},
  stepsCount = 4,
}) {
  const { t } = useTranslation();

  // Define the steps
  const allSteps = [
    {
      title: t("pageInfo") || "Page Info",
      description: "",
    },
    {
      title: t("socialLinks") || "Social Links",
      description: "",
    },
    {
      title: t("customization") || "Customization",
      description: "",
    },
    {
      title: t("geoFilter") || "Geo Filter",
      description: "",
    },
  ];

  // Filter steps based on stepsCount
  const steps = allSteps.slice(0, stepsCount);

  // For directlinks with only 2 steps, rename the steps appropriately
  if (stepsCount === 2) {
    steps[0].title = t("directlinkInfo") || "Link Info";
    steps[1].title = t("geoFilter") || "Geo Filter";
  }

  // Function to check if we can go to a specific step
  const canGoToStep = (stepNumber) => {
    // Always allow going to step 1
    if (stepNumber === 1) return true;

    // For steps 2, 3, and 4, require landingPageId to exist
    if (stepNumber === 2 || stepNumber === 3 || stepNumber === 4) {
      return !!formData.landingPageId;
    }

    return false;
  };

  return (
    <div className="h55 fixed t15 md:ml30 cx oyh mx-auto br20 wfc fcc shadow-lg dark:shadow-[0_4px_24px_rgba(255,255,255,0.10)] z49 bg-background">
      <div className="f fwn oxa aistr g15 mb25 hf text-neutral-900 dark:text-white">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const canClick = canGoToStep(stepNumber);

          return (
            <div
              key={stepNumber}
              className={`h55 wsn max-[768px]:wf f fwn aic g10 p10 transition-colors duration-200
                ${index === 0 ? "rounded-l-[20px]" : ""}
                ${index === steps.length - 1 ? "rounded-r-[20px]" : ""}
                ${canClick ? " cp hover:bg-accent/50" : " opacity-70"}
                ${
                  isActive ? " bg-accent" : isCompleted ? " bg-accent/30" : ""
                }`}
              onClick={() => {
                // Only allow navigation if canClick is true
                if (canClick) {
                  setStep(stepNumber);
                }
              }}
            >
              <div
                className={`fcc miw30 mih30 br50 border transition-colors duration-200 ${
                  isCompleted
                    ? "bg-brand border-brand"
                    : isActive
                    ? "bg-accent border-brand"
                    : canClick && !isActive
                    ? "border-brand/50"
                    : "border-muted"
                }`}
              >
                {isCompleted ? (
                  <Check className="text-white w14 h14" />
                ) : (
                  <span
                    className={`fz14 fw600 ${
                      isActive ? "brand" : canClick ? "brand/70" : "text-muted"
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>
              <div className={`fc g3`}>
                <span
                  className={`fz14 fw600 ${
                    isActive
                      ? "brand"
                      : isCompleted
                      ? "text-foreground/80"
                      : canClick
                      ? "text-foreground/80"
                      : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="fz12 text-muted">{step.description}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
