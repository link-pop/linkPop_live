import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import WelcomeMessage from "./WelcomeMessage";

export default async function messagingpage() {
  const { mongoUser } = await getMongoUser();

  return <WelcomeMessage mongoUser={mongoUser} />;
}
