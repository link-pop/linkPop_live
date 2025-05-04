"use client";

import { toggleWelcomeMessageSend } from "@/lib/actions/toggleWelcomeMessageSend";
import UserSettingsToggle from "@/components/ui/shared/Toggle/UserSettingsToggle";

export default function WelcomeMessageToggle({ mongoUser, children }) {
  return (
    <UserSettingsToggle
      mongoUser={mongoUser}
      propertyName="welcomeMessageSend"
      translationKey="welcomeMessageEnabled"
      toggleAction={toggleWelcomeMessageSend}
      {...{ children }}
    />
  );
}
