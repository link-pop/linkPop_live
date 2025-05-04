import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import SubscriptionPriceInput from "./SubscriptionPriceInput";

export default async function subscriptionpage() {
  const { mongoUser } = await getMongoUser();

  // TODO !!!!!! check if sub expired (time passed)
  return (
    <>
      <SubscriptionPriceInput {...{ mongoUser }} />
    </>
  );
}
