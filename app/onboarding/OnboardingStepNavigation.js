"use client";
import { update } from "@/lib/actions/crud";
import { useTranslation } from "@/components/Context/TranslationContext";

const stepsCreator = [
  { title: "profileType" },
  { title: "profile" },
  { title: "account" },
  { title: "subscription" },
  { title: "verification" },
];
const stepsFan = [
  { title: "profileType" },
  { title: "account" },
  { title: "verification" },
];

export default function OnboardingStepNavigation({
  currentStep,
  onStepChange,
  mongoUser,
}) {
  const isFan = mongoUser?.profileType === "fan";
  const steps = isFan ? stepsFan : stepsCreator;
  const { t } = useTranslation();

  // Handle step change with DB update if needed
  const handleStepClick = async (stepNumber) => {
    // If moving from step 1 to 2, persist profileType to DB
    if (
      currentStep === 1 &&
      stepNumber === 2 &&
      mongoUser?._id &&
      mongoUser?.profileType
    ) {
      await update({
        col: "users",
        data: { _id: mongoUser._id },
        update: { profileType: mongoUser.profileType },
      });
    }
    if (onStepChange) onStepChange(stepNumber);
  };

  return (
    <div className="fixed -t7 cx h55 f jcc oyh mx-auto br20 wfc fcc shadow-lg z49 bg-background mt20 mb30">
      <div className="f fwn oxa aistr g15 mb25 hf text-neutral-900 dark:text-white">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const canClick = stepNumber !== currentStep; // Allow any step except current

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
                if (canClick) {
                  handleStepClick(stepNumber);
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
                  {stepNumber}
                </span>
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
                  {isFan && stepNumber === 2 ? t("preferences") : t(step.title)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
