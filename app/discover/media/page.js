import { getSerializedMongoUser } from "@/lib/utils/mongo/getMongoUser";
import AllCreatorsMedia from "@/components/Post/Post/Full/Custom/AllCreatorsMedia";

export default async function DiscoverMediaPage() {
  // Get current user data on server side
  const { mongoUser } = await getSerializedMongoUser();

  return <AllCreatorsMedia mongoUser={mongoUser} />;
}
