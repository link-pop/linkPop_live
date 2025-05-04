import mongoose from "mongoose";

const hiddenUsersSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  hiddenUserId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

export { hiddenUsersSchema };
