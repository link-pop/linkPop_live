"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreVertical, X } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";
import ProfileImageWithStatus from "@/components/Suggestions/ProfileImageWithStatus";
import SuggestionUserDetails from "@/components/Suggestions/SuggestionUserDetails";
import PriceTag from "@/components/Suggestions/PriceTag";
import FollowButton from "@/components/Suggestions/FollowButton";
import {
  generateUnsplashURL,
  getBannerImages,
} from "@/lib/utils/generateUnsplashURL";

/**
 * SuggestionCard component displays a single creator suggestion with their info and attributes
 *
 * @param {Object} user - The user object to display
 * @param {number} index - Index for selecting fallback images
 * @param {Function} onRemove - Function to call when user chooses "Don't suggest"
 * @param {Object} currentUser - The current logged in user
 * @param {Object} searchParams - Current search parameters for highlighting matches
 */
export default function SuggestionCard({
  user,
  index,
  onRemove,
  currentUser,
  searchParams,
}) {
  const { t } = useTranslation();

  // Handle don't suggest option click
  const handleDontSuggest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(user._id);
  };

  // Get banner images
  const BANNER_IMAGES = getBannerImages();

  //? Generate fallback banner
  const generatedBanner = generateUnsplashURL(user.lastUploadedCreatorTags);
  const fallbackBanner = BANNER_IMAGES[index % BANNER_IMAGES.length];
  const bannerImage = user.coverImage || generatedBanner || fallbackBanner;

  return (
    <Link href={`/${user.name}`} className="block">
      <div className="relative rounded-lg overflow-hidden h-32 group">
        {/* Price tag */}
        <PriceTag price={user.subscriptionPrice} />

        {/* Menu button with dropdown */}
        <div className="absolute top-2 right-2 z-20">
          <DropdownIcon
            Icon={(props) => (
              <MoreVertical {...props} size={18} className="text-white" />
            )}
            menuTitle={user.name}
            iconClassName="text-white p-1 rounded-full hover:bg-white/20"
            collapsibleContentClassName="w-44"
          >
            <div
              className="block px-4 py-2 text-sm text-foreground hover:bg-accent flex items-center cursor-pointer"
              onClick={handleDontSuggest}
            >
              <X size={14} className="mr-2" />
              {t("dontSuggest") || "Don't suggest"}
            </div>
          </DropdownIcon>
        </div>

        {/* Follow button */}
        <FollowButton />

        {/* Background banner */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={bannerImage}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        </div>

        {/* User profile content */}
        <div className="absolute bottom-0 left-0 w-full p-3 flex items-center gap-3 z-10">
          {/* Profile image with online indicator */}
          <ProfileImageWithStatus
            profileImage={user.profileImage}
            isAvailable={user.isAvailable}
            userName={user.name}
          />

          {/* User details */}
          <SuggestionUserDetails
            user={user}
            currentUser={currentUser}
            searchParams={searchParams}
          />
        </div>
      </div>
    </Link>
  );
}
