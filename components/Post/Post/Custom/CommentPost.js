"use client";

import CreatedBy from "../CreatedBy";
import Post from "../Post";
import ReplyButton from "@/components/Reply/ReplyButton";
import TextWithTaggedUser from "../TextWithTaggedUser";

export default function CommentPost(props) {
  const { text, createdAt, createdBy } = props.post;
  const { setCommentTextState } = props;

  function handleReply() {
    setCommentTextState(``); // to trigger addCommentFormTextareaRef focus
    setTimeout(() => setCommentTextState(`@${createdBy.name}, `), 1);
  }

  return (
    <Post
      {...props}
      showTags={false}
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      useCard={false}
      showAutoGenMongoFields={false}
      showCreatedBy={false}
      className="fui"
      iconsClassName="poa r20 -t2"
      top={
        <>
          <div className="f g10">
            <CreatedBy
              bottom={
                <div className="!fz12 text-gray-500">
                  {new Date(createdAt).toLocaleDateString()}
                </div>
              }
              bottomClassName="text-gray-500"
              createdBy={createdBy}
            />

            {/* Comment text */}
            <TextWithTaggedUser {...{ post: props.post }} />
          </div>

          <ReplyButton className="mt8" onClick={handleReply} />
        </>
      }
    />
  );
}
