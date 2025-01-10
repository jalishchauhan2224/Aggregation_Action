import { Router } from "express";
const router = Router();
import authRouter from "./authRouter.js";
import aggregationtran from "../controller/aggregationTransactionController.js"
import verifyAuthentication from "../middleware/authMiddleware.js";
import getAllProducts, { getPackagingHierarchy } from "../controller/productController.js";
import getBatchesByProductId from "../controller/batchController.js"
import scan from "../controller/codeScanController.js";
import dropoutRouter from "./dropout.js";


// dropout
router.use("/api/v1/dropout",verifyAuthentication,dropoutRouter)


// Use the authRouter for all routes starting with "/api/v1/auth"
router.use("/api/v1/auth", authRouter);

// fetch all products
router.get("/api/v1/product/", verifyAuthentication, getAllProducts);
router.post("/api/v1/packagingHierarchy/", verifyAuthentication, getPackagingHierarchy);


// fetch batches based on a specific product ID
router.get("/api/v1/batch/:productId", verifyAuthentication, getBatchesByProductId);

// add an aggregation transaction
router.post("/api/v1/aggregationtransaction/addaggregation", verifyAuthentication, aggregationtran)


router.post("/api/v1/scan", verifyAuthentication, scan)



export default router