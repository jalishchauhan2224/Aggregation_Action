import { handlePrismaSuccess, handlePrismaError } from "../services/prismaResponseHandler.js";
import prisma from "../../DB/db.config.js";
import { ResponseCodes } from "../../constant.js";


const getBatchesByProductId = async (request, res) => {
  console.log("batch api is running...");
  console.log(request.params)

  try {
    const batches = await prisma.batch.findMany({
      where: {
        product_uuid: request.params.productId,
      }
    }).catch(error => console.log("Error in get batches ", error));

    handlePrismaSuccess(
      res, "Get batches successfully", { batches, total: batches.length }
    );
    
  } catch (error) {
    console.log("get batches error", error);
    handlePrismaError(
      res, error, "An error occurred while getting batches.", ResponseCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export default getBatchesByProductId;