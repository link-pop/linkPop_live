"use client";

import { X } from "lucide-react";
import RichTextContent from "../ui/shared/RichTextContent/RichTextContent";
import Carousel from "../ui/shared/Carousel/Carousel";

export default function ReplyPreview({
  replyTo,
  onCancelReply,
  isOwnMessage = false,
  isMsgPreview = false,
}) {
  if (!replyTo) return null;

  return (
    <div
      className={`mb10 wf black fz12 br10 ${
        isOwnMessage ? "bg-accent" : "bg-accent"
      } ${isMsgPreview ? "" : "maw600 mx10"}`}
    >
      <div className="flex items-center justify-between wf">
        <div className="flex-1">
          {/* // * form Preview */}
          {!isMsgPreview && (
            <div className={`brand font-semibold por t3 l5`}>
              {replyTo.createdBy?.name || "Unknown"}
            </div>
          )}

          {isMsgPreview && (
            <Carousel
              imageClassName={`!br0`}
              showThumbnails={false}
              showIndicators={false}
              showArrows={replyTo.files?.length > 1}
              files={replyTo.files}
            />
          )}

          {/* // * MsgPreview */}
          {isMsgPreview && (
            <div className={`brand font-semibold por t3 l5`}>
              {replyTo.createdBy?.name || "Unknown"}
            </div>
          )}

          <div className="f aic">
            <RichTextContent className="wbba fw200 fsi px10">
              {isMsgPreview
                ? replyTo.chatMsgText
                : replyTo.chatMsgText.substring(0, 60) ||
                  "Message not available"}
            </RichTextContent>
            <span className="text-foreground pl10">...</span>
          </div>
        </div>
        {onCancelReply && (
          <button
            type="button"
            onClick={onCancelReply}
            className="poa r10 t15 p5 hover:bg-accent rounded"
          >
            <X className="brand" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
