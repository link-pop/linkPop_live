// fetchHiddenUsers.js
import mongoose from "mongoose";
import { getAll } from "./crud";

export const fetchHiddenUsers = async (mongoUser) => {
  if (!mongoUser?._id) return [];

  const hiddenUsers = await getAll({
    col: "hiddenUsers",
    data: {
      userId: mongoUser._id,
    },
  });

  return Array.isArray(hiddenUsers)
    ? hiddenUsers.map((hidden) => {
        const hiddenUserId = hidden.hiddenUserId?._id || hidden.hiddenUserId;
        return new mongoose.Types.ObjectId(hiddenUserId);
      })
    : [];
};