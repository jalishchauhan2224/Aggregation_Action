import { ResponseCodes } from "../../constant.js";
import prisma from "../../DB/db.config.js";
import { logAudit } from '../utils/auditLog.js'
import AggregationValidation, { aggregationTransactionCurrentStateValidation } from "../validation/aggregationTransactionValidation.js";
import { handlePrismaSuccess, handlePrismaError } from "../services/prismaResponseHandler.js";

const aggregationtran = async (req, res) => {
  try {
    console.log(req.body)
    const validation = await AggregationValidation.validateAsync(req.body);
    const { auditlog_username, auditlog_userid } = req;
    console.log(auditlog_username);

    if (!validation.productId || !validation.batchId) {
      return handlePrismaError(
        res, undefined, "Missing required fields: productId or batchId", ResponseCodes.BAD_REQUEST
      );
    }

    // Fetch generation_id for the provided productId
    const productGeneration = await prisma.productGenerationId.findFirst({
      where: {
        product_id: validation.productId,
      },
      select: {
        generation_id: true,
      },
    });

    if (!productGeneration || !productGeneration.generation_id) {
      return handlePrismaError(
        res, undefined, "Generation ID not found for the provided productId", ResponseCodes.NOT_FOUND
      )
    }

    console.log("Retrieved generation_id:", productGeneration.generation_id);

    // Fetch packaging hierarchy for the product
    const productHistory = await prisma.product_history.findFirst({
      where: {
        product_uuid: validation.productId,
      },
      select: {
        packagingHierarchy: true,
      },
    });

    console.log(productHistory)

    if (!productHistory) {
      return handlePrismaError(
        res, undefined, "Packaging hierarchy not found for the provided productId", ResponseCodes.NOT_FOUND
      );
    }

    console.log("packaging Hierarchy from productHistory", productHistory.packagingHierarchy);

    // Fetch product history ID for the batch
    const batchDetails = await prisma.batch.findFirst({
      where: {
        product_uuid: validation.productId,
      },
      select: {
        producthistory_uuid: true,
      },
    });

    if (!batchDetails) {
      return handlePrismaError(
        res, undefined, "Batch details not found for the provided productId", ResponseCodes.NOT_FOUND,
      );
    }

    console.log("product history uuid from batch", batchDetails.producthistory_uuid);

    // Check for existing aggregation transaction
    const existingAggregation = await prisma.aggregation_transaction.findFirst({
      where: {
        user_id: req.id
      },
    });
    console.log("Aaa");

    console.log(existingAggregation);
    if (existingAggregation) {
      console.log("Aggregation transaction already exists in this user");
      return handlePrismaError(
        res, undefined, "Aggregation transaction already exists for this user", ResponseCodes.CONFLICT
      )
    }


    // Create a new aggregation transaction
    const updateAggregation = await prisma.aggregation_transaction.create({
      data: {
        product_id: validation.productId,
        batch_id: validation.batchId,
        user_id: req.id,
        product_gen_id: productGeneration.generation_id,
        packagingHierarchy: productHistory.packagingHierarchy,
        producthistory_uuid: batchDetails.producthistory_uuid,
        status: validation.status,
      },
    });
    console.log("Aggregation transaction created:", updateAggregation);

    if (validation.audit_log?.audit_log) {
      await logAudit({
        performed_action: validation.audit_log.performed_action,
        remarks: validation.audit_log.remarks,
        user_name: auditlog_username,
        user_id: auditlog_userid,
      });
    }
    return handlePrismaSuccess(res, "Aggregation transaction created successfully")

  } catch (error) {
    if (error.isJoi === true) {
      return handlePrismaError(
        res, undefined, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
      )
    }

    console.log("Error in aggregationtran:", error);
    return handlePrismaError(
      res, undefined, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR
    )
  }
};

const handleAggregatedTransactionState = async (req, res) => {
  try {
    console.log(req.body)
    // Validate incoming request data
    const validatedData = await aggregationTransactionCurrentStateValidation.validateAsync(req.body);
    const { id } = req;
    // Fetch existing transaction scan state record based on user and transaction ID
    const existingState = await prisma.aggregationTransactionCurrentScanState.findFirst({
      where: {
        aggregated_transcation_id: validatedData.aggregatedTransactionId,
        user_id: id
      }
    });

    // Data to update or insert into the database
    const transactionStateData = {
      user_id: id,
      aggregated_transcation_id: validatedData.aggregatedTransactionId,
      packagedNo: validatedData.packageNo,
      currentPackageLevel: validatedData.currentPackageLevel,
      quantity: validatedData.quantity,
      perPackageProduct: validatedData.perPackageProduct,
      totalLevel: validatedData.totalLevel,
      totalProduct: validatedData.totalProduct,
      currentIndex: validatedData.currentIndex,
      scannedCode: validatedData.scannedCodes,
    };

    // Update the existing state if it exists, otherwise create a new one
    let transactionStateResult;
    if (existingState) {
      transactionStateResult = await prisma.aggregationTransactionCurrentScanState.update({
        where: { id: existingState.id },  // Assuming the table has an 'id' field to target the specific record
        data: { ...transactionStateData }
      });
    } else {
      transactionStateResult = await prisma.aggregationTransactionCurrentScanState.create({
        data: { ...transactionStateData }
      });
    }

    // Handle success
    return handlePrismaSuccess(res, "Aggregation Record has been successfully processed.", {});

  } catch (error) {
    // Handle error
    console.log(error)
    return handlePrismaError(res, undefined, error?.message, ResponseCodes.INTERNAL_SERVER_ERROR);
  }
};

export { handleAggregatedTransactionState }
export default aggregationtran; 