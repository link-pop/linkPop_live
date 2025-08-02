"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import useSingleUserListManagement from "@/hooks/useSingleUserListManagement";
import IconButton from "@/components/ui/shared/IconButton/IconButton";

export default function UserActionMenu({ user, className = "" }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showListSelectionDialog } = useSingleUserListManagement({ user });

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddToListClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    showListSelectionDialog();
  };

  return (
    <div className={`relative ${className}`}>
      <IconButton
        icon={MoreHorizontal}
        onClick={handleMenuClick}
        size={16}
        className="w-6 h-6"
      />

      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-50 min-w-48">
          <div
            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
            onClick={handleAddToListClick}
          >
            {t("addToRemoveFromLists")}
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
