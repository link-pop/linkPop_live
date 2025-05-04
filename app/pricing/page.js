import { Suspense } from "react";
import Pricing2Content from "./Pricing2Content";
import { fetchUserSubscription2 } from "../../lib/actions/fetchUserSubscription2";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";

export default async function PricingPage() {
  const userSubscription = await fetchUserSubscription2();
  const { isAdmin } = await getMongoUser();

  return (
    <Suspense fallback={""}>
      <Pricing2Content userSubscription={userSubscription} isAdmin={isAdmin} />
    </Suspense>
  );
}
