"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleShowAvatar } from "@/lib/actions/toggleShowAvatar";

export default function ShowAvatar({ mongoUser }) {
  return (
    <UserSettingsToggle
      mongoUser={mongoUser}
      propertyName="showAvatar"
      translationKey="showAvatar"
      toggleAction={toggleShowAvatar}
      defaultValue={true}
    />
  );
}
