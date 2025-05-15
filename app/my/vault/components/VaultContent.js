"use client";

import UserFullPostUserMedia from "@/components/Post/Post/Full/Custom/UserFullPostUserMedia";

export default function VaultContent({ mongoUser }) {
  if (!mongoUser) return null;

  // In the vault page, the user is always the owner
  // Also check if mongoUser has isOwner property
  const isOwner = mongoUser.isOwner !== undefined ? mongoUser.isOwner : true;

  return (
    <UserFullPostUserMedia
      post={null}
      isAdmin={mongoUser.isAdmin || false}
      mongoUser={mongoUser}
      visitedMongoUser={mongoUser} // In vault, we're viewing our own content
      isOwner={isOwner}
    />
  );
}
