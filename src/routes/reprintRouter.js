import { Router } from "express";
import { reprint } from "../controller/reprintController.js";
const reprintRouter = Router();

reprintRouter.post("/code", reprint);

export default reprintRouter;