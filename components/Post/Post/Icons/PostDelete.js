"use client";

import { removeOne } from "@/lib/actions/crud";
import { useContext } from "../../../Context/Context";
import DeleteIcon from "@/components/ui/icons/DeleteIcon";
import useCommentCustomPostDeleteLogic from "./Custom/useCommentCustomPostDeleteLogic";
import useChatmessageCustomPostDeleteLogic from "./Custom/useChatmessageCustomPostDeleteLogic";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function PostDelete({
  post,
  postsPaginationType,
  col,
  iconClassName,
  customIcon,
}) {
  const { toastSet, dialogSet } = useContext();
  const { t } = useTranslation();
  const postName = col.name?.replace(/s$/g, "");
  // ! 1 CUSTOM LOGIC FOR COLS
  const { handleCommentDelete } = useCommentCustomPostDeleteLogic({
    post,
  });
  const { handleChatmessageDelete } = useChatmessageCustomPostDeleteLogic({
    post,
  });

  async function _remove(e) {
    // Check if this is a purchased message (prevent deletion)
    if (post?.price > 0 && post?.hasPurchased === true) {
      toastSet({
        isOpen: true,
        title: t("cannotDeletePurchasedMessage"),
      });
      return;
    }

    const postElement = e.target.closest(".Post");
    dialogSet({
      isOpen: true,
      title: t("deleteConfirm"),
      text: `${post.title || post?.text || post?.name}`,
      isDanger: true,
      action: async () => {
        console.log(
          `🗑️ PostDelete: Starting deletion for ${col.name} post ${post._id}`
        );
        console.log(`📄 Post data:`, post);

        // DEFAULT PostDelete LOGIC for any collection
        const res = await removeOne({
          col,
          data: { _id: post._id },
          postsPaginationType,
        });

        if (!res) {
          console.error(
            `❌ PostDelete: Failed to delete ${col.name} post ${post._id}`
          );
          return;
        }

        console.log(
          `✅ PostDelete: Successfully deleted ${col.name} post ${post._id}`
        );

        // ! 2 CUSTOM LOGIC FOR COMMENTS
        if (col.name === "comments") {
          await handleCommentDelete();
        }
        if (col.name === "chatmessages") {
          await handleChatmessageDelete();
        }

        toastSet({
          isOpen: true,
          title: t("itemDeleted"),
        });
        if (postsPaginationType === "infinite") {
          postElement?.remove();
        }
      },
    });
  }

  return (
    <div onClick={_remove}>
      {customIcon || <DeleteIcon className={iconClassName} />}
    </div>
  );
}
