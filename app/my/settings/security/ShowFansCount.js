"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleShowFansCount } from "@/lib/actions/toggleShowFansCount";

export default function ShowFansCount({ mongoUser }) {
  const isEnabled = mongoUser?.showFansCount !== false;

  return (
    <div>
      <UserSettingsToggle
        mongoUser={mongoUser}
        propertyName="showFansCount"
        translationKey="showFansCount"
        toggleAction={toggleShowFansCount}
        // {...{ children }}
      />
    </div>
  );
}
