import { update } from "@/lib/actions/crud";

export default async function finishOnboarding(userId) {
  if (!userId) return;
  await update({
    col: "users",
    data: { _id: userId },
    update: { onboardingFinished: true },
    revalidate: "/",
  });
}
