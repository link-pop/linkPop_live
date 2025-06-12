"use client";

import { useState } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import AddStoreItemButton from "./AddStoreItemButton";
import UserStoreItems from "./UserStoreItems";
import StoreCategoryFetchedSwitch from "@/components/Post/Posts/Custom/MoreThanFriend/StoreCategoryFetchedSwitch";

export default function UserFullPostUserStore({
  post,
  col,
  isAdmin,
  mongoUser,
  visitedMongoUser,
}) {
  const { t } = useTranslation();
  const { dialogSet } = useContext();

  // Determine if current user is the owner of the profile
  const isOwner = mongoUser?._id && mongoUser?._id === visitedMongoUser?._id;

  if (!visitedMongoUser) return null;

  return (
    <div className="fc g15 p15">
      {/* Owner controls */}
      {isOwner && (
        <div className="f aic jcc">
          <AddStoreItemButton
            mongoUser={mongoUser}
            visitedMongoUser={visitedMongoUser}
          />
        </div>
      )}

      {/* Category filter */}
      <StoreCategoryFetchedSwitch
        mongoUser={mongoUser}
        visitedUserId={visitedMongoUser?._id}
        collection="storeitems"
      />

      {/* Store items display */}
      <UserStoreItems
        mongoUser={mongoUser}
        visitedMongoUser={visitedMongoUser}
        isOwner={isOwner}
        isAdmin={isAdmin}
      />
    </div>
  );
}
