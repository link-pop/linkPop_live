import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import BookmarksContent from "../components/BookmarksContent";

export const dynamic = "force-dynamic";

export default async function BookmarkListPage({ params }) {
  const { mongoUser } = await getMongoUser();
  const listId = params.listid;

  return <BookmarksContent mongoUser={mongoUser} bookmarkListId={listId} />;
}
