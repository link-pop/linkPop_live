import mongoose from "mongoose";

const faqsSchema = new mongoose.Schema(
  {
    question: { type: String, default: "", required: true },
    answer: { type: String, default: "", required: true },
    order: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);

faqsSchema.settings = {
  displayName: "FAQ",
  noFullPost: true,
  onNavClickScroll: true,
  sort: { order: 1 },
};

export const faqModel =
  mongoose.models?.faqs || mongoose.model("faqs", faqsSchema);
