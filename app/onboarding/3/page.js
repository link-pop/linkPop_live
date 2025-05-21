import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import OnboardingStep3Client from "./OnboardingStep3Client";

export default async function OnboardingStep3() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?._id) return <></>;
  return <OnboardingStep3Client mongoUser={mongoUser} />;
}
