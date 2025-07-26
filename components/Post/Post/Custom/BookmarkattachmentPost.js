import Post from "../Post";
import Carousel from "@/components/ui/shared/Carousel/Carousel";
import { useTranslation } from "@/components/Context/TranslationContext";
import Link from "next/link";
import PaidContentOverlay from "../PaidContentOverlay";
import { BadgeDollarSign, LockKeyhole } from "lucide-react";
import CreatedBy from "../CreatedBy";
import { usePathname, useRouter } from "next/navigation";
import { DISCOVER_MEDIA_ROUTE, FEEDS_ROUTE } from "@/lib/utils/constants";

export default function BookmarkattachmentPost(props) {
  const { post, col, isAdmin, mongoUser } = props;
  if (!post) return null;

  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // Check if current user is the owner of the post
  const isOwner =
    mongoUser?._id?.toString() === post.createdBy?._id?.toString() ||
    mongoUser?._id?.toString() === post.createdBy?.toString();

  // Get the first file from the files array (for image-only view)
  const firstFile = post.files && post.files.length > 0 ? post.files[0] : null;
  const filesCount = post.files ? post.files.length : 0;

  if (!firstFile) {
    // If no files, don't render this post in attachment view
    return null;
  }

  // Handle different file structures (populated vs unpopulated)
  const fileUrl = firstFile.fileUrl || firstFile.url;
  const fileType = firstFile.fileType || firstFile.type || "image";
  const isPaid = firstFile.isPaid || post.price > 0;
  const blurredUrl = firstFile.blurredUrl;

  // For paid content, check if user has purchased the post
  const hasPurchased = post.hasPurchased || false;

  // Determine which URL to display
  const displayUrl =
    isPaid && !hasPurchased && !isOwner ? blurredUrl || fileUrl : fileUrl;

  // Only show paid overlay if there's no URL to display and not the owner
  const showPaidOverlay = isPaid && !hasPurchased && !isOwner;

  // Generate link to the original feed post
  const feedPostUrl = `${FEEDS_ROUTE}/${post._id}`;

  const handleClick = (e) => {
    // Redirect to the original feed post
    router.push(feedPostUrl);
  };

  return (
    <div
      className="por w-full aspect-square sm:w-[200px] sm:h-[200px] fui !m0 !p2 por cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      {/* DEV ONLY - File tags */}
      {mongoUser?.isDev && firstFile.tags && firstFile.tags.length > 0 && (
        <div className="bad poa r5 t5 z1">
          {firstFile.tags.map((tag) => (
            <span key={tag}>{tag + " "}</span>
          ))}
        </div>
      )}

      {showPaidOverlay && (
        <>
          <div className="bg-black/30 white p5 br5 poa z1 t5 r5 f aic jcc pointer-events-auto">
            <LockKeyhole size={16} />
          </div>
          <div className="db hf wf poa l0 t0">
            <PaidContentOverlay post={post} mongoUser={mongoUser} col={col} />
            <Carousel
              showArrows={false}
              showFileCount={true}
              filesCount={filesCount}
              files={[
                {
                  fileUrl: displayUrl,
                  fileType: fileType,
                  fileName: firstFile.fileName || "",
                },
              ]}
            />
          </div>
        </>
      )}

      {!showPaidOverlay && (
        <div className="hf wf por l0 t0">
          {isPaid && (
            <div className="bg-black/30 white p5 br5 poa z1 t5 r5 pointer-events-auto">
              <BadgeDollarSign size={16} className="white" />
            </div>
          )}
          <Carousel
            showArrows={false}
            showFileCount={true}
            filesCount={filesCount}
            files={[
              {
                fileUrl: displayUrl,
                fileType: fileType,
                fileName: firstFile.fileName || "",
              },
            ]}
          />
        </div>
      )}

      {/* Show creator info on discover media route */}
      {pathname === DISCOVER_MEDIA_ROUTE && (
        <Link href={`/${post.createdBy.username}`}>
          <CreatedBy
            mongoUser={mongoUser}
            createdBy={post.createdBy}
            className="poa l5 t5 z1 white"
            imageClassName="!miw30 !mih30 !w30 !h30"
          />
        </Link>
      )}
    </div>
  );
}
