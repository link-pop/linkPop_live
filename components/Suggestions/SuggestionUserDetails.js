"use client";

import { CheckCircle } from "lucide-react";
import SuggestionAttribute from "@/components/Suggestions/SuggestionAttribute";
import { useTranslation } from "@/components/Context/TranslationContext";
import { getMostFrequentCreatorTags } from "@/lib/utils/getMostFrequentCreatorTags";

export default function SuggestionUserDetails({ user, currentUser }) {
  const { t } = useTranslation();

  if (!user) return null;

  // Get the most frequent tags from lastUploadedCreatorTags if available
  const mostFrequentTags = user.lastUploadedCreatorTags
    ? getMostFrequentCreatorTags(user.lastUploadedCreatorTags)
    : null;

  return (
    <div className="text-white">
      <div className="flex items-center gap-1">
        <span className="text-base font-medium">{user.name}</span>
        {user.isVerified && <CheckCircle size={16} className="text-white" />}
      </div>
      <span className="text-xs text-white/80">@{user.username}</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {user.age && <SuggestionAttribute value={user.age} />}
        {/* Show most frequent tags from lastUploadedCreatorTags if available, otherwise fallback to profile attributes */}
        {mostFrequentTags ? (
          <>
            {/* Only show raceEthnicity if current user is dev */}
            {currentUser?.isDev && mostFrequentTags.raceEthnicity && (
              <SuggestionAttribute value={t(mostFrequentTags.raceEthnicity)} />
            )}
            {mostFrequentTags.hairColor && (
              <SuggestionAttribute value={t(mostFrequentTags.hairColor)} />
            )}
            {mostFrequentTags.bodyType && (
              <SuggestionAttribute value={t(mostFrequentTags.bodyType)} />
            )}
          </>
        ) : (
          <>
            {/* Only show raceEthnicity if current user is dev */}
            {currentUser?.isDev && user.raceEthnicity && (
              <SuggestionAttribute value={t(user.raceEthnicity)} />
            )}
            {user.hairColor && (
              <SuggestionAttribute value={t(user.hairColor)} />
            )}
            {user.bodyType && <SuggestionAttribute value={t(user.bodyType)} />}
          </>
        )}
      </div>
    </div>
  );
}
