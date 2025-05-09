"use client";

// ! code start UserFullPostShareButton
import { Share2 } from "lucide-react";
import useShareHelper from "@/components/ui/shared/Share/ShareHelper";
import ShareModal from "@/components/ui/shared/Share/ShareModal";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function UserFullPostShareButton({ post, mongoUser }) {
  const { t } = useTranslation();
  const { shareContent, shareModalState, closeShareModal } = useShareHelper();

  const handleShare = () => {
    // Build the share URL for the post
    let shareUrl;
    if (post?.customURL) {
      // If post has a custom URL, use it
      shareUrl = `${window.location.origin}/${post.customURL}`;
    } else if (post?.slug) {
      // If post has a slug, use it
      shareUrl = `${window.location.origin}/${post.collection || "posts"}/${
        post.slug
      }`;
    } else {
      // Default to current URL
      shareUrl = window.location.href;
    }

    // Get post title or fallback
    const title =
      post?.title || t("shareThisLink") || "Share this link with your friends";

    // Get profile image from mongoUser if available
    const userProfileImage = mongoUser?.profileImage || null;
    // Fallback to post images if no profile image
    const image = userProfileImage || post?.image || post?.coverImage || null;

    // Use the shareContent helper from ShareHelper
    shareContent({
      url: shareUrl,
      title,
      text: post?.description || "",
      image,
    });
  };

  return (
    <>
      <div
        onClick={handleShare}
        className="bw1 border-[var(--color-brand)] br50 h44 w44 cp fcc brand"
        title={t("shareWith") || "Share"}
      >
        <Share2 size={16} />
      </div>

      {/* Render the ShareModal component when open */}
      {shareModalState.isOpen && (
        <ShareModal
          isOpen={shareModalState.isOpen}
          onClose={closeShareModal}
          url={shareModalState.url}
          title={shareModalState.title}
          text={shareModalState.text}
          image={shareModalState.image}
        />
      )}
    </>
  );
}
// ? code end UserFullPostShareButton
