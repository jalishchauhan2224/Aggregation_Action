import { Router } from "express";
import { scanValidation, codeScan } from "../controller/codeScanController.js";
const scanValidationRouter = Router();

scanValidationRouter.post("/validation", scanValidation)
scanValidationRouter.post("/codescan", codeScan)

export default scanValidationRouter 