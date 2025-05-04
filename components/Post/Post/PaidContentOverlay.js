"use client";

import { useState, useEffect } from "react";
import { LockKeyhole, LockKeyholeOpen, BadgeDollarSign } from "lucide-react";
import StripeButton from "@/components/Stripe/StripeButton";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PaidContentOverlay({ post, mongoUser, col }) {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Simple check to determine loading state
    if (!mongoUser || !post?._id) {
      setIsLoading(false);
      return;
    }

    // Set loading to false once we have the post data
    setIsLoading(false);
  }, [mongoUser, post]);

  // Determine if this is a feed post or chat message
  const postType = col?.name || "feeds";
  const isMessage = postType === "chatmessages";

  // Check if current user is the owner of the post
  const isOwner =
    mongoUser &&
    post?.createdBy?._id &&
    mongoUser._id.toString() === post.createdBy._id.toString();

  // If user has purchased (using the hasPurchased flag from server),
  // or the post is not paid, don't show overlay
  if (post?.hasPurchased || isLoading || !post?.price) {
    return null;
  }

  // TODO !!!!!! 1 StripeButton
  return (
    <>
      <div className={`poa wf hf t0 l0 fcc fc g10 pointer-events-none`}>
        {/* // ! NOT for chat messages */}
        {col.name !== "chatmessages" && (
          <div
            className={`bg-black/30 white poa t10 r10 f aic jcc p5 br5 pointer-events-auto`}
          >
            {isOwner ? (
              <>
                <BadgeDollarSign size={16} className={`white`} />
                <span className="fz12 white">{post.price}</span>
              </>
            ) : (
              <LockKeyhole size={16} className={``} />
            )}
          </div>
        )}
      </div>
      {/* Don't show purchase button for owner */}
      {!isOwner && (
        <>
          {isMessage ? (
            <StripeButton
              {...{
                messageId: post._id,
                postType: "chatmessages",
                className:
                  "poa r5 b5 !h30 fcc !px5 !py2 brand pointer-events-auto",
              }}
            >
              <div className="fcc g5">
                <LockKeyholeOpen size={16} className={`brand`} />
                <span className="fz14">${post.price}</span>
              </div>
            </StripeButton>
          ) : (
            <StripeButton
              {...{
                postId: post._id,
                postType: "feeds",
                className:
                  "poa r5 b5 !h30 fcc !px5 !py2 brand pointer-events-auto",
              }}
            >
              <div className="fcc g5">
                <LockKeyholeOpen size={16} className={`brand`} />
                <span className="fz14">${post.price}</span>
              </div>
            </StripeButton>
          )}
        </>
      )}
    </>
  );
}
