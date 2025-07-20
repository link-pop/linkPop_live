"use client";

import { useTranslation } from "@/components/Context/TranslationContext";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findOrCreateChatroom } from "@/lib/actions/findOrCreateChatroom";
import { useState } from "react";
import UserCardHeader from "./UserCardHeader";

export default function UserCard({
  user,
  mongoUser,
  showActions = false,
  showSubscriptionStatus = false,
  additionalInfo = {},
  className = "",
  onClick,
  ...props
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const userProfileUrl = `/${user.username || user._id}`;
  const displayName =
    user.displayName || user.name || user.username || t("unknownUser");
  const username =
    user.username ||
    (user.name ? user.name.toLowerCase().replace(/\s+/g, "") : "");

  const handleMessageClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!mongoUser || !user._id || isLoading) return;

    // Don't allow messaging yourself
    if (mongoUser._id === user._id) return;

    setIsLoading(true);

    try {
      const chatroomId = await findOrCreateChatroom(user._id);
      router.push(`/chatrooms/${chatroomId}`);
    } catch (error) {
      console.error("❌ Error navigating to chatroom:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`!w275 wf bg-background border border-border rounded-lg overflow-hidden hover:border-accent transition-colors ${className}`}
      onClick={onClick}
      {...props}
    >
      {/* Banner and Profile Image Header */}
      <UserCardHeader user={user} showActions={showActions} />

      {/* User Info Section - Adjusted for overlaid profile image */}
      <div className="pt-12 px-4 pb-4">
        <Link href={userProfileUrl} className="block mb-3">
          <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
            {displayName}
          </h3>
          {username && (
            <p className="text-sm text-muted-foreground">@{username}</p>
          )}
        </Link>

        {showActions && (
          <div className="mt-3">
            <button
              onClick={handleMessageClick}
              disabled={isLoading || mongoUser?._id === user._id}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle size={16} />
              <span>
                {isLoading
                  ? t("loading") || "Loading..."
                  : t("message") || "Message"}
              </span>
            </button>
          </div>
        )}

        {/* Subscription Information */}
        {additionalInfo && Object.keys(additionalInfo).length > 0 && (
          <div className="border-t border-border pt-3 mt-3">
            {additionalInfo.subscribedAt && (
              <div className="text-xs text-muted-foreground mb-1">
                {t("subscribedOn") || "Subscribed on"}{" "}
                {new Date(additionalInfo.subscribedAt).toLocaleDateString()}
              </div>
            )}

            {additionalInfo.isPaid && additionalInfo.price && (
              <div className="text-xs text-muted-foreground mb-1">
                ${additionalInfo.price}
                {additionalInfo.expiresAt &&
                  ` • ${t("expires") || "Expires"} ${new Date(
                    additionalInfo.expiresAt
                  ).toLocaleDateString()}`}
              </div>
            )}

            {showSubscriptionStatus && (
              <div className="text-xs text-muted-foreground">
                {additionalInfo.isPaid
                  ? t("paidSubscription") || "Paid subscription"
                  : t("freeSubscription") || "Free subscription"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
