import { Router } from "express";
import getBatchesByProductId from "../controller/batchController.js";

const batchRouter = Router();

batchRouter.get("/:productId", getBatchesByProductId);


export default batchRouter