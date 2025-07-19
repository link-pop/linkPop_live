export const dynamic = "force-dynamic";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import ContentDepotListContent from "./components/ContentDepotListContent";

export default async function ContentDepotListPage({ params }) {
  const { mongoUser } = await getMongoUser();
  const { userlistid } = params;

  if (!mongoUser) return null;

  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));

  return (
    <ContentDepotListContent mongoUser={plainMongoUser} userListId={userlistid} />
  );
}
