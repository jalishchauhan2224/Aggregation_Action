import { Router } from "express";
import { replaceCode } from "../controller/codeReplaceController.js";
const codeReplaceRouter = Router();

codeReplaceRouter.post("/", replaceCode);

export default codeReplaceRouter;  