"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleShowMediaCount } from "@/lib/actions/toggleShowMediaCount";

export default function ShowMediaCount({ mongoUser }) {
  const isEnabled = mongoUser?.showMediaCount !== false;

  return (
    <div>
      <UserSettingsToggle
        mongoUser={mongoUser}
        propertyName="showMediaCount"
        translationKey="showMediaCount"
        toggleAction={toggleShowMediaCount}
        // {...{ children }}
      />
    </div>
  );
}
