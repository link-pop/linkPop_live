// HiddenMessageModel.js

import mongoose from "mongoose";

const hiddenMessagesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "chatmessages" },
});

export { hiddenMessagesSchema };
