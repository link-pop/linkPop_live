"use client";

import { Check } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function StoreItemStepNavigation({
  currentStep,
  setStep,
  isStripeConnectReady = false,
  hasShippingAddress = false,
}) {
  const { t } = useTranslation();

  // Define the steps for store item creation
  const steps = [
    {
      title: t("stripeConnect") || "Stripe Connect",
    },
    {
      title: t("shippingAddress") || "Shipping Address",
    },
    {
      title: t("addStoreItem") || "Add Store Item",
    },
  ];

  // Function to check if we can go to a specific step
  const canGoToStep = (stepNumber) => {
    // Always allow going to step 1
    if (stepNumber === 1) return true;

    // Step 2 requires Stripe Connect to be ready (includes dev bypass)
    if (stepNumber === 2) {
      return isStripeConnectReady;
    }

    // Step 3 requires both Stripe Connect and shipping address (dev bypass applies to Stripe Connect)
    if (stepNumber === 3) {
      return isStripeConnectReady && hasShippingAddress;
    }

    return false;
  };

  return (
    <div className="h55 fixed t85 cx oyh mx-auto br20 wfc fcc shadow-lg dark:shadow-[0_4px_24px_rgba(255,255,255,0.10)] z49 bg-background mb30">
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
                      isActive ? "brand" : canClick ? "brand/70" : "opacity-50"
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
                      : "opacity-50"
                  }`}
                >
                  {step.title}
                </span>
                {step.description && (
                  <span className="fz12 opacity-50">{step.description}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
