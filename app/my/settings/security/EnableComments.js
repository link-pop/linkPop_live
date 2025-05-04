"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleEnableComments } from "@/lib/actions/toggleEnableComments";

export default function EnableComments({ mongoUser }) {
  const isEnabled = mongoUser?.enableComments !== false;

  return (
    <div>
      <UserSettingsToggle
        mongoUser={mongoUser}
        propertyName="enableComments"
        translationKey="enableComments"
        toggleAction={toggleEnableComments}
        // {...{ children }}
      />
    </div>
  );
}
