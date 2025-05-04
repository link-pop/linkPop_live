import Post from "../Post";
import Carousel from "@/components/ui/shared/Carousel/Carousel";
import { useTranslation } from "@/components/Context/TranslationContext";
import Link from "next/link";
import PaidContentOverlay from "../PaidContentOverlay";
import { BadgeDollarSign, LockKeyhole } from "lucide-react";

export default function AttachmentPost(props) {
  const { post, col, isAdmin, mongoUser } = props;
  if (!post) return null;
  const { fileUrl, fileType, isPaid, hasPurchased, blurredUrl } = post;
  const { t } = useTranslation();

  // Check if current user is the owner of the post
  const isOwner =
    mongoUser?._id?.toString() === post.createdBy?._id?.toString() ||
    mongoUser?._id?.toString() === post.createdBy?.toString();

  // Determine which URL to display
  // If it's paid content and not purchased and not the owner, use blurred URL if available
  const displayUrl =
    isPaid && !hasPurchased && !isOwner ? blurredUrl || fileUrl : fileUrl;

  // Only show paid overlay if there's no URL to display (no original and no blurred)
  // and the current user is not the owner
  const showPaidOverlay = isPaid && !hasPurchased && !isOwner;

  // Find the post ID from related posts if available
  const postId = post.relatedPostId || null;

  return (
    <Post
      {...props}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      useCard={false}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className={`por w-full aspect-square sm:w-[200px] sm:h-[200px] fui !m0 !p2 por`}
      iconsClassName="poa r20 -t2"
      top={
        <>
          {showPaidOverlay && (
            <>
              <div
                // HACK to show LockKeyhole on top of carousel
                className={`bg-black/30 white p5 br5 poa z1 t5 r5 f aic jcc pointer-events-auto`}
              >
                <LockKeyhole size={16} className={``} />
              </div>
              <Link
                className="db hf wf poa l0 t0"
                href={postId ? `/${post.uploadedFrom}/${postId}` : "#"}
                onClick={(e) => e.stopPropagation()}
              >
                <PaidContentOverlay
                  post={post}
                  mongoUser={mongoUser}
                  col={col}
                />
                <Carousel
                  showArrows={false}
                  files={[
                    {
                      fileUrl: displayUrl,
                      fileType:
                        fileType ||
                        (displayUrl?.includes(".mp4") ? "video" : "image"),
                      fileName: "",
                    },
                  ]}
                />
              </Link>
            </>
          )}

          {!showPaidOverlay && (
            <div className="hf wf por l0 t0">
              {isPaid && (
                <div className="bg-black/30 white p5 br5 poa z1 t5 r5 pointer-events-auto">
                  <BadgeDollarSign size={16} className={`white`} />
                </div>
              )}
              <Carousel
                showArrows={false}
                files={[
                  {
                    fileUrl: displayUrl,
                    fileType:
                      fileType ||
                      (displayUrl?.includes(".mp4") ? "video" : "image"),
                    fileName: "",
                  },
                ]}
              />
            </div>
          )}
        </>
      }
    />
  );
}
