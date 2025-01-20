import { Router } from "express";
import scanValidation from "../controller/codeScanController.js";

const scanValidationRouter = Router();

scanValidationRouter.post("/", scanValidation)


export default scanValidationRouter 