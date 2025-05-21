"use client";
import { useState } from "react";
import { useContext as useAppContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function OnboardingStep1Client({ onSubmit, mongoUser }) {
  const [selected, setSelected] = useState(mongoUser?.profileType || null);
  const { mongoUserSet } = useAppContext();
  const { t } = useTranslation();

  const handleSelect = async (type) => {
    setSelected(type);
    mongoUserSet({ ...mongoUser, profileType: type });
    // Persist to DB and move to next step
    await onSubmit(type);
  };

  return (
    <form className="miwf fc g20 p20 bg-background text-foreground mx-auto mt-20 rounded-xl shadow dark:shadow-white/10">
      <h1 className="fz24 fw700 tac mb30">{t("chooseProfileType")}</h1>
      <div className="fc g10 maw270 wf mxa">
        <div
          className={`f aic g10 cursor-pointer br5 p10 transition-all duration-150 ${
            selected === "creator"
              ? "bg-accent text-foreground fw700 ring-2 ring-primary ring-offset-2 shadow-lg"
              : "bg-muted"
          }`}
          onClick={() => handleSelect("creator")}
        >
          <span
            className={`indicator flex items-center justify-center w20 h20 br50 border-2 border-primary mr10 transition-all duration-150 ${
              selected === "creator" ? "bg-white" : "bg-transparent"
            }`}
          >
            {selected === "creator" && (
              <span className="block w10 h10 br50 bg-primary transition-all duration-150" />
            )}
          </span>
          <span>{t("creator")}</span>
        </div>
        <div
          className={`f aic g10 cursor-pointer br5 p10 transition-all duration-150 ${
            selected === "fan"
              ? "bg-accent text-foreground fw700 ring-2 ring-primary ring-offset-2 shadow-lg"
              : "bg-muted"
          }`}
          onClick={() => handleSelect("fan")}
        >
          <span
            className={`indicator flex items-center justify-center w20 h20 br50 border-2 border-primary mr10 transition-all duration-150 ${
              selected === "fan" ? "bg-white" : "bg-transparent"
            }`}
          >
            {selected === "fan" && (
              <span className="block w10 h10 br50 bg-primary transition-all duration-150" />
            )}
          </span>
          <span>{t("fan")}</span>
        </div>
      </div>
    </form>
  );
}
