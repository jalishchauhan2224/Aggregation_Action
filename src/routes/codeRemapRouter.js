import { Router } from "express";
import codeRemap from "../controller/codeRemapController.js"
const codeRemapRouter = Router();

codeRemapRouter.post("/",codeRemap);

export default codeRemapRouter