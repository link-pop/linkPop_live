import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import VaultContent from "./components/VaultContent";

export default async function VaultPage() {
  const { mongoUser } = await getMongoUser();

  if (!mongoUser) return null;

  return <VaultContent mongoUser={mongoUser} />;
}
