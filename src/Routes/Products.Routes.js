import { Router } from "express";
import {
  getProduct,
  getProducts,
  postProduct,
  putProduct,
  deleteProduct,
  postProductWImage,
} from "../controllers/products.controllers.js";
import { authorization, passportError } from "../utils/messagesError.js";

const prodsRouter = Router();

prodsRouter.get("/", getProducts);
prodsRouter.get("/:id", getProduct);
prodsRouter.post("/", passportError("jwt"), authorization("admin"), postProduct);
prodsRouter.post("/PwI", passportError("jwt"), authorization("admin"), postProductWImage);
prodsRouter.put("/:id", passportError("jwt"), authorization("admin"), putProduct);
prodsRouter.delete("/:id", passportError("jwt"), authorization("admin"), deleteProduct);

export default prodsRouter;
