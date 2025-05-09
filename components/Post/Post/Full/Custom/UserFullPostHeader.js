"use client";

import UserFullPostSubscribeButton from "./UserFullPostSubscribeButton";
import UserFullPostEditProfileButton from "./UserFullPostEditProfileButton";
import UserFullPostSendMessageButton from "./UserFullPostSendMessageButton";
import { useState } from "react";
import UserFullPostCopyLinkToProfileButton from "./UserFullPostCopyLinkToProfileButton";
import UserFullPostShareButton from "./UserFullPostShareButton";

export default function UserFullPostHeader({ post, mongoUser }) {
  const [showSendMsgBtn, showSendMsgBtnSet] = useState(false);

  return (
    <div className={`!fz12 f g10 jce aic p10`}>
      <UserFullPostEditProfileButton {...{ mongoUser }} />
      <UserFullPostCopyLinkToProfileButton />
      <UserFullPostShareButton {...{ post, mongoUser }} />
      <UserFullPostSendMessageButton {...{ post, mongoUser, showSendMsgBtn }} />
      <UserFullPostSubscribeButton
        {...{ post, mongoUser, showSendMsgBtnSet }}
      />
    </div>
  );
}
