"use client";

import { Check } from "lucide-react";
import CreatedBy from "@/components/Post/Post/CreatedBy";

// * Individual user item for mass message selection
export default function ChatroomsSendUserItem({ user, isSelected, onToggle }) {
  return (
    <div
      className={`cursor-pointer hover:bg-accent transition-colors ${
        isSelected ? "bg-accent/50" : ""
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 p-3">
        <div className="relative pl20">
          <div className="pen">
            <CreatedBy
              createdBy={user}
              showName={true}
              className="!gap-3"
              imageClassName="!w-10 !h-10"
              nameClassName="font-medium text-sm"
              bottom={`@${
                user.username || user.name?.toLowerCase().replace(/\s+/g, "")
              }`}
              bottomClassName="text-xs text-foreground/60"
            />
          </div>
          {isSelected ? (
            <div className="absolute t11 -l5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check size={12} className="text-primary-foreground" />
            </div>
          ) : (
            <div className="opacity-10 absolute t11 -l5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check size={12} className="text-primary-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
