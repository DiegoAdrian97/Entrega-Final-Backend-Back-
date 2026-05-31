import { Router } from "express";
import { passportError } from "../utils/messagesError.js";
import {
  getAll,
  getById,
  putById,
  deleteByid,
  pwRecovery,
  pwReset,
  documentsUpload,
  profilePicsUpload,
  prodPicsUpload,
  deleteInactiveUser,
} from "../controllers/users.controllers.js";
import { Docs, ProfPics, prodPics } from "../utils/multer.js";

const userRouter = Router();

userRouter.get("/", passportError("jwt"), getAll);
userRouter.get("/:uid", passportError("jwt"), getById);
userRouter.put("/:uid", passportError("jwt"), putById);
userRouter.delete("/:uid", passportError("jwt"), deleteByid);
userRouter.delete("/delete/delete", passportError("jwt"), deleteInactiveUser);

userRouter.post("/password-recovery", pwRecovery);
userRouter.post("/reset-password/:token", pwReset);

userRouter.post("/docsUpload", passportError("jwt"), Docs.single("img"), documentsUpload);
userRouter.post("/:uid/profPicsUpload", passportError("jwt"), ProfPics.single("img"), profilePicsUpload);
userRouter.post("/prodPicsUpload", passportError("jwt"), prodPics.single("img"), prodPicsUpload);

export default userRouter;
