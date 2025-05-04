"use server";

import { cookies } from "next/headers";

/**
 * Set a referral code cookie
 *
 * @param {string} referralCode - The referral code to store
 */
export async function setReferralCodeCookie(referralCode) {
  if (!referralCode) return;

  try {
    cookies().set("referralCode", referralCode, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error) {
    console.error("Failed to set referral code cookie:", error);
  }
}

/**
 * Delete the referral code cookie
 */
export async function deleteReferralCodeCookie() {
  try {
    cookies().set("referralCode", "", {
      maxAge: 0,
      path: "/",
    });
  } catch (error) {
    console.error("Failed to delete referral code cookie:", error);
  }
}
