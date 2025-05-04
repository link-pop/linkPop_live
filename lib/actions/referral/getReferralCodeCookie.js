"use server";

import { cookies } from "next/headers";

/**
 * Get the referral code from cookies
 *
 * @returns {string|undefined} The referral code if found, undefined otherwise
 */
export async function getReferralCodeCookie() {
  try {
    const cookieStore = cookies();
    return cookieStore.get("referralCode")?.value;
  } catch (error) {
    console.error("Failed to get referral code cookie:", error);
    return undefined;
  }
}
