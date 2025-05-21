"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSuggestedUsers } from "@/lib/actions/getSuggestedUsers";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import OnlineBadge from "@/components/ui/shared/OnlineBadge/OnlineBadge";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function SuggestionsSection() {
  const [suggestions, setSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsToShow = 3;
  const totalPages = Math.ceil((suggestions.length || 0) / itemsToShow);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSuggestions = async () => {
      const users = await getSuggestedUsers(10);
      setSuggestions(users);
    };

    fetchSuggestions();
  }, []);

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setCurrentPage(0);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    } else {
      setCurrentPage(totalPages - 1);
    }
  };

  // No suggestions to show - return empty container with fixed height
  if (!suggestions.length) {
    return (
      <div
        className="w-full bg-background rounded-lg shadow-sm p-3"
        style={{ height: "440px" }}
      >
        <div className="text-sm font-medium text-foreground/60 mb-4">
          {t("suggestions")}
        </div>
      </div>
    );
  }

  // Current visible suggestions
  const visibleSuggestions = suggestions.slice(
    currentPage * itemsToShow,
    (currentPage + 1) * itemsToShow
  );

  // Fill with empty slots if needed to maintain consistent height
  const fillerSlots = Array(
    Math.max(0, itemsToShow - visibleSuggestions.length)
  ).fill(null);

  return (
    <div
      className="w-full bg-background rounded-lg shadow-sm p-3"
      style={{ height: "440px" }}
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-foreground/60">
          {t("suggestions")}
        </span>
      </div>

      {/* User suggestions list - fixed height container */}
      <div className="space-y-3" style={{ minHeight: "328px" }}>
        {visibleSuggestions.map((user, index) => (
          <SuggestionCard key={user._id} user={user} index={index} />
        ))}

        {/* Empty placeholder slots to maintain height */}
        {fillerSlots.map((_, idx) => (
          <div key={`filler-${idx}`} className="h-32" /> // Same height as a card
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {/* Left arrow */}
        <div
          onClick={goPrev}
          className="cursor-pointer text-foreground/60 hover:text-foreground"
        >
          <ChevronLeft size={20} />
        </div>

        {/* Dots */}
        <div className="flex gap-1">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx === currentPage ? "bg-foreground" : "bg-foreground/30"
              }`}
              onClick={() => setCurrentPage(idx)}
            />
          ))}
        </div>

        {/* Right arrow */}
        <div
          onClick={goNext}
          className="cursor-pointer text-foreground/60 hover:text-foreground"
        >
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
}

// Individual suggestion card component
function SuggestionCard({ user, index }) {
  // Sample banner images as fallbacks
  const bannerImages = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1974&auto=format&fit=crop",
  ];

  const isFree = user.subscriptionPrice === 0;

  return (
    <Link href={`/${user.name}`} className="block">
      <div className="relative rounded-lg overflow-hidden h-32 group">
        {/* Free tag */}
        <div className="absolute top-2 left-2 z-10">
          <span className="text-xs bg-black/30 backdrop-blur-sm text-white px-2 py-0.5 rounded font-medium">
            Free
          </span>
        </div>

        {/* Menu button */}
        <div className="absolute top-2 right-2 z-10">
          <div className="p-1 rounded-full hover:bg-white/20 text-white">
            <MoreVertical size={18} />
          </div>
        </div>

        {/* Background banner */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={user.coverImage || bannerImages[index % bannerImages.length]}
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
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
              <Image
                src={user.profileImage || "/img/default-avatar.png"}
                alt={user.name}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            {user.isAvailable && (
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          {/* User details */}
          <div className="text-white">
            <div className="flex items-center gap-1">
              <span className="text-base font-medium">{user.name}</span>
              <CheckCircle size={16} className="text-white" />
            </div>
            <span className="text-xs text-white/80">@{user.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
