import { Router } from "express";
const router = Router();
import authRouter from "./authRouter.js";
import verifyAuthentication from "../middleware/authMiddleware.js";
import dropoutRouter from "./dropoutRouter.js";
import productRouter from "./productRouter.js";
import batchRouter from "./batchRouter.js";
import aggregationTransactionRouter from "./aggregationTransactionRouter.js";
import scanValidationRouter from "./scanValidationRouter.js";
import reprintRouter from "./reprintRouter.js";
import { codeScan } from "../controller/codeScanController.js";
// authRouter
router.use("/api/v1/auth", authRouter);

// fetch all products
router.use("/api/v1", verifyAuthentication, productRouter)

// fetch batches based on a specific product ID
router.use("/api/v1/batch", verifyAuthentication, batchRouter)


// add an aggregation transaction
router.use("/api/v1/aggregationtransaction", verifyAuthentication, aggregationTransactionRouter)

// scanValidation
router.use("/api/v1/scanvalidation", verifyAuthentication, scanValidationRouter)

//code scan
router.use("/api/v1/codeScan", verifyAuthentication, codeScan)

// dropout 
router.use("/api/v1/dropout", verifyAuthentication, dropoutRouter)

// reprint
router.use("/api/v1", verifyAuthentication, reprintRouter);

export default router