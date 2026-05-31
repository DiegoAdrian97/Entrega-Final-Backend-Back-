import { Router } from "express";
import passport from "passport";
import { passportError } from "../utils/messagesError.js";
import { current, login, logout, register } from "../controllers/sessions.controllers.js";

const SessionRouter = Router();

SessionRouter.post("/login", passport.authenticate("login"), login);
SessionRouter.post("/register", passport.authenticate("register"), register);
SessionRouter.get("/logout", logout);
SessionRouter.get("/current", passportError("jwt"), current);

export default SessionRouter;
