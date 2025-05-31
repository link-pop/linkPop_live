import Post from "../Post";
import Carousel from "@/components/ui/shared/Carousel/Carousel";
import { useTranslation } from "@/components/Context/TranslationContext";
import Link from "next/link";
import PaidContentOverlay from "../PaidContentOverlay";
import { BadgeDollarSign, LockKeyhole } from "lucide-react";
import CreatedBy from "../CreatedBy";
import { usePathname } from "next/navigation";
import { DISCOVER_MEDIA_ROUTE } from "@/lib/utils/constants";

export default function AttachmentPost(props) {
  const { post, col, isAdmin, mongoUser } = props;
  if (!post) return null;
  const { fileUrl, fileType, isPaid, hasPurchased, blurredUrl } = post;
  const { t } = useTranslation();
  const pathname = usePathname();

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
          {/* // ! DEV ONLY = SEE FILE TAGS: don't remove this */}
          {mongoUser?.isDev && post.tags && post.tags.length > 0 && (
            <div className="bad poa r5 t5 z1">
              {post.tags.map((tag) => (
                <span key={tag}>{tag + " "}</span>
              ))}
            </div>
          )}
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
      top2={
        pathname === DISCOVER_MEDIA_ROUTE && (
          <Link href={`/${post.createdBy.username}`}>
            <CreatedBy
              mongoUser={mongoUser}
              createdBy={post.createdBy}
              className={`poa l5 t5 z1 white`}
              imageClassName={`!miw30 !mih30 !w30 !h30`}
            />
          </Link>
        )
      }
    />
  );
}
