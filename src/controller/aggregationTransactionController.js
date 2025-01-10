import { ResponseCodes } from "../../constant.js";
import prisma from "../../DB/db.config.js";
import { logAudit } from '../utils/auditLog.js'

const aggregationtran = async (req, res) => {
  try {
    console.log(req.id);
      const { product_id, batch_id, esign_status, audit_log } = req.body;
    const { auditlog_username, auditlog_userid } = req;
    console.log("aa");
    
    console.log(auditlog_username);

    if (!product_id || !batch_id) {
      return res.status(ResponseCodes.BAD_REQUEST).json({
        message: "Missing required fields: product_id or batch_id",
      });
    }

    // Fetch generation_id for the provided product_id
    const productGeneration = await prisma.productGenerationId.findFirst({
      where: {
        product_id: product_id,
      },
      select: {
        generation_id: true,
      },
    });

    if (!productGeneration || !productGeneration.generation_id) {
      return res
        .status(ResponseCodes.NOT_FOUND)
        .json({ error: "Generation ID not found for the provided product_id" });
    }
    console.log("Retrieved generation_id:", productGeneration.generation_id);

    // Fetch packaging hierarchy for the product
    const productHistory = await prisma.product_history.findFirst({
      where: {
        product_uuid: product_id,
      },
      select: {
        packagingHierarchy: true,
      },
    });
    console.log("packaging Hierarchy from productHistory", productHistory.packagingHierarchy);

    // Fetch product history ID for the batch
    const batchDetails = await prisma.batch.findFirst({
      where: {
        product_uuid: product_id,
      },
      select: {
        producthistory_uuid: true,
      },
    });
    console.log("product history uuid from batch", batchDetails.producthistory_uuid);

    // Check for existing aggregation transaction
    const existingAggregation = await prisma.aggregation_transaction.findFirst({
      where: {
        user_id: req.id
      },
    });
console.log(existingAggregation);

    if (existingAggregation) {
      console.log("Aggregation transaction already exists in this user");
      res.status(ResponseCodes.CONFLICT).json({ message: "Aggregation transaction already exists in this user" });
      return;
    }

    console.log("Batch Id :", batch_id)
    // Create a new aggregation transaction
    console.log(req.id)
    const updateAggregation = await prisma.aggregation_transaction.create({
      data: {
        product_id: product_id,
        batch_id: batch_id,
        user_id: req.id,
        product_gen_id: productGeneration.generation_id,
        packagingHierarchy: productHistory.packagingHierarchy,
        producthistory_uuid: batchDetails.producthistory_uuid,
        esign_status
      },
    });

    console.log("Aggregation transaction created:", updateAggregation);
    if (audit_log?.audit_log) {
      await logAudit({
        performed_action: audit_log.performed_action,
        remarks: audit_log.remarks,
        user_name: auditlog_username,
        user_id: auditlog_userid,
      });
    }
    return res.status(ResponseCodes.OK).json({
      message: "Aggregation transaction created successfully",
      data: updateAggregation,
    });
  } catch (error) {
    console.log("Error in aggregationtran:", error);
    return res
      .status(ResponseCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error", error: error });
  }
};

export default aggregationtran;   