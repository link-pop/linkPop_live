"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setReferralCodeCookie } from "@/lib/actions/referral/setReferralCodeCookie";

/**
 * A utility component that detects referral codes in URL parameters
 * and saves them to cookies for server-side access
 */
export default function ReferralCodeDetector() {
  const searchParams = useSearchParams();
  const referralCode = searchParams?.get("ref");

  useEffect(() => {
    // Save referral code to cookie if present in URL
    if (referralCode) {
      setReferralCodeCookie(referralCode);
    }
  }, [referralCode]);

  // This component doesn't render anything
  return null;
}
