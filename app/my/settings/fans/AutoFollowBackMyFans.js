"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleAutoFollowBackMyFans } from "@/lib/actions/toggleAutoFollowBackMyFans";

export default function AutoFollowBackMyFans({ mongoUser }) {
  const isEnabled = mongoUser?.autoFollowBackMyFans !== false;

  return (
    <div>
      <UserSettingsToggle
        {...{
          mongoUser,
          propertyName: "autoFollowBackMyFans",
          translationKey: "autoFollowBackMyFans",
          toggleAction: toggleAutoFollowBackMyFans,
          // {...{ children }}
        }}
      />
    </div>
  );
}
