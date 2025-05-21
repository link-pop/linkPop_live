"use client";
import { useContext as useAppContext } from "@/components/Context/Context";
import { update } from "@/lib/actions/crud";
import { MAIN_ROUTE } from "@/lib/utils/constants";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function OnboardingDontShowAgain() {
  const { mongoUser, dialogSet } = useAppContext();
  const router = useRouter();
  const { t } = useTranslation();

  const handleDontShowAgain = () => {
    dialogSet({
      isOpen: true,
      title: t("onboardingDontShowAgainTitle"),
      text: t("onboardingDontShowAgainText"),
      action: async () => {
        if (!mongoUser?._id) return;
        await update({
          col: "users",
          data: { _id: mongoUser._id },
          update: { onboardingFinished: true },
        });
        router.push(MAIN_ROUTE);
      },
      confirmBtnText: t("onboardingDontShowAgainConfirm"),
      showCancelBtn: true,
      isDanger: false,
    });
  };

  return (
    <div className="fc wf mt30 mb10">
      <div className="text-center text-foreground fz12 fw500 mb5">
        {t("onboardingFillAllFields")}
      </div>
      <div className="text-center text-foreground fz12 fw400 mb5">
        {t("or")}
      </div>
      <div
        className="underline text-center text-foreground cp fcc fz12 fw500"
        onClick={handleDontShowAgain}
      >
        {t("onboardingDontShowAgainLink")}
      </div>
    </div>
  );
}
