import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import OnboardingStep4Client from "./OnboardingStep4Client";

export default async function OnboardingStep4() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?._id) return <></>;
  return <OnboardingStep4Client mongoUser={mongoUser} />;
}
