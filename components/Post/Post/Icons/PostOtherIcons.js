import DropdownIcon from "@/components/ui/shared/DropdownIcon/DropdownIcon";
import PostCopyLink from "./PostCopyLink";
import { MoreHorizontal } from "lucide-react";
import PostAdminIcons from "./PostAdminIcons";
import PostAddToArchive from "./PostAddToArchive";
import PostHide from "./PostHide";
import PostHideUser from "./PostHideUser";
import PostCopyText from "./PostCopyText";
import { BRAND_INVERT_CLASS } from "@/lib/utils/constants";

export default function PostOtherIcons({
  col,
  post,
  postsPaginationType,
  isAdmin,
  isOwner,
  showAdminIcons,
  mongoUser,
}) {
  if (col.settings?.noOtherIcons) return null;

  const iconClassName = `tal px15 py5 wsn cp hover:brand hover:bg-accent`;

  return (
    <DropdownIcon
      collapsibleContentClassName={`min-w-[150px]`}
      className={`poa t0 r0 z-50 ${BRAND_INVERT_CLASS}`}
      Icon={MoreHorizontal}
    >
      {["feeds"].includes(col.name) && (
        <>
          <PostCopyLink {...{ post, iconClassName }} />
          {mongoUser && isOwner && (
            <PostAddToArchive {...{ post, iconClassName }} />
          )}
          {mongoUser && !isOwner && (
            <>
              <PostHide
                {...{
                  post,
                  iconClassName,
                  mongoUser,
                  hiddenCol: "hiddenFeeds",
                  queryKey: "posts",
                  text: "post",
                }}
              />
              <PostHideUser {...{ post, iconClassName, mongoUser }} />
            </>
          )}
        </>
      )}

      {["chatmessages"].includes(col.name) && (
        <>
          <PostCopyText {...{ post, iconClassName }} />
          {mongoUser && !isOwner && (
            <>
              <PostHide
                {...{
                  post,
                  iconClassName,
                  mongoUser,
                  hiddenCol: "hiddenMessages",
                  queryKey: ["chat", "messages", post.chatRoomId],
                  text: "message",
                }}
              />
            </>
          )}
        </>
      )}

      {/* // * Admin icons */}
      <hr />
      {showAdminIcons && mongoUser && (isAdmin || isOwner) && (
        <PostAdminIcons
          {...{ post, col, iconClassName, postsPaginationType }}
        />
      )}
    </DropdownIcon>
  );
}
