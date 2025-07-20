import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import UserListsContent from "../components/UserListsContent";

export default async function UserListPage({ params }) {
  const { mongoUser } = await getMongoUser();
  const { listid } = params;

  if (!mongoUser) return null;

  const plainMongoUser = JSON.parse(JSON.stringify(mongoUser));

  return <UserListsContent mongoUser={plainMongoUser} userListId={listid} />;
}
