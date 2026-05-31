import { Schema, model } from "mongoose";
import paginate from "mongoose-paginate-v2";
import { CartModel } from "./cart.models.js";

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  thumbnail: [{ type: String }],
  role: { type: String, default: "user" },
  documents: [
    {
      name: { type: String },
      reference: { type: String },
    },
  ],
  last_connection: { type: Date, default: Date.now },
  cart: { type: Schema.Types.ObjectId, ref: "carts" },
});

userSchema.plugin(paginate);

userSchema.pre("save", async function (next) {
  try {
    if (!this.cart) {
      const newCart = await CartModel.create({ products: [], total: 0 });
      this.cart = newCart._id;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const userModel = model("users", userSchema);
