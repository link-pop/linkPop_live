"use client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import OnboardingStepNavigation from "./OnboardingStepNavigation";
import { useContext as useAppContext } from "@/components/Context/Context";
import OnboardingDontShowAgain from "@/components/ui/shared/OnboardingDontShowAgain";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";

export default function OnboardingLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { mongoUser } = useAppContext();
  const currentStep = useMemo(() => {
    if (pathname.endsWith("/1")) return 1;
    if (pathname.endsWith("/2")) return 2;
    if (pathname.endsWith("/3")) return 3;
    if (pathname.endsWith("/4")) return 4;
    return 1;
  }, [pathname]);

  // Optionally, allow going back to previous steps:
  const handleStepChange = (step) => {
    router.push(`${ONBOARDING_ROUTE}/${step}`);
  };

  return (
    <div>
      <OnboardingStepNavigation
        currentStep={currentStep}
        onStepChange={handleStepChange}
        mongoUser={mongoUser}
      />
      {children}
      <OnboardingDontShowAgain />
    </div>
  );
}
