import { getSerializedMongoUser } from "@/lib/utils/mongo/getMongoUser";
import SearchCreatorPage from "@/components/Search/SearchCreatorPage";

export default async function DiscoverSearchPage() {
  // Get current user data on server side
  const { mongoUser } = await getSerializedMongoUser();

  return <SearchCreatorPage mongoUser={mongoUser} />;
}
