import { Router } from "express";
const printerAllocationRouter = Router();
import { getPrinterAllocation, printerAllocation } from "../controller/printerAllocationController.js";

printerAllocationRouter.get("/:mac_address", getPrinterAllocation);

printerAllocationRouter.post("/", printerAllocation);


export default printerAllocationRouter