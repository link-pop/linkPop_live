"use client";

import React from "react";
import UserCard from "./UserCard";
import useUserSelection from "@/hooks/useUserSelection";
import { Circle, CircleCheck } from "lucide-react";

export default function UsersWithSelection({
  users = [],
  mongoUser,
  showActions = false,
  showSubscriptionStatus = false,
  additionalInfo = {},
  className = "",
  noUsersMessage = "No users found",
  onUserClick,
  enableSelection = true,
  ...props
}) {
  const {
    selectedUsers,
    toggleUserSelection,
    isUserSelected,
    SelectionControls,
  } = useUserSelection({ allUsers: users });

  if (!users || users.length === 0) {
    return (
      <div className="fcc p20 text-center">
        <div className="text-foreground/70">{noUsersMessage}</div>
      </div>
    );
  }

  return (
    <>
      {enableSelection && <SelectionControls />}

      {/* Users with selection */}
      <div className={`fcc g15 !p15`}>
        {users.map((user) => {
          const isSelected = isUserSelected(user._id);

          // Extract additionalInfo from user object if it exists
          const userAdditionalInfo = user._additionalInfo || additionalInfo;

          const handleCardClick = (e) => {
            if (enableSelection) {
              e.preventDefault();
              e.stopPropagation();
              toggleUserSelection(user);
            }
            if (onUserClick) {
              onUserClick(user);
            }
          };

          const handleSelectionClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleUserSelection(user);
          };

          return (
            <div key={user._id} className="relative">
              <UserCard
                user={user}
                mongoUser={mongoUser}
                showActions={showActions}
                showSubscriptionStatus={showSubscriptionStatus}
                additionalInfo={userAdditionalInfo}
                className={`${enableSelection ? "cursor-pointer" : ""} ${
                  isSelected ? "ring-2 ring-primary" : ""
                } transition-all duration-200`}
                onClick={enableSelection ? handleCardClick : undefined}
                {...props}
              />

              {/* Selection indicator */}
              {enableSelection && (
                <div
                  className="absolute top-2 right-2 z-10"
                  onClick={handleSelectionClick}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/60 text-foreground hover:bg-background/80"
                    }`}
                  >
                    {isSelected ? (
                      <CircleCheck className="brand w-7 h-7" />
                    ) : (
                      <Circle className="w-7 h-7" />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
