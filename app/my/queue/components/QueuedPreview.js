import FeedPost from "@/components/Post/Post/Custom/FeedPost";
import ChatmessagePost from "@/components/Post/Post/Custom/ChatmessagePost";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function QueuedPreview({
  item,
  type,
  mongoUser,
  inDialog = false,
}) {
  const { t } = useTranslation();

  // Prevent any navigation or event bubbling
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Adjust classNames based on whether we're in a dialog or not
  const containerClassName = inDialog
    ? "w-full overflow-hidden max-h-[70dvh] overflow-y-auto"
    : "rounded-lg p15 maw600 mx-auto mt10 overflow-hidden max-h-[calc(100%-20px)] overflow-y-auto";

  if (!item) {
    return (
      <div className={containerClassName}>
        <div className="mt15 flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
          {t("clickOnPostToPreview")}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName} onClick={handleClick}>
      {type === "feeds" ? (
        <FeedPost
          post={item}
          mongoUser={mongoUser}
          onClick={handleClick}
          col={{
            name: "feeds",
            settings: {
              hasLikes: true,
              hasComments: true,
              noFullPost: true, // Prevent navigating to full post
            },
          }}
          className={inDialog ? "maw-none p0" : ""}
        />
      ) : (
        <ChatmessagePost
          post={item}
          mongoUser={mongoUser}
          onClick={handleClick}
          col={{
            name: "chatmessages",
            settings: {
              noFullPost: true, // Prevent navigating to full post
            },
          }}
          className={inDialog ? "maw-none p0" : ""}
        />
      )}
    </div>
  );
}
