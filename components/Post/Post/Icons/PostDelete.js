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
    const postElement = e.target.closest(".Post");
    dialogSet({
      isOpen: true,
      title: t("deleteConfirm"),
      text: `${post.title || post?.text || post?.name}`,
      isDanger: true,
      action: async () => {
        // DEFAULT PostDelete LOGIC for any collection
        const res = await removeOne({
          col,
          data: { _id: post._id },
          postsPaginationType,
        });
        if (!res) return;

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
