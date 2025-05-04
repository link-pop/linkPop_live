import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/connectToDb";
import models from "@/lib/db/models/models";
import mongoose from "mongoose";

// /api/analytics/write-analytics route
export async function POST(request) {
  try {
    const {
      path,
      visitorId,
      userId,
      userAgent,
      referrer,
      searchParams,
      countryCode,
      platformType,
      browserType,
      systemType,
      postType,
      postId,
      email,
      screenResolution,
      language,
      deviceMemory,
      timeZone,
      hardwareConcurrency,
      colorScheme,
      reducedMotion,
      cookiesEnabled,
    } = await request.json();

    // Skip tracking for API routes and other excluded paths
    if (
      path.startsWith("/api/") ||
      path.startsWith("/_next/") ||
      path.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf)$/)
    ) {
      return NextResponse.json({ success: true, skipped: true });
    }

    await connectToDb();

    const analytic = await models.analytics.create({
      path,
      searchParams,
      visitorId,
      createdBy: new mongoose.Types.ObjectId(userId),
      userId, // needed for user to see his own posts
      userAgent,
      referrer: referrer || "direct",
      countryCode,
      platformType,
      browserType,
      systemType,
      postType,
      postId,
      email,
      screenResolution,
      language,
      deviceMemory,
      timeZone,
      hardwareConcurrency,
      colorScheme,
      reducedMotion,
      cookiesEnabled,
    });

    return NextResponse.json({ success: true, id: analytic._id });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
