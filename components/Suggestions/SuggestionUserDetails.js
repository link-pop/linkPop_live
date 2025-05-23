"use client";

import { CheckCircle } from "lucide-react";
import SuggestionAttribute from "@/components/Suggestions/SuggestionAttribute";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function SuggestionUserDetails({ user }) {
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="text-white">
      <div className="flex items-center gap-1">
        <span className="text-base font-medium">{user.name}</span>
        {user.isVerified && <CheckCircle size={16} className="text-white" />}
      </div>
      <span className="text-xs text-white/80">@{user.username}</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {user.age && <SuggestionAttribute value={user.age} />}
        {user.hairColor && <SuggestionAttribute value={t(user.hairColor)} />}
        {user.bodyType && <SuggestionAttribute value={t(user.bodyType)} />}
      </div>
    </div>
  );
}
