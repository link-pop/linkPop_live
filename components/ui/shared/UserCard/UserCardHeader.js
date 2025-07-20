"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import CreatedBy from "@/components/Post/Post/CreatedBy";

export default function UserCardHeader({
  user,
  showActions = false,
  className = "",
}) {
  const { t } = useTranslation();

  if (!user) return null;

  const userProfileUrl = `/${user.username || user._id}`;
  const displayName =
    user.displayName || user.name || user.username || t("unknownUser");

  return (
    <div className={`relative ${className}`}>
      {/* Banner Image - Full width at top */}
      <Link href={userProfileUrl} className="block">
        <div className="relative h-40 bg-accent overflow-hidden">
          {user.coverImage || user.bannerImage ? (
            <img
              src={user.coverImage || user.bannerImage}
              alt={`${displayName} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent to-muted">
              <span className="text-4xl font-bold text-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Available status badge */}
          {user.isAvailable !== false && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {t("availableNow") || "Available now"}
              </div>
            </div>
          )}

          {/* More options button - positioned to avoid conflicts */}
          {/* {showActions && (
            <div className="absolute top-3 right-3 z-10">
              <button className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )} */}
        </div>
      </Link>

      {/* Profile Image - Overlaid on banner */}
      <div className="absolute -bottom-8 left-4 z-10">
        <CreatedBy
          createdBy={user}
          showName={false}
          className="!p-0"
          imageClassName="!w-16 !h-16 !min-w-16 !min-h-16 border-4 border-background shadow-lg"
        />
      </div>
    </div>
  );
}
