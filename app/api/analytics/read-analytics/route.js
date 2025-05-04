import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/db/connectToDb";
import models from "@/lib/db/models/models";

// /api/analytics/read-analytics route
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    await connectToDb();

    const totalViews = await models.analytics.countDocuments({ path });

    // ! get today views
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayViews = await models.analytics.countDocuments({
      path,
      createdAt: { $gte: today },
    });
    // ? get today views

    return NextResponse.json({ totalViews, todayViews });
  } catch (error) {
    console.error("Error getting page views:", error);
    return NextResponse.json(
      { error: "Failed to get page views" },
      { status: 500 }
    );
  }
}
