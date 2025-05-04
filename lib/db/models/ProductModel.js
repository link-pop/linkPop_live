import { cartSchema } from "./CartModel";
import mongoose from "mongoose";

// TODO move to cart folder ???
// * ################# order #################
const ordersSchema = new mongoose.Schema(
  {
    ...cartSchema.obj,
    total: { type: Number, default: 0, required: true },
    "order date": {
      type: Date,
      default: Date.now(),
      required: true,
    },
  },
  { timestamps: true }
);

ordersSchema.settings = {
  noUpdateIcon: true,
  noDeleteIcon: true,
  fields: {
    items: { isHidden: true },
  },
};

// * ################# product #################
const productsSchema = new mongoose.Schema(
  {
    files: { type: Array, default: [], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    title: { type: String, default: "", required: true },
    subtitle: { type: String, default: "", required: true },
    SKU: { type: String, default: "", required: true },
    tags: {
      type: Array,
      default: [{ value: "sale", label: "sale" }],
      required: false,
    },
    category: {
      type: Array,
      default: [],
      required: false,
    },
    price: { type: Number, default: 0, required: true },
    "discounted price": { type: Number, default: 0, required: false },
    active: { type: Boolean, default: true, required: false },
    text: {
      type: String,
      default: "",
      required: false,
    },
    views: { type: Number, default: 0, required: false },
    likes: { type: Number, default: 0, required: false },
    rating: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);
productsSchema.settings = {
  hasLikes: true,
  hasReviews: true,
  hasViews: true,
  sort: { order: 1 },
  fields: {
    text: {
      displayName: "Description",
      subtype: "text",
    },
    views: {
      isHidden: false,
    },
  },
};

export { ordersSchema, productsSchema };
