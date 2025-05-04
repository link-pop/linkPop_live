"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import Link from "next/link";

// ! code start PrivacyNotice
export default function PrivacyNotice() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{t("privacyNotice")}</h1>

      <div className="space-y-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">{t("privacyIntro")}</h2>
          <p className="mb-4">{t("privacyIntroText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            {t("privacyCollection")}
          </h2>
          <p className="mb-4">{t("privacyCollectionText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("privacyUse")}</h2>
          <p className="mb-4">{t("privacyUseText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("privacySharing")}</h2>
          <p className="mb-4">{t("privacySharingText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("privacyRights")}</h2>
          <p className="mb-4">{t("privacyRightsText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{t("privacyUpdates")}</h2>
          <p className="mb-4">{t("privacyUpdatesText")}</p>
        </section>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-primary hover:underline">
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
// ? code end PrivacyNotice
