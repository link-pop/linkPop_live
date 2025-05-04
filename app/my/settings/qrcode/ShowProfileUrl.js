"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleShowProfileUrl } from "@/lib/actions/toggleShowProfileUrl";

export default function ShowProfileUrl({ mongoUser }) {
  return (
    <UserSettingsToggle
      mongoUser={mongoUser}
      propertyName="showProfileUrl"
      translationKey="showProfileUrl"
      toggleAction={toggleShowProfileUrl}
      defaultValue={true}
    />
  );
}
