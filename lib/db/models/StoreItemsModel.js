import mongoose from "mongoose";

const storeitemsSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    text: { type: String, default: "", required: true },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "attachments",
        required: false,
      },
    ],
    price: { type: Number, default: 0, required: true },
    active: { type: Boolean, default: true, required: false },
    title: { type: String, default: "", required: false },
    category: { type: String, default: "", required: false },
    // tags: {
    //   type: Array,
    //   default: [],
    //   required: false,
    // },
    // views: { type: Number, default: 0, required: false },
    // likes: { type: Number, default: 0, required: false },
  },
  { timestamps: true, strict: true }
);

storeitemsSchema.settings = {
  hasLikes: true,
  hasViews: true,
  fields: {
    text: {
      subtype: "text",
      displayName: "Description",
    },
    title: {
      displayName: "Item Name",
    },
    price: {
      displayName: "Price",
    },
    category: {
      displayName: "Category",
    },
  },
};

export { storeitemsSchema };
