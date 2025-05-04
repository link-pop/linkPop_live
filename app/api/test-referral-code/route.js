import { NextResponse } from "next/server";
import { generateUserReferralCode } from "@/lib/actions/referral/generateUserReferralCode";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { connectToDb } from "@/lib/db/connectToDb";
import { models } from "@/lib/db/models/models";

export async function GET() {
  try {
    // First test MongoDB connection
    await connectToDb();

    // Get the current user
    const { mongoUser } = await getMongoUser();
    if (!mongoUser) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if user already has a referral code
    const hasCode = !!mongoUser.referralCode;

    // Call the function
    const result = await generateUserReferralCode();

    // Verify the result by fetching the user again
    const updatedUser = await models.users.findById(mongoUser._id);

    return NextResponse.json({
      result,
      verificationCheck: {
        initialUserHadCode: hasCode,
        currentUserHasCode: !!updatedUser?.referralCode,
        codeMatches: result.referralCode === updatedUser?.referralCode,
        updatedUserCode: updatedUser?.referralCode || null,
      },
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
