import { Router } from "express";
const productRouter = Router();
import { getCountryCodeByProductId,getAllProducts,getPackagingHierarchy } from "../controller/productController.js";

productRouter.get("/product/", getAllProducts);
productRouter.post("/packagingHierarchy/", getPackagingHierarchy);
productRouter.get("/product/countrycode/:productId", getCountryCodeByProductId);

export default productRouter