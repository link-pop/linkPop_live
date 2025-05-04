"use client";

import { Circle } from "lucide-react";
import { update } from "@/lib/actions/crud";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function AvailabilityPopup({ mongoUser, dialogSet }) {
  const { t } = useTranslation();

  const handleAvailabilityChange = async (isAvailable) => {
    try {
      await update({
        col: "users",
        data: { _id: mongoUser._id },
        update: { isAvailable },
        revalidate: "/my/settings/profile",
      });

      dialogSet({ isOpen: false });
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  return (
    <div className={`fc g10`}>
      {/* Available */}
      <div
        className={`f g10 aic cp p10 br5 hover:bg-accent `}
        onClick={() => handleAvailabilityChange(true)}
      >
        <Circle
          className={`${mongoUser.isAvailable ? "brand" : "gray"}`}
          size={20}
          fill={mongoUser.isAvailable ? "currentColor" : "none"}
        />
        <span>{t("available")}</span>
      </div>

      {/* Invisible */}
      <div
        className={`f g10 aic cp p10 br5 hover:bg-accent`}
        onClick={() => handleAvailabilityChange(false)}
      >
        <Circle
          className={`${!mongoUser.isAvailable ? "brand" : "gray"}`}
          size={20}
          fill={!mongoUser.isAvailable ? "currentColor" : "none"}
        />
        <span>{t("invisible")}</span>
      </div>
    </div>
  );
}
