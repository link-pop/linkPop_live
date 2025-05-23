"use client";

import Image from "next/image";

export default function ProfileImageWithStatus({
  profileImage,
  isAvailable,
  userName,
  size = 12,
  indicatorSize = 3,
}) {
  return (
    <div className="relative">
      <div
        className={`w-${size} h-${size} rounded-full overflow-hidden border-2 border-white`}
      >
        <Image
          src={profileImage || "/img/default-avatar.png"}
          alt={userName || "User"}
          width={size * 4}
          height={size * 4}
          className="object-cover"
        />
      </div>
      {isAvailable && (
        <div
          className={`absolute bottom-0 left-0 w-${indicatorSize} h-${indicatorSize} bg-green-500 rounded-full border-2 border-white`}
        />
      )}
    </div>
  );
}
