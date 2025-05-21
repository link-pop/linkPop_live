import { redirect } from "next/navigation";
import getMongoUser from "@/lib/utils/mongo/getMongoUser";
import { update } from "@/lib/actions/crud";
import OnboardingStep1Client from "./OnboardingStep1Client";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";

export default async function OnboardingStep1() {
  const { mongoUser } = await getMongoUser();
  if (!mongoUser?._id) redirect("/");

  async function handleProfileType(profileType) {
    "use server";
    await update({
      col: "users",
      data: { _id: mongoUser._id },
      update: { profileType },
    });
    redirect(`${ONBOARDING_ROUTE}/2`);
  }

  return (
    <OnboardingStep1Client onSubmit={handleProfileType} mongoUser={mongoUser} />
  );
}
