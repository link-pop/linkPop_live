"use client";

import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";
import { toggleShowActivityStatus } from "@/lib/actions/toggleShowActivityStatus";

export default function ShowActivityStatus({ mongoUser }) {
  const isEnabled = mongoUser?.showActivityStatus !== false;

  return (
    <div>
      <UserSettingsToggle
        {...{
          mongoUser,
          propertyName: "showActivityStatus",
          translationKey: "showActivityStatus",
          toggleAction: toggleShowActivityStatus,
          // {...{ children }}
        }}
      />
    </div>
  );
}
