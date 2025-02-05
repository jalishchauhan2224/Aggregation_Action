import { Router } from "express";
import { SsccLable } from "../controller/lableController.js";

const lableRouter = Router();

lableRouter.post("/", SsccLable)
export default lableRouter