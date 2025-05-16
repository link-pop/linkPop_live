import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const { mongoUser } = await getMongoUser();

  return <AccountForm mongoUser={mongoUser} />;
}
