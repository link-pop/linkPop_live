import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import SubscriptionForm from "./SubscriptionForm";

export default async function subscriptionpage() {
  const { mongoUser } = await getMongoUser();

  // TODO !!!!!! check if sub expired (time passed)
  return (
    <>
      <SubscriptionForm mongoUser={mongoUser} />
    </>
  );
}
