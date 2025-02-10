import { Router } from "express";
const productRouter = Router();
import { getCountryCodeByProductId, getAllProducts, getPackagingHierarchy } from "../controller/productController.js";
import { aggregratedTransactionScanMiddleware } from "../middleware/aggregrateTranscationScanMiddleware.js";

productRouter.get("/product/", getAllProducts);
productRouter.post("/packagingHierarchy/", aggregratedTransactionScanMiddleware, getPackagingHierarchy,);
productRouter.get("/product/countrycode/:productId", getCountryCodeByProductId);

export default productRouter