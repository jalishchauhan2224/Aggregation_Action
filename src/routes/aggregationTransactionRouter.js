import { Router } from "express";
import aggregationtran from "../controller/aggregationTransactionController.js";

const aggregationTransactionRouter = Router();

aggregationTransactionRouter.post("/addaggregation",aggregationtran)

export default aggregationTransactionRouter