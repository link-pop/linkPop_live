"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "@/components/Context/Context";
import { SITE1 } from "@/config/env";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";

export default function OnboardingRedirector() {
  const { mongoUser } = useContext();
  const router = useRouter();

  useEffect(() => {
    if (
      SITE1 &&
      mongoUser &&
      mongoUser._id &&
      mongoUser.onboardingFinished === false
    ) {
      router.push(`${ONBOARDING_ROUTE}/1`);
    }
  }, [mongoUser, router]);

  return null;
}
