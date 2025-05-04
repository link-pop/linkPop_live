import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    userId: { type: String, required: true },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        // ! qookeys specific: Add activation keys to each item
        activationKey: { type: String, required: false },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.settings = {
  fields: {
    items: { isHidden: true },
  },
};

export { cartSchema };
