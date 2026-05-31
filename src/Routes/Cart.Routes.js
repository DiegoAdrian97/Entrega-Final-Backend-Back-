import { Router } from "express";
import {
  getCart,
  postCart,
  putCart,
  deleteCart,
  getCarts,
  removeProductFromCart,
  noIdPostCart,
} from "../controllers/cart.controllers.js";
import { postCompra } from "../controllers/ticket.controllers.js";
import { passportError } from "../utils/messagesError.js";

const cartRouter = Router();

cartRouter.get("/", passportError("jwt"), getCarts);
cartRouter.get("/:cid", passportError("jwt"), getCart);
cartRouter.post("/:cid/product/:pid/", passportError("jwt"), postCart);
cartRouter.post("/product/:pid/", passportError("jwt"), noIdPostCart);
cartRouter.put("/:cid/product/:pid", passportError("jwt"), putCart);
cartRouter.delete("/:cid/", passportError("jwt"), deleteCart);
cartRouter.delete("/:cid/product/:pid", passportError("jwt"), removeProductFromCart);
cartRouter.get("/:cid/purchase", passportError("jwt"), postCompra);

export default cartRouter;
