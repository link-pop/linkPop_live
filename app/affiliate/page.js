import { getUserReferralData } from "@/lib/actions/referral/getUserReferralData";
import AffiliateClient from "@/components/Affiliate/AffiliateClient";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export const metadata = {
  title: "Affiliate Program",
  description: "Earn 20% commission on all referred subscriptions",
};

export default async function AffiliatePage() {
  // Get current user data to check admin status
  const { mongoUser } = await getMongoUser();

  // Get user's referral data
  const referralData = await getUserReferralData();

  return (
    <div className="space-y-10">
      <AffiliateClient data={referralData} />
    </div>
  );
}
