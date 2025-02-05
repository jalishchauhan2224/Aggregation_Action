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
import lableRouter from "./lableRouter.js";
import printerAllocationRouter from "./printerAllocationRouter.js";
// authRouter
router.use("/api/v1/auth", authRouter);

// fetch all products
router.use("/api/v1", verifyAuthentication, productRouter)

// fetch batches based on a specific product ID
router.use("/api/v1/batch", verifyAuthentication, batchRouter)

// add an aggregation transaction
router.use("/api/v1/aggregationtransaction", verifyAuthentication, aggregationTransactionRouter)

// scanValidation
router.use("/api/v1/scan", verifyAuthentication, scanValidationRouter)

router.use("/api/v1/print", verifyAuthentication, lableRouter)
// dropout 
router.use("/api/v1/dropout", verifyAuthentication, dropoutRouter)

// reprint
router.use("/api/v1/reprint", verifyAuthentication, reprintRouter);

router.use("/api/v1/printerallocation", verifyAuthentication, printerAllocationRouter)


export default router