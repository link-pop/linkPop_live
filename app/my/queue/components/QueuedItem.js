"use client";

import { format } from "date-fns";
import {
  Image as ImageIcon,
  MoreHorizontal,
  FileText,
  Video,
  Clock,
  DollarSign,
  Images,
  Eye,
} from "lucide-react";
import Image from "next/image";
import RichTextContent from "@/components/ui/shared/RichTextContent/RichTextContent";

export default function QueuedItem({
  item,
  type = "feeds",
  onSelect,
  selected,
}) {
  // Common shared properties
  const scheduledDate = new Date(item.scheduleAt);
  const formattedDate = format(scheduledDate, "MMM d");
  const formattedDay = format(scheduledDate, "EEE"); // Get day of week (Mon, Tue, etc.)
  const formattedTime = format(scheduledDate, "h:mm aaa");

  // Content and files based on item type
  const content = type === "feeds" ? item.text : item.chatMsgText;

  const files = item.files || [];
  const hasFiles = Array.isArray(files) && files.length > 0;

  // Get first 3 files for preview
  const previewFiles = hasFiles ? files.slice(0, 3) : [];

  // Check if we have a valid media to display
  const hasMediaToShow = previewFiles.length > 0 && previewFiles[0].fileUrl;

  // Determine additional elements based on type
  const isPost = type === "feeds";

  // Handle price for both post and message types
  const price = item.price || 0;
  const hasPrice = price > 0;

  // Handle expiration period
  const expirationPeriod = item.expirationPeriod;
  const hasExpiration =
    expirationPeriod && expirationPeriod !== "0" && expirationPeriod !== 0;

  const formattedExpiration = hasExpiration
    ? typeof expirationPeriod === "number"
      ? `${expirationPeriod}d`
      : expirationPeriod
    : null;

  const recipientInfo =
    !isPost && item.chatRoomId ? (
      <span className="text-foreground/70 ml5">
        to u{item.chatRoomId.split("-")[1]}
      </span>
    ) : null;

  return (
    <div
      className={`f wf border-b border-border/70 px4 py8 hover:bg-muted/70 cursor-pointer ${
        selected ? "bg-accent border-accent" : ""
      }`}
      onClick={() => onSelect && onSelect(item, type)}
    >
      {/* Left date column - fixed width with right border */}
      <div className="fc jcc mr0 flex-shrink-0 w60 border-r border-border/20 pr10">
        <div className="fw500">{formattedDate}</div>
        <div className="text-foreground/70">{formattedDay}</div>
      </div>

      {/* Middle content column */}
      <div className="fc justify-center py5 pl15 pr10 flex-1">
        <div className="f aic wrap g5">
          <span className="text-foreground/80">{formattedTime}</span>

          {hasPrice && (
            <span className="flex-shrink-0 px5 py2 bg_brand br10 fs12 text-white f aic g3">
              <DollarSign className="w15 h15" />
              {price}
            </span>
          )}

          {hasExpiration && (
            <span className="flex-shrink-0 px5 py2 bg-amber-500/90 br10 fs12 text-white f aic g3">
              <Clock className="w15 h15" />
              {formattedExpiration}
            </span>
          )}

          {recipientInfo}
        </div>

        <div className="mt5">
          {content ? (
            <RichTextContent
              content={
                content.length > 50 ? content.substring(0, 50) + "..." : content
              }
              className="text-foreground text-sm p0 m0"
            />
          ) : isPost ? (
            ""
          ) : type === "chatmessages" ? (
            "msg txt only"
          ) : (
            ""
          )}
        </div>
      </div>

      {/* Right content with image preview and actions */}
      <div className="flex-shrink-0 f aic g10 pr8 mla">
        {/* File indicators or preview */}
        {hasFiles && (
          <div className="f aic g5">
            {hasMediaToShow ? (
              <div className="f aic g5">
                {/* Show up to 3 image previews */}
                <div className="f aic g5">
                  {previewFiles.map((file, index) => (
                    <div
                      key={index}
                      className="relative w40 h40 overflow-hidden rounded-md border border-border/30"
                    >
                      {file.fileType === "video" ? (
                        <div className="w-full h-full f aic jcc bg-muted/20">
                          <Video className="w20 h20 text-foreground/70" />
                        </div>
                      ) : file.fileUrl ? (
                        <Image
                          src={file.fileUrl}
                          alt={`Preview ${index + 1}`}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full f aic jcc bg-muted/20">
                          <FileText className="w20 h20 text-foreground/70" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Show total count with icon if more than 0 files */}
                {files.length > 0 && (
                  <div className="f aic g3 text-foreground/70">
                    <Images className="w15 h15" />
                    <span className="fs12">{files.length}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="f aic g5">
                <FileText className="w14 h14 text-foreground/70" />
                <span className="text-foreground/70 fs12">{files.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {/* // ! don't uncomment this */}
        {/* <div className="p4 hover:bg-muted/20 rounded-full cursor-pointer">
          <Eye className="w17 h17 text-foreground/70" />
        </div> */}
      </div>
    </div>
  );
}
