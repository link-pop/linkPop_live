export const dynamic = "force-dynamic";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import AuctionPaymentClient from "@/components/ui/shared/AuctionPaymentClient/AuctionPaymentClient";

export default async function AuctionPaymentPage() {
  // Get mongo user on server side
  const { mongoUser } = await getMongoUser();

  return <AuctionPaymentClient mongoUser={mongoUser} />;
}
