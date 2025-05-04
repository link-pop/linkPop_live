import React from "react";
import ChatmessagePost from "../../Custom/ChatmessagePost";
import FullPost from "../FullPost";

export default function ChatmessageFullPost({ post, col, isAdmin, mongoUser }) {
  return (
    <FullPost
      {...{
        post,
        col,
        isAdmin,
        mongoUser,
      }}
      showAutoGenMongoFields={false}
      skipCustom={true} // ! Set to true to prevent infinite recursion
      showCreatedAt={false}
      showCreatedAtTimeAgo={false}
      className=""
      top={
        <ChatmessagePost
          {...{
            post,
            col: { ...col, settings: { ...col.settings, noUpdateIcon: true } },
            isAdmin,
            mongoUser,
          }}
        />
      }
    />
  );
}
