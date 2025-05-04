import { fetchUserSubscription2 } from "@/lib/actions/fetchUserSubscription2";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import PricingSection from "./PricingSection";

// Server component to fetch data
export default async function PricingSectionWrapper() {
  const userSubscription = await fetchUserSubscription2();
  const { isAdmin } = await getMongoUser();

  return (
    <PricingSection userSubscription={userSubscription} isAdmin={isAdmin} />
  );
}
