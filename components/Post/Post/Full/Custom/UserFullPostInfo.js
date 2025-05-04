"use client";

import { Verified, MapPin } from "lucide-react";
import UserFullPostInfoAvailable from "./UserFullPostInfoAvailable";
import UserFullPostInfoBio from "./UserFullPostInfoBio";

export default function UserFullPostInfo({ mongoUser, visitedMongoUser }) {
  if (!visitedMongoUser) return null;
  const location =
    visitedMongoUser?.location || visitedMongoUser?.country || "";

  return (
    <div className={`px10 fc g10 wf maw600`}>
      {/* Name and Verified */}
      <div className={`f g5 aic`}>
        <span className={`fz24 fw600`}>
          {visitedMongoUser.displayName || visitedMongoUser.name}
        </span>
        <Verified className={`brand`} size={20} />
      </div>

      {/* Username */}
      <div className={`f g5 aic gray`}>
        <span>@{visitedMongoUser.name}</span>
        <UserFullPostInfoAvailable {...{ mongoUser, visitedMongoUser }} />
      </div>

      {/* Location */}
      {location && (
        <div className={`f g5 aic gray`}>
          <MapPin size={16} />
          <span className={`fz14`}>{location}</span>
        </div>
      )}

      {/* Bio */}
      <UserFullPostInfoBio mongoUser={visitedMongoUser} />
    </div>
  );
}
