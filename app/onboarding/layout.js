"use client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useEffect } from "react";
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
    if (pathname.endsWith("/5")) return 5;
    return 1;
  }, [pathname]);

  // Protect against accessing invalid steps
  useEffect(() => {
    if (mongoUser?.profileType) {
      const isFan = mongoUser.profileType === "fan";

      // Fan can only access steps 1, 2, 5
      if (isFan && (currentStep === 3 || currentStep === 4)) {
        router.replace(`${ONBOARDING_ROUTE}/2`);
        return;
      }

      // Creator can only access steps 1, 2, 4, 5
      if (!isFan && currentStep === 3) {
        router.replace(`${ONBOARDING_ROUTE}/2`);
        return;
      }
    }
  }, [currentStep, mongoUser?.profileType, router]);

  // Map physical step to logical step based on user type
  const getLogicalStep = (physicalStep) => {
    const isFan = mongoUser?.profileType === "fan";

    if (isFan) {
      // Fan flow: 1->1, 2->2, 5->3
      if (physicalStep === 1) return 1; // Profile Type
      if (physicalStep === 2) return 2; // Account Form
      if (physicalStep === 5) return 3; // Verification
      return physicalStep;
    } else {
      // Creator flow: 1->1, 2->2, 4->3, 5->4
      if (physicalStep === 1) return 1; // Profile Type
      if (physicalStep === 2) return 2; // Profile Form
      if (physicalStep === 4) return 3; // Subscription Form
      if (physicalStep === 5) return 4; // Verification
      return physicalStep;
    }
  };

  // Map logical step back to physical step for navigation
  const getPhysicalStep = (logicalStep) => {
    const isFan = mongoUser?.profileType === "fan";

    if (isFan) {
      // Fan flow: 1->1, 2->2, 3->5
      if (logicalStep === 1) return 1; // Profile Type
      if (logicalStep === 2) return 2; // Account Form
      if (logicalStep === 3) return 5; // Verification
      return logicalStep;
    } else {
      // Creator flow: 1->1, 2->2, 3->4, 4->5
      if (logicalStep === 1) return 1; // Profile Type
      if (logicalStep === 2) return 2; // Profile Form
      if (logicalStep === 3) return 4; // Subscription Form
      if (logicalStep === 4) return 5; // Verification
      return logicalStep;
    }
  };

  const logicalCurrentStep = getLogicalStep(currentStep);

  // Optionally, allow going back to previous steps:
  const handleStepChange = (logicalStep) => {
    const physicalStep = getPhysicalStep(logicalStep);
    router.push(`${ONBOARDING_ROUTE}/${physicalStep}`);
  };

  return (
    <div>
      <OnboardingStepNavigation
        currentStep={logicalCurrentStep}
        onStepChange={handleStepChange}
        mongoUser={mongoUser}
      />
      {children}
      <OnboardingDontShowAgain />
    </div>
  );
}
