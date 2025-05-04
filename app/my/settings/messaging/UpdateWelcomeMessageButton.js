"use client";

import Button from "@/components/ui/shared/Button/Button2";
import { useState } from "react";

export default function UpdateWelcomeMessageButton({ mongoUser }) {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className={`mt15 mr15`}
        onClick={() => setIsUpdating(true)}
      >
        Update
      </Button>

      {isUpdating && (
        <div className={`pof t0 l0 wf hf z50 bg-black/50 f aic jcc`}>
          <div className={`bg-background p20 rounded-lg maw600 wf`}>
            <div className={`wf`}>
              <WelcomeMessageFormWithUpdatingPost
                mongoUser={mongoUser}
                updatingPost={mongoUser.welcomeMessage}
                onCancel={() => setIsUpdating(false)}
                onSuccess={() => setIsUpdating(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Create a separate component to handle the AddWelcomeMessageForm with updatingPost
function WelcomeMessageFormWithUpdatingPost({
  mongoUser,
  updatingPost,
  onCancel,
  onSuccess,
}) {
  return (
    <div className={`por`}>
      <div
        className={`poa -r9 -t9 z10 bg-accent hover:bg-accent/80 cp w32 h32 rf fcc`}
        onClick={onCancel}
      >
        <X className="text-foreground" />
      </div>
      <div className={`h-auto max-h-[50dvh] oya shrink-0`}>
        <AddWelcomeMessageForm
          {...{
            mongoUser,
            updatingPost,
            onSuccess,
          }}
        />
      </div>
    </div>
  );
}

// Import at the top but also here to avoid circular dependency issues
import AddWelcomeMessageForm from "@/app/my/settings/messaging/AddWelcomeMessageForm";
import { X } from "lucide-react";
