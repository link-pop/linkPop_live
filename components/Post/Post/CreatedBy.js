"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useChat } from "@/components/Context/ChatContext";
import OnlineBadge from "@/components/ui/shared/OnlineBadge/OnlineBadge";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function CreatedBy({
  createdBy,
  showName = true,
  wrapClassName = "",
  className = "",
  nameClassName = "",
  bottom,
  bottomClassName = "",
  icon,
}) {
  // Default values
  const defaultName = "Anonymous User";
  const defaultAvatar = null;
  const [imgError, setImgError] = useState(false);
  const { isUserOnline } = useChat();

  // Check if we have valid createdBy data
  const name = createdBy?.name || defaultName;
  const avatar = createdBy?.profileImage || createdBy?.avatar || defaultAvatar;
  const userId = createdBy?._id;

  // Check if user is online
  const isOnline = userId ? isUserOnline(userId) : false;

  // Get initials from name
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleImageError = () => {
    setImgError(true);
  };

  const hasProfile = !!userId;

  return (
    // ! ENABLE_USER_PROFILE
    // ??? was createdBy?._id
    <Link
      className={`${wrapClassName}`}
      href={`${hasProfile ? `/${createdBy?.name}` : ""}`}
    >
      <div
        className={`f aic g10 ${className} ${
          hasProfile ? `cp` : `cursor-auto`
        }`}
        title={name}
      >
        <div className="!asfs mba por">
          {avatar && !imgError ? (
            <Image
              src={avatar}
              alt={name}
              width={200}
              height={200}
              className="br50 !miw40 !mih40 !w40 !h40 grow-0 cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-10 h-10 br50 bg-gray-200 f aic jcc text-gray-600 font-semibold">
              {initials}
            </div>
          )}
          {isOnline && <OnlineBadge className="w-3 h-3 b0 r0" />}
          {/* // TODO sep new file */}
          {icon && (
            <div className="fcc bg_brand br50 poa !w20 !h20 p2 b0 l0">
              <span className={`${BRAND_INVERT_CLASS}`}>{icon}</span>
            </div>
          )}
        </div>
        <div className="fc">
          {showName && (
            <div
              className={`${
                hasProfile ? "hover:underline" : ""
              } ${nameClassName}`}
            >
              {name}
            </div>
          )}
          {bottom && <div className={`${bottomClassName}`}>{bottom}</div>}
        </div>
      </div>
    </Link>
  );
}
