"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MAIN_ROUTE, ONBOARDING_ROUTE } from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";

const ProfileForm = dynamic(
  () => import("@/app/my/settings/profile/ProfileForm"),
  { ssr: false }
);
const AccountForm = dynamic(
  () => import("@/app/my/settings/account/AccountForm"),
  { ssr: false }
);

export default function OnboardingStep2Client({ mongoUser }) {
  const router = useRouter();
  const { t } = useTranslation();
  const isCreator = mongoUser.profileType === "creator";
  const isFan = mongoUser.profileType === "fan";

  const handleSuccess = async () => {
    if (isFan) {
      const finishOnboarding = (await import("@/lib/actions/finishOnboarding"))
        .default;
      await finishOnboarding(mongoUser._id);
      router.push(MAIN_ROUTE);
    } else {
      router.replace(`${ONBOARDING_ROUTE}/3`);
    }
  };

  return (
    <div className="fc g30 p15 wf maw600 mx-auto mt-20 bg-background text-foreground rounded-xl shadow dark:shadow-white/10">
      <h1 className="fz24 fw700 tac">
        {isFan
          ? t("yourPreferences")
          : isCreator
          ? t("completeYourProfile")
          : t("accountDetails")}
      </h1>
      {isCreator ? (
        <ProfileForm mongoUser={mongoUser} onSuccess={handleSuccess} />
      ) : (
        <AccountForm mongoUser={mongoUser} onSuccess={handleSuccess} />
      )}
    </div>
  );
}
