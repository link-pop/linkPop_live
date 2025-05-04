import { SETTINGS_ROUTE } from "@/lib/utils/constants";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Pencil } from "lucide-react";
import RoundIconButton from "@/components/ui/shared/RoundIconButton/RoundIconButton";

export default function UserFullPostEditProfileButton({ mongoUser }) {
  const { t } = useTranslation();

  return (
    // Show Edit Profile button only if viewing own profile
    mongoUser?.isOwner && (
      <RoundIconButton
        href={`${SETTINGS_ROUTE}/profile`}
        className="mla"
        title={t("editProfile")}
      >
        <Pencil size={16} className="brand" />
      </RoundIconButton>
    )
  );
}
