"use client";

import { useState } from "react";
import PostIcons from "../Icons/PostIcons";
import Post from "../Post";
import Comments from "../../../Comment/Comments";
import AddCommentForm from "../../../Comment/AddCommentForm";
import useAddCommentForm from "../../../Comment/useAddCommentForm";
import { usePathname } from "next/navigation";
import { MAIN_ROUTE } from "@/lib/utils/constants";
import ExpiresAt from "../ExpiresAt";
import CreatedAtTimeAgo from "../CreatedAtTimeAgo";
import ScheduleAt from "../ScheduleAt";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";
import { useTranslation } from "@/components/Context/TranslationContext";

export default function FeedPost(props) {
  const { post, mongoUser } = props;
  const { t } = useTranslation();

  const pathname = usePathname();
  const [showComments, setShowComments] = useState(
    pathname === MAIN_ROUTE ? false : true
  );

  const { commentTextState, setCommentTextState, addCommentFormTextareaRef } =
    useAddCommentForm();

  // Check if comments are enabled for the post creator
  const areCommentsEnabled = post?.createdBy?.enableComments !== false;

  return (
    <Post
      {...props}
      showIcons={false}
      showCreatedBy={true}
      showCreatedAt={false}
      showCreatedAtTimeAgo={true}
      showAutoGenMongoFields={false}
      className="maw600 wf"
      top2={<RichTextContent content={post.text} className="px15 pb15 mt-4" />}
      top3={
        <>
          <PostIcons
            {...{
              showComment: true,
              adminIconsClassName: "poa r0 t0",
              className: "f fwn",
              col: {
                name: "feeds",
                // ! used NOT is posts route so need manual settings
                settings: { hasLikes: true, hasComments: areCommentsEnabled },
              },
              postsPaginationType: "infinite",
              mongoUser,
              // showAdminIcons,
              // isAdmin,
              post,
              onCommentClick: () =>
                areCommentsEnabled && setShowComments(!showComments),
            }}
          />

          {areCommentsEnabled && showComments && (
            <div className="mt-4">
              <Comments
                {...{
                  col: {
                    name: "feeds",
                    settings: { hasLikes: true, hasComments: true },
                  },
                  mongoUser,
                  postsPaginationType: "infinite",
                  postId: post._id,
                  postType: "feeds",
                  setCommentTextState,
                  postCommentsNum: post.comments,
                }}
              />
              <AddCommentForm
                {...{
                  col: {
                    name: "feeds",
                    settings: { hasLikes: true, hasComments: true },
                  },
                  mongoUser,
                  postsPaginationType: "infinite",
                  postId: post._id,
                  postType: "feeds",
                  text: commentTextState,
                  setText: setCommentTextState,
                  addCommentFormTextareaRef,
                  post,
                }}
              />
            </div>
          )}
        </>
      }
      top4={null}
      // TODO !!!!!!! not working as expected, other users see your archived post
      // top7={
      //   <>
      //     {post.active === false && (
      //       <span className="if fz14 bad">{t("archived").toLowerCase()}</span>
      //     )}
      //   </>
      // }
    />
  );
}
