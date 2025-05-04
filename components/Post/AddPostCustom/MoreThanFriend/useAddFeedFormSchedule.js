"use client";

import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import { CalendarCheck, X } from "lucide-react";
import { SmartDatetimeInput } from "@/components/ui/shared/SmartDatetimeInput/SmartDatetimeInput";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

export default function useAddFeedFormSchedule({ scheduleAtSet, scheduleAt }) {
  const { dialogSet } = useContext();
  const { t, currentLang } = useTranslation();

  function ScheduleFormLabel() {
    if (!scheduleAt) return null;

    return (
      <div className={`wf f aic g5 mb10`}>
        <div className={`mx15 wf f aic g5 p5 pr10 pl10 bg-accent br5`}>
          <CalendarCheck size={16} className={`brand`} />
          <span>{t("schedule")}</span>
          <span className={`mla fz16`}>
            {new Date(scheduleAt).toLocaleString(currentLang || "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: currentLang === "en" ? true : false,
            })}
          </span>
          <X
            size={16}
            className={`brand cp hs`}
            onClick={() => scheduleAtSet(null)}
          />
        </div>
      </div>
    );
  }

  function ScheduleButton() {
    const showScheduleDialog = () => {
      dialogSet({
        showCancelBtn: true,
        cancelBtnText: t("close"),
        isOpen: true,
        title: t("schedulePost"),
        contentClassName: "!w400",
        hasCloseIcon: false,
        comp: (
          <div className={`f fc g10`}>
            <SmartDatetimeInput
              minDate={new Date()}
              value={scheduleAt}
              onValueChange={(date) => {
                scheduleAtSet(date);
                dialogSet({ isOpen: false });
              }}
              placeholder={t("selectWhenToPublish")}
            />
          </div>
        ),
      });
    };

    return (
      <IconButton
        icon={CalendarCheck}
        onClick={showScheduleDialog}
        disabled={scheduleAt}
        title={t("schedulePost")}
      />
    );
  }

  return { ScheduleButton, ScheduleFormLabel };
}
