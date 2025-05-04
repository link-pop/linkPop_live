"use client";

import { useContext } from "@/components/Context/Context";
import { useTranslation } from "@/components/Context/TranslationContext";
import AvailabilityPopup from "./AvailabilityPopup";

export default function UserFullPostInfoAvailable({
  mongoUser,
  visitedMongoUser,
}) {
  const { dialogSet } = useContext();
  const { t } = useTranslation();

  const showAvailabilityPopup = () => {
    // * Only show popup if user is viewing their own profile
    if (!mongoUser?.isOwner) return;

    dialogSet({
      isOpen: true,
      showBtns: false,
      contentClassName: "!w250",
      hasCloseIcon: true,
      comp: <AvailabilityPopup {...{ mongoUser, dialogSet }} />,
    });
  };

  // Check if the visited user has chosen to hide their activity status
  if (visitedMongoUser.showActivityStatus === false && !mongoUser?.isOwner) {
    return null;
  }

  return (
    <span
      className={`cp ${mongoUser?.isOwner ? "hover:underline" : ""}`}
      onClick={showAvailabilityPopup}
    >
      • {visitedMongoUser.isAvailable ? t("available") : t("invisible")}
    </span>
  );
}
