"use client";

import { useEffect, useState } from "react";
import QRCodeContainer from "./QRCodeContainer";
import ShowProfileUrl from "./ShowProfileUrl";
import ShowAvatar from "./ShowAvatar";

export default function QRCodePage({ mongoUser, initialProfileUrl }) {
  const [profileUrl, setProfileUrl] = useState(initialProfileUrl);
  const [fullAvatarUrl, setFullAvatarUrl] = useState(
    mongoUser.profileImage || mongoUser.avatar || ""
  );

  useEffect(() => {
    // Update the profile URL with the current origin
    const origin = window.location.origin;
    setProfileUrl(`${origin}/${mongoUser.name}`);

    // Make sure avatar URL is absolute
    const avatar = mongoUser.profileImage || mongoUser.avatar;
    if (avatar) {
      if (avatar.startsWith("http")) {
        setFullAvatarUrl(avatar);
      } else {
        setFullAvatarUrl(`${origin}${avatar}`);
      }
    }
  }, [mongoUser.name, mongoUser.avatar, mongoUser.profileImage]);

  return (
    <div className="w-full">
      {/* SETTINGS */}
      <div className="my15">
        <div className="mb-4">
          <QRCodeContainer
            {...{
              profileUrl,
              avatar: fullAvatarUrl,
              showProfileUrl: mongoUser?.showProfileUrl !== false,
              showAvatar: mongoUser?.showAvatar !== false,
              userName: mongoUser?.name || "user",
            }}
          />
        </div>

        <div className={`fc`}>
          <ShowProfileUrl mongoUser={mongoUser} />
          <ShowAvatar mongoUser={mongoUser} />
        </div>
      </div>
    </div>
  );
}
