"use client";

import { add, getAll } from "@/lib/actions/crud";
import { useEffect, useState } from "react";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { fetchGeoData } from "@/lib/utils/fetchGeoData";
import { getPlatformType, getPlatformEmoji } from "@/lib/utils/getPlatformInfo";
import { useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { deleteReferralCodeCookie } from "@/lib/actions/referral/setReferralCodeCookie";

export default function useRegisterOrReturnMongoUser() {
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useClerkUser();
  const [mongoUser, mongoUserSet] = useState(null);
  const searchParams = useSearchParams();

  // Check for referral code in URL params and cookies
  const referralCodeFromURL = searchParams?.get("ref");
  const referralCodeFromCookie = getCookie("referralCode");
  const referralCode = referralCodeFromURL || referralCodeFromCookie;

  useEffect(() => {
    if (!clerkUser?.id) return;
    if (!isClerkUserLoaded) return;

    async function registerMongoUser() {
      // ! ADVANCED USER DATA
      // Get user's IP and location info
      const geoData = await fetchGeoData();

      // ! Get platform type
      const platformType = getPlatformType();
      // ? Get platform type

      // * Get battery info if available
      let batteryData = {};
      if (typeof navigator !== "undefined" && "getBattery" in navigator) {
        const battery = await navigator.getBattery().catch(() => null);
        if (battery) {
          batteryData = {
            batteryLevel: battery.level,
            batteryCharging: battery.charging,
            batteryChargingTime: battery.chargingTime,
            batteryDischargingTime: battery.dischargingTime,
          };
        }
      }

      // * Get network info
      const connection =
        typeof navigator !== "undefined" &&
        "connection" in navigator &&
        navigator.connection;
      const networkData = connection
        ? {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
          }
        : {};

      // ? ADVANCED USER DATA

      const existingUser = await getAll({
        col: "users",
        data: { clerkId: clerkUser?.id },
      });

      if (existingUser.length === 0) {
        // Check if there's a valid referral code
        let referrerData = null;
        if (referralCode) {
          const referrer = await getAll({
            col: "users",
            data: { referralCode },
          });

          if (referrer && referrer.length > 0) {
            referrerData = {
              referredBy: referrer[0]._id,
              referralCodeUsed: referralCode,
            };
            console.log(
              "User referred by:",
              referrer[0].name,
              "with code:",
              referralCode
            );
          } else {
            console.log("Invalid referral code used:", referralCode);
            // Don't include referral data if code is invalid
          }
        }

        const basicMinimumRequiredUserFields = {
          // ! Required fields from schema
          name: clerkUser?.firstName || "",
          email: clerkUser?.emailAddresses?.[0]?.emailAddress || "",
          avatar: clerkUser?.imageUrl || "",
          clerkId: clerkUser?.id,
          plan: "",
          // Add referral data if present
          ...(referrerData || {}),
        };

        // ! ADVANCED USER DATA
        const advancedUserFields = {
          // ! Clerk User Info
          firstName: clerkUser?.firstName || "",
          lastName: clerkUser?.lastName || "",
          fullName: clerkUser?.fullName || "",
          primaryEmailAddress: clerkUser?.primaryEmailAddress?.toString() || "",
          primaryPhoneNumber: clerkUser?.primaryPhoneNumber?.toString() || "",
          primaryWeb3Wallet: clerkUser?.primaryWeb3Wallet?.toString() || "",
          imageUrl: clerkUser?.imageUrl || "",
          hasImage: Boolean(clerkUser?.hasImage),
          gender: clerkUser?.gender || "",
          birthday: clerkUser?.birthday || "",
          createdAt: clerkUser?.createdAt?.toISOString(),
          updatedAt: clerkUser?.updatedAt?.toISOString(),
          lastSignInAt: clerkUser?.lastSignInAt?.toISOString(),
          emailAddresses: clerkUser?.emailAddresses?.map((email) => ({
            emailAddress: email.emailAddress,
            verified: email.verification?.status === "verified",
          })),
          phoneNumbers: clerkUser?.phoneNumbers?.map((phone) => ({
            phoneNumber: phone.phoneNumber,
            verified: phone.verification?.status === "verified",
          })),
          externalAccounts: clerkUser?.externalAccounts?.map((account) => ({
            provider: account.provider,
            emailAddress: account.emailAddress,
            username: account.username,
          })),
          publicMetadata: clerkUser?.publicMetadata,
          unsafeMetadata: clerkUser?.unsafeMetadata,

          // ! Location Info
          ip: geoData.ip || "",
          city: geoData.city || "",
          region: geoData.region || "",
          country: geoData.country_name || "",
          countryCode: geoData.country_code || "",
          continent: geoData.continent_code || "",
          postal: geoData.postal || "",
          latitude: geoData.latitude || "",
          longitude: geoData.longitude || "",
          timezone: geoData.timezone || "",
          currency: geoData.currency || "",
          languages: geoData.languages || "",
          asn: geoData.asn || "",
          org: geoData.org || "",

          // ! Network Info
          ...networkData,

          // ! Battery Info
          ...batteryData,

          // ! Browser and System Info
          userAgent:
            typeof window !== "undefined" ? window.navigator.userAgent : "",
          platformType,
          platform:
            typeof window !== "undefined" ? window.navigator.platform : "",
          language:
            typeof window !== "undefined" ? window.navigator.language : "",
          languages:
            typeof window !== "undefined" ? window.navigator.languages : [],
          screenResolution:
            typeof window !== "undefined"
              ? `${window.screen.width}x${window.screen.height}`
              : "",
          colorDepth:
            typeof window !== "undefined" ? window.screen.colorDepth : "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: new Date().getTimezoneOffset(),
          cookiesEnabled:
            typeof window !== "undefined" ? window.navigator.cookieEnabled : "",
          doNotTrack:
            typeof window !== "undefined" ? window.navigator.doNotTrack : "",
          onLine: typeof window !== "undefined" ? window.navigator.onLine : "",
          vendor: typeof window !== "undefined" ? window.navigator.vendor : "",
          deviceMemory:
            typeof window !== "undefined" && "deviceMemory" in window.navigator
              ? window.navigator.deviceMemory
              : "",
          hardwareConcurrency:
            typeof window !== "undefined"
              ? window.navigator.hardwareConcurrency
              : "",
          maxTouchPoints:
            typeof window !== "undefined"
              ? window.navigator.maxTouchPoints
              : "",
          pdfViewerEnabled:
            typeof window !== "undefined"
              ? window.navigator.pdfViewerEnabled
              : "",
          devicePixelRatio:
            typeof window !== "undefined" ? window.devicePixelRatio : "",
          screenOrientation:
            typeof window !== "undefined" && window.screen.orientation
              ? window.screen.orientation.type
              : "",

          // ! User Preferences
          colorScheme:
            typeof window !== "undefined"
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
              : "",
          reducedMotion:
            typeof window !== "undefined"
              ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
              : false,
        };
        // ? ADVANCED USER DATA

        try {
          const newUser = await add({
            col: "users",
            data: {
              ...basicMinimumRequiredUserFields,
              ...advancedUserFields, // ! ENABLE_USER_PROFILE
            },
          });
          mongoUserSet(newUser);

          // If user was referred, create a referral record
          if (referrerData && referrerData.referredBy) {
            try {
              // Create referral record
              await add({
                col: "referrals",
                data: {
                  referrerId: referrerData.referredBy,
                  referredId: newUser._id,
                  referralCode: referralCode,
                  status: "pending",
                },
              });

              // Update referrer's stats
              await add({
                col: "users",
                data: { _id: referrerData.referredBy },
                update: {
                  $inc: { "referralStats.totalReferrals": 1 },
                },
              });

              console.log("Referral record created successfully");
            } catch (referralError) {
              console.error("Error creating referral record:", referralError);
            }

            // Clear the referral cookie after successful processing
            try {
              await deleteReferralCodeCookie();
            } catch (cookieError) {
              console.error("Error clearing referral cookie:", cookieError);
            }
          }
        } catch (error) {
          console.error("Error saving user:", error);
        }
      } else {
        // ! user found => return user
        mongoUserSet(existingUser[0]);
      }
    }

    registerMongoUser();
  }, [clerkUser?.id, referralCode]);

  return { mongoUser, mongoUserSet };
}
