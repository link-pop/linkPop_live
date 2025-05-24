import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import OnboardingStep5Client from "./OnboardingStep5Client";

export default async function OnboardingStep5() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?._id) return <></>;
  return <OnboardingStep5Client mongoUser={mongoUser} />;
}
