import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  date: { type: Date, default: Date.now },
  products: [
    {
      _id: { type: Schema.Types.ObjectId, ref: "products", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, default: 0 },
});

cartSchema.pre("findOne", function () {
  this.populate("products._id");
});

export const CartModel = model("carts", cartSchema);
