"use client";

import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import Input from "@/components/ui/shared/Input/Input";
import { Clock, X } from "lucide-react";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

const EXPIRATION_PERIODS = (t) => [
  { label: t("noLimit"), value: null },
  { label: t("oneDay"), value: 1 },
  { label: t("threeDays"), value: 3 },
  { label: t("sevenDays"), value: 7 },
  { label: t("tenDays"), value: 10 },
  { label: t("thirtyDays"), value: 30 },
  { label: t("sixtyDays"), value: 60 },
  { label: t("ninetyDays"), value: 90 },
  { label: t("oneHundredTwentyDays"), value: 120 },
  { label: t("oneHundredEightyDays"), value: 180 },
];

export default function useAddFeedFormExpirationPeriod({
  expirationPeriodSet,
  expirationPeriod,
  price,
}) {
  const { dialogSet } = useContext();
  const { t } = useTranslation();

  function ExpirationPeriodFormLabel() {
    if (!expirationPeriod) return null;

    return (
      <div className={`wf f aic g5 mb10`}>
        <div className={`mx15 wf f aic g5 p5 pr10 pl10 bg-accent br5`}>
          <Clock size={16} className={`brand`} />
          <span>{t("expiration")}</span>
          <span className={`mla fz16`}>
            {t("expiresIn")} {expirationPeriod}{" "}
            {t(expirationPeriod === 1 ? "day" : "days")}
          </span>
          <X
            size={16}
            className={`brand cp hs`}
            onClick={() => expirationPeriodSet(null)}
          />
        </div>
      </div>
    );
  }

  function ExpirationPeriodButton() {
    const showExpirationDialog = () => {
      dialogSet({
        showCancelBtn: true,
        cancelBtnText: t("close"),
        isOpen: true,
        title: t("expirationPeriod"),
        contentClassName: "!w400",
        hasCloseIcon: false,
        comp: (
          <div className={`f fc g10`}>
            <Input
              max={999}
              min={1}
              type="number"
              placeholder={t("selectFromBelowOrEnterYourOwn")}
              className={`w-full p10 br5 b1_gray`}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  expirationPeriodSet(value);
                } else if (e.target.value === "") {
                  expirationPeriodSet(null);
                }
              }}
            />

            <div className={`fcc g5 fw px10`}>
              {EXPIRATION_PERIODS(t).map((period) => (
                <div
                  key={period.label}
                  onClick={() => {
                    expirationPeriodSet(period.value);
                    dialogSet({ isOpen: false });
                  }}
                  className={`p10 br5 bg-accent hover:brightness-[1.2] cp fz16`}
                >
                  {period.label}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    };

    return (
      <IconButton
        icon={Clock}
        onClick={showExpirationDialog}
        disabled={expirationPeriod || price > 0}
        title={price > 0 ? t("cannotSetExpirationWithPrice") : t("expirationPeriod")}
      />
    );
  }

  return { ExpirationPeriodButton, ExpirationPeriodFormLabel };
}
