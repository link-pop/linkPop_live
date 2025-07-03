import { NextResponse } from "next/server";
import { getOne, update } from "@/lib/actions/crud";
import { headers } from "next/headers";
import { getSocialLinksCollectionName } from "@/lib/utils/linkProtection";
import { checkForThreats } from "@/lib/utils/shieldProtection/checkForThreats";
import { fetchGeoData } from "@/lib/utils/fetchGeoData";
import { SAFE_PAGE_ROUTE } from "@/lib/utils/constants";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("linkId");
    const key = searchParams.get("key");

    if (!linkId || !key) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Get the correct collection name
    const collectionName = getSocialLinksCollectionName();

    // Get the social link from database
    const socialLink = await getOne({
      col: collectionName,
      data: { _id: linkId },
    });

    if (!socialLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Verify the protection key
    if (!socialLink.isProtected || socialLink.protectionKey !== key) {
      return NextResponse.json({ error: "Invalid access" }, { status: 403 });
    }

    // Get the real URL
    let redirectUrl;
    if (socialLink.platform === "other" && socialLink.websiteUrl) {
      redirectUrl = socialLink.websiteUrl;
    } else if (socialLink.username) {
      // Import platform data dynamically to avoid server-side issues
      const { platformUrls } = await import("@/lib/data/platformData");
      const baseUrl = platformUrls[socialLink.platform] || "";
      if (!baseUrl) {
        return NextResponse.json(
          { error: "Invalid platform" },
          { status: 400 }
        );
      }

      const cleanUsername = socialLink.username.startsWith("@")
        ? socialLink.username.substring(1)
        : socialLink.username;
      redirectUrl = baseUrl + cleanUsername;
    } else {
      return NextResponse.json({ error: "Invalid link data" }, { status: 400 });
    }

    // Increment click count
    await update({
      col: collectionName,
      data: { _id: linkId },
      update: { clickCount: (socialLink.clickCount || 0) + 1 },
      skipOwnershipCheck: true,
    });

    // Get headers for threat detection
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || "";
    const referrer = headersList.get("referer") || "";

    // Get comprehensive geo data
    const geoData = await fetchGeoData();

    // Prepare threat detection data
    const threatData = {
      proxy: geoData?.proxy || false,
      hosting: geoData?.hosting || false,
      // Additional data from geo service
      isp: geoData?.isp || null,
      org: geoData?.org || null,
      mobile: geoData?.mobile || false,
    };

    // Check for threats using the comprehensive utility
    const isThreat = checkForThreats(userAgent, threatData, referrer);

    if (isThreat) {
      // Log suspicious access attempt
      console.warn("❌ Suspicious access attempt:", {
        linkId,
        userAgent,
        geoData: {
          country: geoData?.country_code,
          city: geoData?.city,
          isp: geoData?.isp,
          org: geoData?.org,
          proxy: geoData?.proxy,
          hosting: geoData?.hosting,
        },
      });

      // Redirect threats to a safe page instead of the real URL
      return NextResponse.redirect(new URL(SAFE_PAGE_ROUTE, request.url));
    }

    // Redirect to the real URL
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("❌ Protected link redirect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
