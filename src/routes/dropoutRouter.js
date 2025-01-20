import { Router } from "express";
import { dropoutWholeBatch,dropoutCodes } from "../controller/dropoutController.js";
const dropoutRouter = Router();


dropoutRouter.post("/wholebatch", dropoutWholeBatch);
dropoutRouter.post("/codes", dropoutCodes);
export default dropoutRouter;   