"use server";

import mongoose from "mongoose";
import { getOne, update, getAll } from "@/lib/actions/crud";

// * Rewrites last message after hiding a message
export const postHideOnSuccess = async ({ post, col }) => {
  // ! for some cols only
  if (!["hiddenMessages", "chatmessages"].includes(col)) return;

  try {
    if (!post?.chatRoomId) {
      console.log("No chatRoomId found in post");
      return;
    }

    const chatRoomId = new mongoose.Types.ObjectId(post.chatRoomId);
    const postId = new mongoose.Types.ObjectId(post._id);

    // * 0: Update the hidden message's msgHiddenByOtherUser field
    await update({
      col: "chatmessages",
      data: { _id: postId },
      update: {
        msgHiddenByOtherUser: true,
      },
    });

    // * 1: Get the chat room to update its lastMessage
    const chatRoom = await getOne({
      col: "chatrooms",
      data: {
        _id: chatRoomId,
      },
    });

    if (!chatRoom) {
      console.log("No chatRoom found");
      return;
    }

    // * 2: Get all hidden messages for this chat room
    const hiddenMessages = await getAll({
      col: "hiddenMessages",
      data: {
        postId: {
          $in: await getAll({
            col: "chatmessages",
            data: { chatRoomId: post.chatRoomId },
            select: "_id",
          }).then((msgs) => msgs.map((msg) => msg._id)),
        },
      },
      select: "postId",
    });

    const hiddenMessageIds = hiddenMessages.map((msg) => msg.postId);

    // * 3: Get the last non-hidden message
    const lastMessage = await getOne({
      col: "chatmessages",
      data: {
        chatRoomId: post.chatRoomId,
        _id: {
          $ne: postId,
          $nin: hiddenMessageIds,
        },
      },
      sort: { createdAt: -1 },
    });

    // * 4: Update chatRoom's lastMessage with the ObjectId
    const updateResult = await update({
      col: "chatrooms",
      data: { _id: chatRoomId },
      update: {
        chatRoomLastMsg: lastMessage?._id
          ? new mongoose.Types.ObjectId(lastMessage._id)
          : null,
      },
    });
  } catch (error) {
    console.error("Error in postHideOnSuccess:", error);
  }
};
