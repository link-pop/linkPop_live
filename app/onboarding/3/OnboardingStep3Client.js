"use client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ONBOARDING_ROUTE } from "@/lib/utils/constants";

const AccountForm = dynamic(
  () => import("@/app/my/settings/account/AccountForm"),
  { ssr: false }
);

export default function OnboardingStep3Client({ mongoUser }) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSuccess = () => {
    router.push(`${ONBOARDING_ROUTE}/4`);
  };

  return (
    <div className="fc g30 p15 wf maw600 mx-auto mt-20 bg-background text-foreground rounded-xl shadow dark:shadow-white/10">
      <h1 className="fz24 fw700 tac">{t("accountDetails")}</h1>
      <AccountForm mongoUser={mongoUser} onSuccess={handleSuccess} />
    </div>
  );
}
