"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MAIN_ROUTE } from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";

const SubscriptionForm = dynamic(
  () => import("@/app/my/settings/subscription/SubscriptionForm"),
  { ssr: false }
);

export default function OnboardingStep4Client({ mongoUser }) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSuccess = async () => {
    const finishOnboarding = (await import("@/lib/actions/finishOnboarding"))
      .default;
    await finishOnboarding(mongoUser._id);
    router.push(MAIN_ROUTE);
  };

  return (
    <div className="fc g30 p15 wf maw600 mx-auto mt-20 bg-background text-foreground rounded-xl shadow items-center justify-center dark:shadow-white/10">
      <h1 className="fz24 fw700 tac">{t("setYourSubscriptionPrice")}</h1>
      <SubscriptionForm mongoUser={mongoUser} onSuccess={handleSuccess} />
    </div>
  );
}
