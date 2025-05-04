import mongoose from "mongoose";

const articlesSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    title: { type: String, default: "", required: true },
    tags: {
      type: Array,
      default: [{ value: "windows", label: "windows" }],
      required: true,
    },
    text: {
      type: String,
      default: "",
      required: false,
    },
    views: { type: Number, default: 0, required: false },
    likes: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);

articlesSchema.settings = {
  hasLikes: true,
  hasReviews: true,
  hasViews: true,
  fields: {
    title: {
      order: 1,
    },
    tags: {
      order: 2,
    },
    text: {
      order: 3,
      subtype: "text",
    },
    views: {
      isHidden: false,
      order: 4,
    },
  },
};

export const articleModel =
  mongoose.models?.articles || mongoose.model("articles", articlesSchema);
