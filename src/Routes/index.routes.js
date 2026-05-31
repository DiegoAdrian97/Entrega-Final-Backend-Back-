import { Router } from "express";
import userRouter from "./users.routes.js";
import cartRouter from "./Cart.Routes.js";
import prodsRouter from "./Products.Routes.js";
import SessionRouter from "./session.routes.js";

const router = Router();

router.use("/api/users", userRouter);
router.use("/api/session", SessionRouter);
router.use("/api/products", prodsRouter);
router.use("/api/carts", cartRouter);

export default router;
