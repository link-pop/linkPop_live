import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import QueueContent from "./components/QueueContent";

export default async function QueuePage() {
  const { mongoUser } = await getMongoUser();

  if (!mongoUser) return null;

  return <QueueContent mongoUser={mongoUser} />;
}
