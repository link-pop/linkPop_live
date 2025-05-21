import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import OnboardingStep2Client from "./OnboardingStep2Client";

export default async function OnboardingStep2() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?._id) return <></>;
  return <OnboardingStep2Client mongoUser={mongoUser} />;
}
