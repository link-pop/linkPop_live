import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", required: true },
    email: { type: String, default: "", required: true },
    message: { type: String, default: "", required: true },
  },
  { timestamps: true }
);

contactSchema.settings = {
  addPostTitle: null,
  addPostBtnText: null,
};

export const contactModel =
  mongoose.models?.contacts || mongoose.model("contacts", contactSchema);
