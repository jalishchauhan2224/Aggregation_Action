import { Router } from "express";
import aggregationtran, { handleAggregatedTransactionState } from "../controller/aggregationTransactionController.js";

const aggregationTransactionRouter = Router();

aggregationTransactionRouter.post("/addaggregation", aggregationtran)
aggregationTransactionRouter.post("/handleAggregatedTransactionScanState", handleAggregatedTransactionState)

export default aggregationTransactionRouter