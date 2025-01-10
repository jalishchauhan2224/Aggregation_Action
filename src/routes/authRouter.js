import { Router } from "express";
import { login, logout, securityCheck } from "../controller/authController.js";
const authRouter = Router();


authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/security-check", securityCheck);
// authRouter.post("/resetpassword",resetpassword)
export default authRouter;